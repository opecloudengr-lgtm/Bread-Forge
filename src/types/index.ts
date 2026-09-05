export type MediaType = "audio" | "video";
export type EventMediaType = "image" | "video" | "pdf";

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  datePreached: string;
  description: string;
  coverImageUrl: string | null;
  mediaType: MediaType;
  mediaUrl: string;
  downloadableFileUrl: string | null;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
}

export interface EventMedia {
  id: string;
  eventId: string;
  type: EventMediaType;
  fileUrl: string;
  originalName: string;
  sortOrder: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  media: EventMedia[];
}

export interface AdminSession {
  adminId: string;
  email: string;
}
