"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ContainerTextFlipProps {
  words?: string[];
  interval?: number;
  className?: string;
  textClassName?: string;
}

export function ContainerTextFlip({
  words = ["faster", "smarter", "with AI"],
  interval = 2800,
  className,
  textClassName,
}: ContainerTextFlipProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      interval,
    );
    return () => clearInterval(id);
  }, [words, interval]);

  const current = words[index];

  return (
    <span
      className={cn(
        "relative inline-flex items-baseline align-baseline",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          initial={{ y: "0.4em", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-0.4em", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
          className={cn(
            "inline-flex bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent",
            textClassName,
          )}
        >
          {current.split("").map((ch, i) => (
            <motion.span
              key={`${current}-${i}`}
              initial={{ y: "0.4em", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.35,
                delay: i * 0.025,
                ease: [0.22, 0.61, 0.36, 1],
              }}
              className="inline-block whitespace-pre"
            >
              {ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
