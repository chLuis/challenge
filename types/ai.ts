export interface DraftContext {
  restaurantName: string;
  locationName: string;
  author: string;
  rating: number | null;
  text: string;
}

export interface DraftPrompt {
  system: string;
  user: string;
}

export type AiFailure = "busy" | "timeout" | "failed";
