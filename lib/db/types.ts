export interface RestaurantRow {
  id: string;
  name: string;
}

export interface LocationRow {
  id: string;
  restaurant_id: string;
  name: string;
}

export interface ReviewRow {
  id: string;
  location_id: string;
  author: string;
  rating: number | null;
  text: string;
  published_at: string;
  updated_at: string;
  reply_text: string | null;
  replied_at: string | null;
}
