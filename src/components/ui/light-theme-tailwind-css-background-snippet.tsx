import { cn } from "@/lib/utils";

export const RadialBackground = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn("absolute inset-0 -z-10 size-full pointer-events-none", className)}
      style={{
        backgroundColor: "#F3F4F6",
        backgroundImage:
          "radial-gradient(circle at center, rgba(15, 23, 42, 0.48) 1.5px, transparent 1.6px), radial-gradient(circle at center, rgba(15, 23, 42, 0.18) 3.2px, transparent 3.6px)",
        backgroundSize: "24px 24px",
        maskImage: "radial-gradient(ellipse 95% 90% at 50% 40%, #000 80%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 95% 90% at 50% 40%, #000 80%, transparent 100%)",
      }}
    />
  );
};
