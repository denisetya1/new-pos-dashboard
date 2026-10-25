export type SuggestionPriority = "HIGH" | "MEDIUM" | "OPPORTUNITY";

export type SuggestionCategory =
  | "REVENUE"
  | "DEAD_STOCK"
  | "RESTOCK"
  | "EXPIRY"
  | "TRAFFIC";

export type AiSuggestion = {
  id: string;
  priority: SuggestionPriority;
  category: SuggestionCategory;
  title: string;
  summary: string;
  evidence: string;
  actionLabel: string;
  href: string;
};

export type AiSuggestionsData = {
  generatedAt: string;
  outletId: number;
  analysisPeriods: {
    salesDays: number;
    trafficDays: number;
    deadStockMonths: number;
    expiryDays: number;
  };
  summary: {
    high: number;
    medium: number;
    opportunity: number;
  };
  suggestions: AiSuggestion[];
};

export type AiSuggestionsResponse = {
  code: string;
  message: string;
  errors: string[];
  data: AiSuggestionsData;
};
