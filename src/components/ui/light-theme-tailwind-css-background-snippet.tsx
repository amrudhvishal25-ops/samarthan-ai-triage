import { cn } from "@/lib/utils";

export const RadialBackground = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn("absolute inset-0 -z-10 size-full pointer-events-none", className)}
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: "radial-gradient(#d4d4d8 1.25px, transparent 1.25px)",
        backgroundSize: "22px 22px",
        maskImage: "radial-gradient(ellipse 85% 75% at 50% 25%, #000 65%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 25%, #000 65%, transparent 100%)",
      }}
    />
  );
};
