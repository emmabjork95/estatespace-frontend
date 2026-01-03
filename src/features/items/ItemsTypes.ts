export const STATUS_OPTIONS = ["Unsorted", "Keep", "Donate", "Sell", "Discard"] as const;
export type Status = typeof STATUS_OPTIONS[number];

export type Item = {
  items_id: string;
  spaces_id: string;
  profiles_id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: Status;
  image_url: string | null;
};

export type ItemListItem = {
  items_id: string;
  name: string;
  status: Status;
  image_url: string | null;
  created_at: string;
};

export const STATUS_LABELS: Record<Status, string> = {
  Unsorted: "Osorterat",
  Keep: "Spara",
  Donate: "Donera",
  Sell: "Sälja",
  Discard: "Slänga",
};
