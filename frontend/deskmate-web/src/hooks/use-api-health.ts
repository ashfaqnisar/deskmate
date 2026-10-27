import { useQuery } from "@tanstack/react-query";

import { fetchHealth } from "~/lib/api";

export function useApiHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => fetchHealth(signal),
    refetchInterval: 15_000,
  });
}
