import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { NotFound } from "~/shared/components/not-found";

import type { QueryClient } from "@tanstack/react-query";

export type RouterContext = { queryClient: QueryClient };

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <div className="flex min-h-svh w-full justify-center bg-background">
      <div className="flex h-svh w-full max-w-3xl flex-col px-4">
        <Outlet />
      </div>
    </div>
  ),
  notFoundComponent: NotFound,
});
