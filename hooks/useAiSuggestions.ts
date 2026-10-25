import { handleRes } from "@/lib/response";
import type { AiSuggestionsResponse } from "@/types/ai-suggestions";
import { useQuery } from "@tanstack/react-query";

export const useAiSuggestions = () => {
  return useQuery({
    queryKey: ["ai-suggestions"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/ai-suggestions", {
        method: "GET",
        cache: "no-store",
      });

      return handleRes(response) as Promise<AiSuggestionsResponse>;
    },
    staleTime: 5 * 60 * 1000,
  });
};
