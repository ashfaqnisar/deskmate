import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { NotFound } from "~/components/not-found";

import type { QueryClient } from "@tanstack/react-query";

export type RouterContext = { queryClient: QueryClient };

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col px-4">
      <Outlet />
    </div>
  ),
  notFoundComponent: NotFound,
});
