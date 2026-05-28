"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, createLocalAudioTrack } from "livekit-client";

export type CallPhase =
  | "idle"
  | "connecting"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

type Message = { role: "user" | "assistant"; content: string };

const ROOM_NAME = "hilo-ai-room";

// VAD tuning
const SPEECH_START_THRESHOLD = 20;  // energy (0-255) to begin recording
const SPEECH_END_THRESHOLD   = 12;  // energy below this counts as silence
const SILENCE_MS             = 700; // consecutive silence before utterance ends
const MIN_SPEECH_MS          = 400; // ignore clips shorter than this

export function useVoiceCall() {
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Message[]>([]);

  const roomRef      = useRef<Room | null>(null);
  const activeRef    = useRef(false);
  const phaseRef     = useRef<CallPhase>("idle");
  const historyRef   = useRef<Message[]>([]);
  const streamRef    = useRef<MediaStream | null>(null);
  const rafRef       = useRef<number | null>(null);
  const lastReplyRef = useRef<string>("");           // last assistant reply → Whisper prompt
  const startRecRef  = useRef<(() => void) | null>(null);

  const updatePhase = useCallback((p: CallPhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  useEffect(() => { historyRef.current = history; }, [history]);

  // ─── TTS ─────────────────────────────────────────────────────────────────

  const getBestVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    for (const name of [
      "Google US English",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Guy Online (Natural) - English (United States)",
      "Samantha", "Karen",
    ]) {
      const v = voices.find((v) => v.name === name);
      if (v) return v;
    }
    return voices.find((v) => v.lang.startsWith("en")) ?? null;
  };

  const speakText = useCallback(async (text: string) => {
    lastReplyRef.current = text;
    try {
      const res = await fetch("/api/hilo/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const ctx = new AudioContext();
        const audioBuf = await ctx.decodeAudioData(buf);
        await new Promise<void>((resolve) => {
          const src = ctx.createBufferSource();
          src.buffer = audioBuf;
          src.connect(ctx.destination);
          src.onended = () => { ctx.close(); resolve(); };
          src.start();
        });
        return;
      }
    } catch { /* fall through */ }

    await new Promise<void>((resolve) => {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      const v = getBestVoice();
      if (v) utt.voice = v;
      utt.rate = 1.1;
      utt.onend = () => resolve();
      utt.onerror = () => resolve();
      window.speechSynthesis.speak(utt);
    });
  }, []);

  // ─── LLM pipeline ────────────────────────────────────────────────────────

  const processTranscript = useCallback(async (text: string) => {
    if (!activeRef.current || !text.trim()) return;

    updatePhase("processing");
    setTranscript(text);
    setReply("");

    try {
      const userMsg: Message = { role: "user", content: text };
      const updated = [...historyRef.current, userMsg];

      const chatRes = await fetch("/api/hilo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      if (!chatRes.ok) throw new Error("LLM failed");

      let assistantText = "";
      const reader = chatRes.body!.getReader();
      const decoder = new TextDecoder();
      updatePhase("speaking");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (raw === "[DONE]") break;
          try {
            const { content } = JSON.parse(raw);
            if (content) { assistantText += content; setReply(assistantText); }
          } catch { /* skip */ }
        }
      }

      if (assistantText && activeRef.current) {
        const newHistory: Message[] = [
          ...updated,
          { role: "assistant", content: assistantText },
        ];
        historyRef.current = newHistory;
        setHistory(newHistory);
        await speakText(assistantText);
      }

      if (activeRef.current) {
        updatePhase("listening");
        setTranscript("");
        setReply("");
        startRecRef.current?.();
      }
    } catch (err) {
      console.error("[hilo]", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      updatePhase("error");
    }
  }, [updatePhase, speakText]);

  // ─── VAD + Groq Whisper STT ───────────────────────────────────────────────

  const startRecognition = useCallback(() => {
    if (!activeRef.current || phaseRef.current !== "listening") return;

    const stream = streamRef.current;
    if (!stream) return;

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const audioCtx  = new AudioContext();
    const analyser  = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    audioCtx.createMediaStreamSource(stream).connect(analyser);

    // Frequency-domain energy focused on speech band (200 Hz – 4 kHz)
    const freqData  = new Uint8Array(analyser.frequencyBinCount);
    const binHz     = audioCtx.sampleRate / analyser.fftSize;
    const loIdx     = Math.floor(200  / binHz);
    const hiIdx     = Math.ceil(4000  / binHz);

    const getEnergy = () => {
      analyser.getByteFrequencyData(freqData);
      let sum = 0;
      for (let i = loIdx; i <= hiIdx; i++) sum += freqData[i];
      return sum / (hiIdx - loIdx + 1);
    };

    const chunks: Blob[]  = [];
    const recorder        = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    let isSpeaking    = false;
    let speechStart   = 0;
    let silenceStart  = 0;
    let smoothed      = 0;

    recorder.onstop = async () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      audioCtx.close().catch(() => {});

      if (!activeRef.current) return;

      const speechDuration = Date.now() - speechStart;
      const blob = new Blob(chunks, { type: mimeType });
      chunks.length = 0;

      if (blob.size < 1000 || speechDuration < MIN_SPEECH_MS) {
        if (activeRef.current && phaseRef.current === "listening") startRecRef.current?.();
        return;
      }

      try {
        const fd = new FormData();
        fd.append("audio", blob, "recording.webm");
        // Give Whisper the last AI reply as context — dramatically improves accuracy
        if (lastReplyRef.current) fd.append("prompt", lastReplyRef.current.slice(0, 200));

        const res = await fetch("/api/hilo/stt", { method: "POST", body: fd });
        if (!activeRef.current) return;
        if (!res.ok) throw new Error("STT failed");

        const { transcript: sttText } = await res.json();
        if (sttText?.trim()) {
          await processTranscript(sttText.trim());
        } else if (activeRef.current && phaseRef.current === "listening") {
          startRecRef.current?.();
        }
      } catch (err) {
        console.error("[hilo/stt]", err);
        if (activeRef.current) startRecRef.current?.();
      }
    };

    const tick = () => {
      if (!activeRef.current || phaseRef.current !== "listening") {
        if (recorder.state === "recording") recorder.stop();
        else audioCtx.close().catch(() => {});
        return;
      }

      const raw  = getEnergy();
      // Exponential moving average to smooth out transient noise
      smoothed   = 0.6 * smoothed + 0.4 * raw;
      const now  = Date.now();

      if (!isSpeaking) {
        if (smoothed >= SPEECH_START_THRESHOLD) {
          isSpeaking  = true;
          speechStart = now;
          silenceStart = now;
          chunks.length = 0;
          recorder.start(50);
        }
      } else {
        if (smoothed < SPEECH_END_THRESHOLD) {
          if (now - silenceStart >= SILENCE_MS) {
            isSpeaking = false;
            if (recorder.state === "recording") { recorder.stop(); return; }
          }
        } else {
          silenceStart = now;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [processTranscript]);

  useEffect(() => { startRecRef.current = startRecognition; }, [startRecognition]);

  // ─── Start / end call ────────────────────────────────────────────────────

  const startCall = useCallback(async () => {
    setError("");
    setTranscript("");
    setReply("");
    setHistory([]);
    historyRef.current  = [];
    lastReplyRef.current = "";
    activeRef.current   = true;
    updatePhase("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      // LiveKit is optional
      try {
        const tokenRes = await fetch("/api/hilo/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: ROOM_NAME }),
        });
        if (tokenRes.ok) {
          const { token } = await tokenRes.json();
          const room = new Room({ adaptiveStream: true, dynacast: true });
          roomRef.current = room;
          room.on(RoomEvent.Disconnected, () => {
            if (activeRef.current) { setError("Disconnected"); updatePhase("error"); }
          });
          await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);
          const track = await createLocalAudioTrack({ echoCancellation: true, noiseSuppression: true, autoGainControl: true });
          await room.localParticipant.publishTrack(track);
        }
      } catch (e) { console.warn("[hilo/livekit]", e); }

      updatePhase("listening");
      startRecognition();
    } catch (err) {
      console.error("[hilo/connect]", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      updatePhase("error");
    }
  }, [updatePhase, startRecognition]);

  const endCall = useCallback(() => {
    activeRef.current = false;
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    window.speechSynthesis?.cancel();
    roomRef.current?.disconnect();
    roomRef.current = null;
    updatePhase("idle");
    setTranscript("");
    setReply("");
  }, [updatePhase]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      window.speechSynthesis?.cancel();
      roomRef.current?.disconnect();
    };
  }, []);

  return { phase, transcript, reply, error, history, startCall, endCall };
}
