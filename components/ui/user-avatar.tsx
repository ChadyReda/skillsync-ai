import Image from "next/image";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserAvatarProps {
  imageUrl?: string | null;
  name: string;
  className?: string;
  textClassName?: string;
}

export function UserAvatar({
  imageUrl,
  name,
  className = "h-9 w-9",
  textClassName = "text-xs",
}: UserAvatarProps) {
  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border border-zinc-800 bg-zinc-950",
          className,
        )}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="128px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-zinc-800 bg-zinc-900",
        className,
      )}
    >
      <span className={cn("font-mono font-semibold text-zinc-300", textClassName)}>
        {getInitials(name)}
      </span>
    </div>
  );
}
