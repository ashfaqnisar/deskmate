import { Link } from "@tanstack/react-router";

import { buttonVariants } from "~/shared/shadcn/button";

export function NotFound() {
  return (
    <div className="m-auto text-center">
      <h1 className="font-heading text-xl font-semibold">Page not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">That page doesn&apos;t exist.</p>
      <Link to="/" className={buttonVariants({ variant: "link" })}>
        Back to chat
      </Link>
    </div>
  );
}
