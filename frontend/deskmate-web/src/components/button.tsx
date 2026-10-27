import clsx from "clsx";

import type { ComponentProps } from "react";

type Props = ComponentProps<"button"> & { variant?: "primary" | "danger" | "ghost" };

export function Button({ variant = "primary", className, ...props }: Props) {
  return (
    <button
      className={clsx(
        "cursor-pointer rounded-xl px-4 py-2.5 font-semibold transition-opacity disabled:cursor-default disabled:opacity-40",
        variant === "primary" && "bg-indigo-600 text-white dark:bg-indigo-400 dark:text-indigo-950",
        variant === "danger" && "bg-red-600 text-white dark:bg-red-400 dark:text-red-950",
        variant === "ghost" &&
          "border border-stone-200 bg-transparent px-3 py-1.5 text-sm font-medium dark:border-stone-800",
        className,
      )}
      {...props}
    />
  );
}
