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
const SPEECH_START_THRESHOLD = 20;
const SPEECH_END_THRESHOLD   = 12;
const SILENCE_MS             = 700;
const MIN_SPEECH_MS          = 400;
// Cap history to prevent payload from growing unboundedly across a long session
const MAX_HISTORY            = 20;

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
  const lastReplyRef = useRef<string>("");
  const startRecRef  = useRef<(() => void) | null>(null);
  // Persistent VAD AudioContext reused across recognition cycles — avoids the
  // browser's ~6-context limit that causes freezing after several voice turns.
  const vadCtxRef    = useRef<AudioContext | null>(null);
  // Current TTS AudioContext — tracked so endCall can close it if playback is
  // interrupted mid-stream (otherwise onended never fires → context leaks).
  const ttsCtxRef    = useRef<AudioContext | null>(null);

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
        // Close any previous TTS context before creating a new one
        ttsCtxRef.current?.close().catch(() => {});
        const ctx = new AudioContext();
        ttsCtxRef.current = ctx;
        const audioBuf = await ctx.decodeAudioData(buf);
        await new Promise<void>((resolve) => {
          const src = ctx.createBufferSource();
          src.buffer = audioBuf;
          src.connect(ctx.destination);
          src.onended = () => {
            ctx.close().catch(() => {});
            if (ttsCtxRef.current === ctx) ttsCtxRef.current = null;
            resolve();
          };
          src.start();
        });
        return;
      }
    } catch { /* fall through to speech synthesis */ }

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
      // Keep only recent history so the payload stays small
      const updated = [...historyRef.current, userMsg].slice(-MAX_HISTORY);

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
          } catch { /* skip malformed chunk */ }
        }
      }

      if (assistantText && activeRef.current) {
        const newHistory: Message[] = [
          ...updated,
          { role: "assistant" as const, content: assistantText },
        ].slice(-MAX_HISTORY);
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

    // Cancel any stale RAF loop before starting a new cycle
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    // Reuse the persistent VAD AudioContext across recognition cycles so we
    // don't hit the browser's concurrent-AudioContext limit (~6).
    if (!vadCtxRef.current || vadCtxRef.current.state === "closed") {
      vadCtxRef.current = new AudioContext();
    }
    const audioCtx = vadCtxRef.current;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const freqData = new Uint8Array(analyser.frequencyBinCount);
    const binHz    = audioCtx.sampleRate / analyser.fftSize;
    const loIdx    = Math.floor(200  / binHz);
    const hiIdx    = Math.ceil(4000  / binHz);

    const getEnergy = () => {
      analyser.getByteFrequencyData(freqData);
      let sum = 0;
      for (let i = loIdx; i <= hiIdx; i++) sum += freqData[i];
      return sum / (hiIdx - loIdx + 1);
    };

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    let isSpeaking   = false;
    let speechStart  = 0;
    let silenceStart = 0;
    let smoothed     = 0;

    recorder.onstop = async () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      // Disconnect nodes from the shared context — do NOT close vadCtxRef here
      source.disconnect();
      analyser.disconnect();

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
        if (recorder.state === "recording") {
          recorder.stop(); // onstop will disconnect source/analyser
        } else {
          source.disconnect();
          analyser.disconnect();
        }
        return;
      }

      const raw = getEnergy();
      smoothed  = 0.6 * smoothed + 0.4 * raw;
      const now = Date.now();

      if (!isSpeaking) {
        if (smoothed >= SPEECH_START_THRESHOLD) {
          isSpeaking   = true;
          speechStart  = now;
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
    historyRef.current   = [];
    lastReplyRef.current = "";
    activeRef.current    = true;
    updatePhase("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

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
    vadCtxRef.current?.close().catch(() => {});
    vadCtxRef.current = null;
    ttsCtxRef.current?.close().catch(() => {});
    ttsCtxRef.current = null;
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
      vadCtxRef.current?.close().catch(() => {});
      ttsCtxRef.current?.close().catch(() => {});
      roomRef.current?.disconnect();
    };
  }, []);

  return { phase, transcript, reply, error, history, startCall, endCall };
}
