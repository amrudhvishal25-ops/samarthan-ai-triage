import { cn } from "@/lib/utils";

export const RadialBackground = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn("absolute inset-0 -z-10 size-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]", className)}
      style={{
        background: "radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #6633ee 100%)",
      }}
    />
  );
};
