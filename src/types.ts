export type SportId = string;

export interface Sport {
  id: SportId;
  name: string;
  emoji: string;
  color: string;
  minPlayers: number;
  maxPlayers: number;
  defaultDurationMins: number;
  unit: 'court' | 'pitch' | 'lane' | 'table' | 'track';
}

export interface Business {
  id: string;
  name: string;
  verified: boolean;
  parish: string;
}

export interface Facility {
  id: string;
  name: string;
  sportId: SportId;
  surface?: string;
}

export interface Venue {
  id: string;
  businessId: string;
  name: string;
  address: string;
  parish: string;
  lat: number;
  lng: number;
  sportsOffered: SportId[];
  facilities: Facility[];
  rating: number;
  priceRangeJmd: [number, number];
  amenities: string[];
  photoGradient: [string, string];
}

export interface Player {
  id: string;
  name: string;
  initials: string;
  skill: 'Beginner' | 'Intermediate' | 'Advanced' | 'Open';
}

/** A participant in a session's joined list — lighter than a full Player. */
export interface SessionParticipant {
  id: string;
  name: string;
  initials: string;
}

export type PaymentType = 'cash' | 'account' | 'both';

export interface PaymentInfo {
  type: PaymentType;
  /** Account number / handle / bank details to send payment to, if applicable. */
  accountInfo?: string;
  /** Free-text note from the organizer, e.g. "Send before Friday" */
  note?: string;
}

export interface OpenPlaySession {
  id: string;
  /** Freeform venue name, typed by the host — not tied to a fixed directory (yet). */
  venueName: string;
  /** One of Jamaica's 14 parishes — see PARISHES in mockData.ts. */
  parish: string;
  /** Optional specific court/pitch/table name at the venue, e.g. "Court 2". */
  facilityName?: string;
  sportId: string;
  hostId: string;
  hostName: string;
  /** When this session was posted — used to figure out which friend-posted games are "new". */
  createdAt: string;
  startsAt: string;
  durationMins: number;
  capacity: number;
  joined: SessionParticipant[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Open';
  /** True for a friends-only session joined via invite code, not shown in the public feed. */
  isPrivate: boolean;
  /** 6-character code used to find/join a private session. */
  inviteCode?: string;
  /** Flat per-person cost, used for public sessions. 0 or undefined means free. */
  costPerPersonJmd?: number;
  /** Total cost to be split across everyone currently joined, used for private sessions. */
  totalCostJmd?: number;
  payment?: PaymentInfo;
  notes?: string;
  status: 'open' | 'full' | 'cancelled';
}

/**
 * A venue name/parish combo someone has typed before, saved locally so they
 * can quick-pick it next time instead of retyping "the usual spot". Purely a
 * per-device convenience — not shared with anyone, not a verified venue.
 */
export interface FavoriteVenue {
  id: string;
  name: string;
  parish: string;
}

export interface FriendProfile {
  id: string;
  name: string;
  initials: string;
  /** The 6-character code this person shares so others can add them. */
  friendCode: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  initials: string;
  homeLat: number;
  homeLng: number;
  favoriteSportIds: string[];
}
