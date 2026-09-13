import * as React from "react";
import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden";

export function VisuallyHidden({
  ...props
}: React.ComponentProps<typeof VisuallyHiddenPrimitive.Root>) {
  return <VisuallyHiddenPrimitive.Root {...props} />;
}
