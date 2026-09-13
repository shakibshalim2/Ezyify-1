import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select@2.1.6";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react@0.487.0";

import { cn } from "./utils";

// Helper to filter out Figma-specific props
const filterFigmaProps = (props: Record<string, any>) => {
  const filtered = { ...props };
  Object.keys(filtered).forEach(key => {
    if (key.startsWith('_fg') || key.startsWith('data-fg')) {
      delete filtered[key];
    }
  });
  return filtered;
};

// Wrapper components for icons to filter Figma props
const ChevronDownIconClean = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
  const cleanProps = filterFigmaProps(props as any);
  return <ChevronDownIcon ref={ref} {...cleanProps} />;
});
ChevronDownIconClean.displayName = "ChevronDownIconClean";

const ChevronUpIconClean = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
  const cleanProps = filterFigmaProps(props as any);
  return <ChevronUpIcon ref={ref} {...cleanProps} />;
});
ChevronUpIconClean.displayName = "ChevronUpIconClean";

const CheckIconClean = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
  const cleanProps = filterFigmaProps(props as any);
  return <CheckIcon ref={ref} {...cleanProps} />;
});
CheckIconClean.displayName = "CheckIconClean";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    size?: "sm" | "default";
  }
>(({ className, size = "default", children, ...props }, ref) => {
  const cleanProps = filterFigmaProps(props);
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-input-background px-3.5 py-2 text-sm whitespace-nowrap transition-all duration-150 outline-none hover:border-border-strong focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-10 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...cleanProps}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIconClean className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => {
  const cleanProps = filterFigmaProps(props);
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...cleanProps}
    >
      <ChevronUpIconClean className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
});
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => {
  const cleanProps = filterFigmaProps(props);
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...cleanProps}
    >
      <ChevronDownIconClean className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
});
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  const cleanProps = filterFigmaProps(props);
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-2xl border border-border shadow-xl",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...cleanProps}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => {
  const cleanProps = filterFigmaProps(props);
  return (
    <SelectPrimitive.Label
      ref={ref}
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...cleanProps}
    />
  );
});
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const cleanProps = filterFigmaProps(props);
  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...cleanProps}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIconClean className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const cleanProps = filterFigmaProps(props);
  return (
    <SelectPrimitive.Separator
      ref={ref}
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...cleanProps}
    />
  );
});
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};