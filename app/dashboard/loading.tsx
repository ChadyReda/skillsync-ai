export default function DashboardLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <HiloLoader />
    </div>
  );
}

function HiloLoader() {
  return (
    <div className="flex flex-col items-center">
      {/* Animated square stack */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        {/* Outer square — slow rotation */}
        <span
          className="absolute h-16 w-16 border border-zinc-700"
          style={{
            animation: "hilo-spin-cw 3s linear infinite",
          }}
        />
        {/* Middle square — counter-rotation, slightly offset */}
        <span
          className="absolute h-10 w-10 border border-zinc-500"
          style={{
            animation: "hilo-spin-ccw 2s linear infinite",
          }}
        />
        {/* Inner square — solid, pulses */}
        <span
          className="absolute h-4 w-4 bg-white"
          style={{
            animation: "hilo-breathe 1.6s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes hilo-spin-cw  { to { transform: rotate(360deg);  } }
        @keyframes hilo-spin-ccw { to { transform: rotate(-360deg); } }
        @keyframes hilo-breathe  {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1);    }
        }
      `}</style>
    </div>
  );
}
