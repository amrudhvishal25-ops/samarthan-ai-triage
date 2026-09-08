import { cn } from "@/lib/utils";

export const RadialBackground = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 z-0 size-full pointer-events-none overflow-hidden", className)}>
      {/* 21st-Century Ambient Light Glow */}
      <div
        className="absolute inset-0 size-full"
        style={{
          background:
            "radial-gradient(100% 70% at 50% -5%, rgba(30, 58, 95, 0.06) 0%, transparent 70%)",
        }}
      />
      {/* Supabase-Grade Delicate Dot Matrix */}
      <div
        className="absolute inset-0 size-full opacity-60 dark:opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(24, 24, 27, 0.12) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(ellipse 80% 65% at 50% 35%, black 35%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 65% at 50% 35%, black 35%, transparent 90%)",
        }}
      />
      {/* Smooth bottom fade into page background */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--background)] to-transparent" />
    </div>
  );
};
