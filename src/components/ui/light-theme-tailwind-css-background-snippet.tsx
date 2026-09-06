import { cn } from "@/lib/utils";

export const RadialBackground = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn("absolute inset-0 z-0 size-full pointer-events-none", className)}
      style={{
        backgroundColor: "#f9fafb",
        backgroundImage:
          "radial-gradient(circle at center, #52525b 1.5px, transparent 1.6px), radial-gradient(circle at center, rgba(0, 0, 0, 0.15) 3.5px, transparent 3.8px)",
        backgroundSize: "24px 24px",
        maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
      }}
    />
  );
};
