import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton rounded-xl", className)}
      {...props}
    />
  );
}

export { Skeleton };
