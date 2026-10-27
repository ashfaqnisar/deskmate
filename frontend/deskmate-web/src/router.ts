import { createRouter } from "@tanstack/react-router";

import { chatRoute } from "~/routes/chat";
import { rootRoute } from "~/routes/root";

import type { QueryClient } from "@tanstack/react-query";

const routeTree = rootRoute.addChildren([chatRoute]);

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({ routeTree, context: { queryClient }, defaultPreload: "intent" });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
