"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "@clerk/nextjs";
import { getSocket } from "@/lib/socket/client";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  ArrowLeft,
  Send,
  Loader2,
  User,
  MessageCircle,
  ImageIcon,
  Mic,
  X,
  Check,
  ZoomIn,
  ImageOff,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

type MessageType = "text" | "image" | "audio";

interface Message {
  id: string;
  content: string | null;
  senderId: string;
  senderEmail: string;
  createdAt: Date | null;
  messageType: MessageType;
  fileUrl?: string | null;
}

interface ChatRoomProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  partnerName: string;
  partnerRole: string | null;
  partnerImageUrl?: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

// ─── Image compression (client-side, before upload) ───────────────────────────

async function compressImage(file: File): Promise<File> {
  // GIFs would lose animation if re-encoded; skip tiny files too
  if (file.type === "image/gif" || file.size < 150 * 1024) return file;

  const MAX_SIDE = 1920;
  // Adaptive quality: more aggressive on larger files
  const quality =
    file.size > 3 * 1024 * 1024 ? 0.72 : file.size > 1024 * 1024 ? 0.80 : 0.88;

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_SIDE || height > MAX_SIDE) {
        const ratio = Math.min(MAX_SIDE / width, MAX_SIDE / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          // Fall back to original if compression made it larger
          if (!blob || blob.size >= file.size) { resolve(file); return; }
          resolve(
            new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
          );
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeLabel(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

// ─── ChatImage — handles loading skeleton + hover-to-zoom cue ─────────────────

function ChatImage({
  src,
  onOpenLightbox,
}: {
  src: string;
  onOpenLightbox: () => void;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const imgRef = useRef<HTMLImageElement>(null);

  // Catch images that are already in the browser cache — they fire `load`
  // synchronously during render, before React can attach the onLoad handler.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      setStatus(img.naturalWidth > 0 ? "loaded" : "error");
    }
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Skeleton while loading */}
      {status === "loading" && (
        <div className="flex h-44 w-full animate-pulse items-center justify-center bg-zinc-800">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="flex h-32 w-full items-center justify-center gap-2 bg-zinc-900 text-xs text-zinc-500">
          <ImageOff className="h-4 w-4" />
          Could not load image
        </div>
      )}

      {/* The actual image — hidden until loaded */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        style={{ display: status === "loaded" ? "block" : "none" }}
        className="max-h-64 w-full cursor-zoom-in object-cover"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        onClick={onOpenLightbox}
      />

      {/* Hover overlay with zoom hint */}
      {status === "loaded" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
          <ZoomIn className="h-6 w-6 text-white drop-shadow" />
        </div>
      )}
    </div>
  );
}

// ─── Typing dots ───────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-end gap-0.5 px-1 py-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ChatRoom({
  conversationId,
  currentUserId,
  initialMessages,
  partnerName,
  partnerRole,
  partnerImageUrl,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { session } = useSession();

  const { startUpload: uploadImage, isUploading: uploadingImage } =
    useUploadThing("chatImageUploader");
  const { startUpload: uploadAudio, isUploading: uploadingAudio } =
    useUploadThing("chatAudioUploader");

  const isUploadingFile = uploadingImage || uploadingAudio;

  // ── Socket ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!session) return;

    let socket: ReturnType<typeof getSocket> | null = null;
    let handleMessage: ((msg: {
      id: string;
      content: string | null;
      senderId: string;
      senderEmail: string;
      createdAt: string;
      messageType: MessageType;
      fileUrl: string | null;
      optimisticId?: string;
    }) => void) | null = null;

    const handlePartnerTyping = () => {
      setIsPartnerTyping(true);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
      // Safety fallback: clear after 5s in case stop-typing is never received
      partnerTypingTimeoutRef.current = setTimeout(() => setIsPartnerTyping(false), 5000);
    };

    const handlePartnerStopTyping = () => {
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
      setIsPartnerTyping(false);
    };

    session.getToken().then((token) => {
      if (!token) return;

      socket = getSocket(token);
      socketRef.current = socket;
      socket.emit("join-conversation", conversationId);

      handleMessage = (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          const incoming: Message = {
            ...msg,
            createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
          };
          if (msg.optimisticId) {
            const idx = prev.findIndex((m) => m.id === msg.optimisticId);
            if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = incoming;
              return copy;
            }
          }
          return [...prev, incoming];
        });
      };

      socket.on("new-message", handleMessage);
      socket.on("partner-typing", handlePartnerTyping);
      socket.on("partner-stop-typing", handlePartnerStopTyping);
      socket.on("error", (err: { message: string }) =>
        console.error("[socket] error:", err.message)
      );
      socket.on("connect_error", (err) =>
        console.error("[socket] connect_error:", err.message)
      );
    });

    return () => {
      if (socket) {
        socket.emit("leave-conversation", conversationId);
        if (handleMessage) socket.off("new-message", handleMessage);
        socket.off("partner-typing", handlePartnerTyping);
        socket.off("partner-stop-typing", handlePartnerStopTyping);
      }
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
    };
  }, [conversationId, session]);

  // ── Scroll to bottom ───────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  // ── Lightbox keyboard close ────────────────────────────────────────────────

  useEffect(() => {
    if (!lightboxSrc) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxSrc(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [lightboxSrc]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
    };
  }, []);

  // ── Typing emit helpers ────────────────────────────────────────────────────

  const emitTyping = () => {
    if (!socketRef.current) return;
    socketRef.current.emit("typing", { conversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop-typing", { conversationId });
    }, 2000);
  };

  const emitStopTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current?.emit("stop-typing", { conversationId });
  };

  // ── Text send ──────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!content.trim() || sending || !socketRef.current) return;
    const text = content.trim();
    const optimisticId = `opt-${Date.now()}`;
    emitStopTyping();
    setContent("");
    setSending(true);
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        content: text,
        senderId: currentUserId,
        senderEmail: "",
        createdAt: new Date(),
        messageType: "text",
        fileUrl: null,
      },
    ]);
    socketRef.current.emit("send-message", { conversationId, content: text, optimisticId });
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Image send ─────────────────────────────────────────────────────────────

  const handleImageSend = async (file: File) => {
    const optimisticId = `opt-${Date.now()}`;
    // Show original locally for instant preview while we compress + upload
    const previewUrl = URL.createObjectURL(file);
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        content: null,
        senderId: currentUserId,
        senderEmail: "",
        createdAt: new Date(),
        messageType: "image",
        fileUrl: previewUrl,
      },
    ]);
    try {
      const compressed = await compressImage(file);
      const uploaded = await uploadImage([compressed]);
      const fileUrl = uploaded?.[0]?.ufsUrl;
      if (!fileUrl || !socketRef.current) return;
      socketRef.current.emit("send-file", {
        conversationId,
        fileUrl,
        messageType: "image",
        optimisticId,
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    }
  };

  // ── Audio recording ────────────────────────────────────────────────────────

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      durationTimerRef.current = setInterval(() => setRecordingDuration((d) => d + 1), 1000);
    } catch {
      console.error("Microphone access denied");
    }
  };

  const cancelRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    stopStream();
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const sendRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    const optimisticId = `opt-${Date.now()}`;

    recorder.onstop = async () => {
      const mimeType = recorder.mimeType || "audio/webm";
      const ext = mimeType.includes("ogg") ? "ogg" : "webm";
      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: mimeType });
      stopStream();
      setIsRecording(false);
      setRecordingDuration(0);
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];

      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          content: null,
          senderId: currentUserId,
          senderEmail: "",
          createdAt: new Date(),
          messageType: "audio",
          fileUrl: null,
        },
      ]);
      try {
        const uploaded = await uploadAudio([file]);
        const fileUrl = uploaded?.[0]?.ufsUrl;
        if (!fileUrl || !socketRef.current) return;
        socketRef.current.emit("send-file", {
          conversationId,
          fileUrl,
          messageType: "audio",
          optimisticId,
        });
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
    };

    recorder.stop();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex h-[calc(100dvh-3.5rem)] flex-col bg-black lg:h-dvh">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4">
          <Link
            href="/dashboard/chat"
            className="flex h-8 w-8 items-center justify-center border border-zinc-800 bg-black text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>

          <UserAvatar imageUrl={partnerImageUrl} name={partnerName} className="h-9 w-9" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-white">{partnerName}</p>
            {partnerRole && (
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                {partnerRole}
              </p>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 border border-zinc-800 bg-black px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            <MessageCircle className="h-3 w-3" />
            Chat
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && !isPartnerTyping && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center border border-zinc-800 bg-zinc-950">
                <User className="h-6 w-6 text-zinc-600" />
              </div>
              <p className="font-medium text-zinc-400">Start the conversation</p>
              <p className="mt-1 text-sm text-zinc-600">Say hi to {partnerName}</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isMe = msg.senderId === currentUserId;
            const prevMsg = messages[i - 1];
            const nextMsg = messages[i + 1];
            const isSameAsPrev = prevMsg?.senderId === msg.senderId;
            const isSameAsNext = nextMsg?.senderId === msg.senderId;
            const showTimestamp =
              !isSameAsNext ||
              (nextMsg && timeLabel(msg.createdAt) !== timeLabel(nextMsg.createdAt));

            return (
              <div
                key={msg.id}
                className={[
                  "flex",
                  isMe ? "justify-end" : "justify-start",
                  isSameAsPrev ? "mt-0.5" : "mt-4",
                ].join(" ")}
              >
                {!isMe && (
                  <div className="mr-2 w-7 shrink-0 self-end">
                    {!isSameAsNext && (
                      <UserAvatar
                        imageUrl={partnerImageUrl}
                        name={partnerName}
                        className="h-7 w-7"
                        textClassName="text-[10px]"
                      />
                    )}
                  </div>
                )}

                <div className="group flex max-w-[72%] flex-col sm:max-w-[60%]">
                  <div
                    className={[
                      "overflow-hidden break-words",
                      isMe
                        ? "border border-white bg-white text-black"
                        : "border border-zinc-800 bg-zinc-950 text-zinc-100",
                      msg.messageType === "text"
                        ? "whitespace-pre-wrap px-4 py-2.5 text-sm leading-relaxed"
                        : "",
                    ].join(" ")}
                  >
                    {msg.messageType === "text" && (msg.content ?? "")}

                    {msg.messageType === "image" && (
                      msg.fileUrl ? (
                        <ChatImage
                          src={msg.fileUrl}
                          onOpenLightbox={() => setLightboxSrc(msg.fileUrl!)}
                        />
                      ) : (
                        <div className="flex h-44 w-full animate-pulse items-center justify-center bg-zinc-800">
                          <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
                        </div>
                      )
                    )}

                    {msg.messageType === "audio" && (
                      <div className="px-3 py-2">
                        {msg.fileUrl ? (
                          <audio controls src={msg.fileUrl} className="w-full min-w-[220px]" />
                        ) : (
                          <div className="flex min-w-[180px] items-center gap-2 py-1">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
                            <span className="text-xs text-zinc-500">Uploading…</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {showTimestamp && (
                    <span
                      className={[
                        "mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600",
                        isMe ? "text-right" : "text-left",
                      ].join(" ")}
                    >
                      {timeLabel(msg.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isPartnerTyping && (
            <div className="mt-4 flex items-end gap-2">
              <div className="w-7 shrink-0">
                <UserAvatar
                  imageUrl={partnerImageUrl}
                  name={partnerName}
                  className="h-7 w-7"
                  textClassName="text-[10px]"
                />
              </div>
              <div className="border border-zinc-800 bg-zinc-950 px-3 py-2.5">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Hidden image input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageSend(file);
            e.target.value = "";
          }}
        />

        {/* Input bar */}
        <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-4 pb-4 pt-3">
          <div
            className={[
              "flex items-center gap-2 border px-4 py-3 transition-colors",
              isRecording
                ? "border-red-800 bg-zinc-950"
                : "border-zinc-800 bg-black focus-within:border-zinc-600",
            ].join(" ")}
          >
            {isRecording ? (
              <>
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="flex h-8 w-8 shrink-0 items-center justify-center border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <div className="flex flex-1 items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                  <span className="font-mono text-sm tabular-nums text-red-400">
                    {formatDuration(recordingDuration)}
                  </span>
                  <span className="text-xs text-zinc-600">Recording…</span>
                </div>

                <button
                  type="button"
                  onClick={sendRecording}
                  disabled={uploadingAudio}
                  className="flex h-8 w-8 shrink-0 items-center justify-center border border-white bg-white text-black transition-colors hover:bg-zinc-100 disabled:opacity-40"
                >
                  {uploadingAudio ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingFile || sending}
                  title="Send image"
                  className="flex h-8 w-8 shrink-0 items-center justify-center border border-zinc-800 text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5" />
                  )}
                </button>

                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (e.target.value.trim()) {
                      emitTyping();
                    } else {
                      emitStopTyping();
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${partnerName}...`}
                  rows={1}
                  disabled={isUploadingFile}
                  className="max-h-32 flex-1 resize-none bg-transparent text-sm leading-relaxed text-white placeholder-zinc-600 focus:outline-none disabled:opacity-50"
                  style={{ minHeight: "24px" }}
                />

                {content.trim() ? (
                  <button
                    onClick={handleSend}
                    disabled={sending || isUploadingFile}
                    className="flex h-8 w-8 shrink-0 items-center justify-center border border-white bg-white text-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={isUploadingFile || sending}
                    title="Record voice message"
                    className="flex h-8 w-8 shrink-0 items-center justify-center border border-zinc-800 text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Mic className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
          </div>

          {!isRecording && (
            <p className="mt-1.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">
              Enter to send · Shift+Enter for newline
            </p>
          )}
        </div>
      </div>

      {/* ── Image lightbox ──────────────────────────────────────────────────── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
        >
          {/* Close button */}
          <button
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-zinc-700 bg-zinc-900 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            onClick={() => setLightboxSrc(null)}
          >
            <X className="h-4 w-4" />
          </button>

          {/* Hint */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Click anywhere or press Esc to close
          </p>

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[88vh] max-w-[88vw] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
