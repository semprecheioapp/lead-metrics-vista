import { cn } from "@/lib/utils";

interface RetroGridProps {
  className?: string;
  angle?: number;
}

export default function RetroGrid({ className, angle = 65 }: RetroGridProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-50 [perspective:200px]",
        className
      )}
      style={{
        "--grid-angle": `${angle}deg`,
      } as React.CSSProperties}
    >
      {/* Grid */}
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className={cn(
            "animate-grid",
            "h-[300vh] w-[300vw] -translate-x-[50vw] -translate-y-[100vh]",
            "[background-image:linear-gradient(to_right,rgba(56,189,248,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(56,189,248,0.3)_1px,transparent_0)]",
            "[background-size:6rem_4rem]",
            "[transform-origin:100%_0_0]"
          )}
        />
      </div>

      {/* Fade out */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-black" />
    </div>
  );
}