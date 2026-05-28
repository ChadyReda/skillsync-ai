import MessageButton from "./message-button";

interface UserCardProps {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="flex items-center justify-between border border-zinc-800 bg-zinc-950 p-4">
      <div>
        <h2 className="font-semibold text-white">{user.email}</h2>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {user.role}
        </p>
      </div>

      <MessageButton userId={user.id} />
    </div>
  );
}
