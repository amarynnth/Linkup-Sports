import type { Sport, Business, Venue, OpenPlaySession, Player, CurrentUser } from '../types';

export const SPORTS: Sport[] = [
  { id: 'pickleball', name: 'Pickleball', emoji: '🏓', color: '#c6ff3d', minPlayers: 2, maxPlayers: 4, defaultDurationMins: 60, unit: 'court' },
  { id: 'football', name: 'Football', emoji: '⚽', color: '#3de0ff', minPlayers: 8, maxPlayers: 14, defaultDurationMins: 90, unit: 'pitch' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', color: '#ffb020', minPlayers: 4, maxPlayers: 10, defaultDurationMins: 60, unit: 'court' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾', color: '#a06bff', minPlayers: 2, maxPlayers: 4, defaultDurationMins: 60, unit: 'court' },
  { id: 'table-tennis', name: 'Table Tennis', emoji: '🏸', color: '#ff5d73', minPlayers: 2, maxPlayers: 4, defaultDurationMins: 45, unit: 'table' },
];

// Jamaica's 14 parishes — used for the freeform-venue Parish selector and
// feed filter, now that sessions no longer reference a fixed venue directory
// with known coordinates.
export const PARISHES: string[] = [
  'Kingston',
  'St. Andrew',
  'St. Catherine',
  'Clarendon',
  'Manchester',
  'St. Elizabeth',
  'Westmoreland',
  'Hanover',
  'St. James',
  'Trelawny',
  'St. Ann',
  'St. Mary',
  'Portland',
  'St. Thomas',
];

// NOTE: BUSINESSES/VENUES below are no longer referenced by INITIAL_SESSIONS
// (sessions now use freeform venueName/parish/facilityName — see types.ts).
// Kept here on purpose: once real venue partnerships exist, this fixed
// directory is the natural starting point for a "select from official
// venues" picker again, per the plan discussed with the venue-partner pitch.
export const BUSINESSES: Business[] = [
  { id: 'biz-halfmoon', name: 'Half Moon Sporting Club', verified: true, parish: 'St. James' },
  { id: 'biz-nk-courts', name: 'New Kingston Courts', verified: true, parish: 'Kingston' },
  { id: 'biz-indyfields', name: 'Independence Athletic Grounds', verified: true, parish: 'Kingston' },
  { id: 'biz-portmore-hub', name: 'Portmore Community Sports Hub', verified: false, parish: 'St. Catherine' },
  { id: 'biz-liguanea', name: 'Liguanea Racquet Club', verified: true, parish: 'Kingston' },
  { id: 'biz-ironshore', name: 'Ironshore Turf Co.', verified: true, parish: 'St. James' },
  { id: 'biz-spanishtown', name: 'Spanish Town Multi-Courts', verified: false, parish: 'St. Catherine' },
];

export const VENUES: Venue[] = [
  {
    id: 'v-halfmoon-pb',
    businessId: 'biz-halfmoon',
    name: 'Half Moon Pickleball Courts',
    address: 'Half Moon Resort, Rose Hall, Montego Bay',
    parish: 'St. James',
    lat: 18.4988, lng: -77.8757,
    sportsOffered: ['pickleball', 'tennis'],
    facilities: [
      { id: 'f1', name: 'Court 1', sportId: 'pickleball', surface: 'Cushioned hard court' },
      { id: 'f2', name: 'Court 2', sportId: 'pickleball', surface: 'Cushioned hard court' },
      { id: 'f3', name: 'Tennis Court A', sportId: 'tennis', surface: 'Clay' },
    ],
    rating: 4.8,
    priceRangeJmd: [1500, 3000],
    amenities: ['Lights', 'Pro shop', 'Parking', 'Water'],
    photoGradient: ['#0d3b3f', '#134e4a'],
  },
  {
    id: 'v-nk-courts',
    businessId: 'biz-nk-courts',
    name: 'New Kingston Courts',
    address: 'Dominica Dr, New Kingston',
    parish: 'Kingston',
    lat: 18.0090, lng: -76.7870,
    sportsOffered: ['pickleball', 'basketball'],
    facilities: [
      { id: 'f4', name: 'Court 1', sportId: 'pickleball' },
      { id: 'f5', name: 'Court 2', sportId: 'pickleball' },
      { id: 'f6', name: 'Main Court', sportId: 'basketball' },
    ],
    rating: 4.6,
    priceRangeJmd: [1200, 2000],
    amenities: ['Lights', 'Parking', 'Changing rooms'],
    photoGradient: ['#1a1440', '#2a1f5e'],
  },
  {
    id: 'v-indy-football',
    businessId: 'biz-indyfields',
    name: 'Independence Park Five-a-Side',
    address: 'Arthur Wint Dr, Kingston',
    parish: 'Kingston',
    lat: 17.9925, lng: -76.7887,
    sportsOffered: ['football'],
    facilities: [
      { id: 'f7', name: 'Pitch A (5-a-side)', sportId: 'football', surface: 'Artificial turf' },
      { id: 'f8', name: 'Pitch B (7-a-side)', sportId: 'football', surface: 'Artificial turf' },
    ],
    rating: 4.7,
    priceRangeJmd: [800, 1500],
    amenities: ['Floodlights', 'Bleachers', 'Canteen'],
    photoGradient: ['#0f2e1a', '#164a29'],
  },
  {
    id: 'v-portmore-hub',
    businessId: 'biz-portmore-hub',
    name: 'Portmore Community Sports Hub',
    address: 'Braeton Pkwy, Portmore',
    parish: 'St. Catherine',
    lat: 17.9528, lng: -76.8798,
    sportsOffered: ['football', 'basketball'],
    facilities: [
      { id: 'f9', name: 'Main Pitch', sportId: 'football', surface: 'Grass' },
      { id: 'f10', name: 'Outdoor Court', sportId: 'basketball' },
    ],
    rating: 4.3,
    priceRangeJmd: [500, 1000],
    amenities: ['Parking', 'Snack bar'],
    photoGradient: ['#3a2408', '#5c3a10'],
  },
  {
    id: 'v-liguanea',
    businessId: 'biz-liguanea',
    name: 'Liguanea Racquet Club',
    address: 'Hope Rd, Liguanea, Kingston',
    parish: 'Kingston',
    lat: 18.0186, lng: -76.7684,
    sportsOffered: ['tennis', 'pickleball', 'table-tennis'],
    facilities: [
      { id: 'f11', name: 'Court 1', sportId: 'tennis' },
      { id: 'f12', name: 'Pickleball Court', sportId: 'pickleball' },
      { id: 'f13', name: 'Table 1', sportId: 'table-tennis' },
    ],
    rating: 4.9,
    priceRangeJmd: [1800, 3500],
    amenities: ['Clubhouse', 'Lights', 'Coaching', 'Parking'],
    photoGradient: ['#3a0d2e', '#5c1548'],
  },
  {
    id: 'v-ironshore',
    businessId: 'biz-ironshore',
    name: 'Ironshore Turf Fields',
    address: 'Ironshore, Montego Bay',
    parish: 'St. James',
    lat: 18.4841, lng: -77.9053,
    sportsOffered: ['football'],
    facilities: [
      { id: 'f14', name: 'Field 1', sportId: 'football', surface: 'Artificial turf' },
    ],
    rating: 4.4,
    priceRangeJmd: [700, 1400],
    amenities: ['Floodlights', 'Parking'],
    photoGradient: ['#082a3a', '#0f4a5c'],
  },
  {
    id: 'v-spanishtown',
    businessId: 'biz-spanishtown',
    name: 'Spanish Town Multi-Courts',
    address: 'Burke Rd, Spanish Town',
    parish: 'St. Catherine',
    lat: 17.9909, lng: -76.9573,
    sportsOffered: ['basketball', 'pickleball'],
    facilities: [
      { id: 'f15', name: 'Court 1', sportId: 'basketball' },
      { id: 'f16', name: 'Court 2', sportId: 'pickleball' },
    ],
    rating: 4.1,
    priceRangeJmd: [400, 900],
    amenities: ['Lights'],
    photoGradient: ['#2a0d3a', '#42155c'],
  },
];

const PLAYER_POOL: Player[] = [
  { id: 'p1', name: 'Ramona Chin', initials: 'RC', skill: 'Intermediate' },
  { id: 'p2', name: 'Devon Blake', initials: 'DB', skill: 'Advanced' },
  { id: 'p3', name: 'Sasha Reid', initials: 'SR', skill: 'Beginner' },
  { id: 'p4', name: 'Kemar Foster', initials: 'KF', skill: 'Open' },
  { id: 'p5', name: 'Alicia Grant', initials: 'AG', skill: 'Intermediate' },
  { id: 'p6', name: 'Nico Brown', initials: 'NB', skill: 'Advanced' },
  { id: 'p7', name: 'Tamara Wint', initials: 'TW', skill: 'Beginner' },
  { id: 'p8', name: 'Jerome Facey', initials: 'JF', skill: 'Open' },
];

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 60 * 60 * 1000).toISOString();
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

export const INITIAL_SESSIONS: OpenPlaySession[] = [
  {
    id: 's1', venueName: 'New Kingston Courts', parish: 'Kingston', facilityName: 'Court 1', sportId: 'pickleball',
    hostId: 'p1', hostName: 'Ramona Chin', createdAt: hoursAgo(5), startsAt: hoursFromNow(3), durationMins: 60, capacity: 4,
    joined: [PLAYER_POOL[0], PLAYER_POOL[4]], skillLevel: 'Intermediate',
    isPrivate: false,
    costPerPersonJmd: 500, notes: 'Casual doubles, bring your own paddle if you have one.',
    status: 'open',
  },
  {
    id: 's2', venueName: 'Independence Park Five-a-Side', parish: 'Kingston', facilityName: 'Pitch A (5-a-side)', sportId: 'football',
    hostId: 'p2', hostName: 'Devon Blake', createdAt: hoursAgo(9), startsAt: hoursFromNow(5), durationMins: 90, capacity: 10,
    joined: [PLAYER_POOL[1], PLAYER_POOL[5], PLAYER_POOL[7]], skillLevel: 'Open',
    isPrivate: false,
    costPerPersonJmd: 400, notes: '5-a-side, need 2 more for full teams.',
    status: 'open',
  },
  {
    id: 's3', venueName: 'Liguanea Racquet Club', parish: 'Kingston', facilityName: 'Pickleball Court', sportId: 'pickleball',
    hostId: 'p5', hostName: 'Alicia Grant', createdAt: hoursAgo(2), startsAt: hoursFromNow(1.5), durationMins: 60, capacity: 4,
    joined: [PLAYER_POOL[4], PLAYER_POOL[0], PLAYER_POOL[3]], skillLevel: 'Advanced',
    isPrivate: false,
    costPerPersonJmd: 700,
    status: 'open',
  },
  {
    id: 's4', venueName: 'Portmore Community Sports Hub', parish: 'St. Catherine', facilityName: 'Outdoor Court', sportId: 'basketball',
    hostId: 'p4', hostName: 'Kemar Foster', createdAt: hoursAgo(14), startsAt: hoursFromNow(8), durationMins: 60, capacity: 8,
    joined: [PLAYER_POOL[3], PLAYER_POOL[7]], skillLevel: 'Open',
    isPrivate: false,
    costPerPersonJmd: 200, notes: 'Pickup run, all levels welcome.',
    status: 'open',
  },
  {
    id: 's5', venueName: 'Half Moon Pickleball Courts', parish: 'St. James', facilityName: 'Court 1', sportId: 'pickleball',
    hostId: 'p6', hostName: 'Nico Brown', createdAt: hoursAgo(20), startsAt: hoursFromNow(26), durationMins: 60, capacity: 4,
    joined: [PLAYER_POOL[5]], skillLevel: 'Beginner',
    isPrivate: false,
    costPerPersonJmd: 600, notes: 'New players welcome, we\'ll go over the rules.',
    status: 'open',
  },
  {
    id: 's6', venueName: 'Ironshore Turf Fields', parish: 'St. James', facilityName: 'Field 1', sportId: 'football',
    hostId: 'p7', hostName: 'Tamara Wint', createdAt: hoursAgo(24), startsAt: hoursFromNow(30), durationMins: 90, capacity: 12,
    joined: [PLAYER_POOL[6], PLAYER_POOL[1], PLAYER_POOL[2], PLAYER_POOL[3], PLAYER_POOL[4], PLAYER_POOL[5], PLAYER_POOL[7]],
    skillLevel: 'Intermediate',
    isPrivate: false,
    costPerPersonJmd: 350,
    status: 'open',
  },
  {
    id: 's7', venueName: 'Spanish Town Multi-Courts', parish: 'St. Catherine', facilityName: 'Court 1', sportId: 'basketball',
    hostId: 'p8', hostName: 'Jerome Facey', createdAt: hoursAgo(6), startsAt: hoursFromNow(4), durationMins: 60, capacity: 6,
    joined: [PLAYER_POOL[7], PLAYER_POOL[2], PLAYER_POOL[1], PLAYER_POOL[0], PLAYER_POOL[3], PLAYER_POOL[5]],
    skillLevel: 'Open',
    isPrivate: false,
    costPerPersonJmd: 150,
    status: 'full',
  },
  {
    id: 's8', venueName: 'Liguanea Racquet Club', parish: 'Kingston', facilityName: 'Table 1', sportId: 'table-tennis',
    hostId: 'p3', hostName: 'Sasha Reid', createdAt: hoursAgo(3), startsAt: hoursFromNow(2), durationMins: 45, capacity: 4,
    joined: [PLAYER_POOL[2]], skillLevel: 'Beginner',
    isPrivate: false,
    costPerPersonJmd: 300,
    status: 'open',
  },
  {
    id: 's9', venueName: 'New Kingston Courts', parish: 'Kingston', facilityName: 'Court 1', sportId: 'pickleball',
    hostId: 'me', hostName: 'Amarynth', createdAt: hoursAgo(30), startsAt: hoursFromNow(48), durationMins: 60, capacity: 4,
    joined: [
      { id: 'me', name: 'Amarynth', initials: 'AM' },
      { id: 'p1', name: 'Ramona Chin', initials: 'RC' },
    ],
    skillLevel: 'Open',
    isPrivate: true,
    inviteCode: 'PBWEEK',
    totalCostJmd: 4000,
    payment: {
      type: 'account',
      accountInfo: 'NCB Acct 000-123-456 — Amarynth S.',
      note: 'Send before we play if you can, thanks!',
    },
    notes: 'Our weekly pickleball crew — cost splits evenly across whoever joins.',
    status: 'open',
  },
  {
    id: 's10', venueName: 'Independence Park Five-a-Side', parish: 'Kingston', facilityName: 'Pitch A (5-a-side)', sportId: 'football',
    hostId: 'me', hostName: 'Amarynth', createdAt: hoursAgo(40), startsAt: hoursFromNow(72), durationMins: 90, capacity: 10,
    joined: [
      { id: 'me', name: 'Amarynth', initials: 'AM' },
      { id: 'p2', name: 'Devon Blake', initials: 'DB' },
      { id: 'p6', name: 'Nico Brown', initials: 'NB' },
    ],
    skillLevel: 'Open',
    isPrivate: true,
    inviteCode: 'FBSQUAD',
    totalCostJmd: 8000,
    payment: {
      type: 'both',
      accountInfo: 'NCB Acct 000-123-456 — Amarynth S.',
      note: 'Cash on the day works too, just let me know beforehand.',
    },
    notes: 'Weekly football link up — split the pitch cost across the squad.',
    status: 'open',
  },
];

// Default fallback location: New Kingston. Used when geolocation is
// unavailable or denied, so the proximity feed always has something
// sensible to sort by.
export const CURRENT_USER: CurrentUser = {
  id: 'me',
  name: 'Amarynth',
  initials: 'AM',
  homeLat: 18.0090,
  homeLng: -76.7870,
  favoriteSportIds: ['pickleball', 'football'],
};

export function getSport(id: string): Sport {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[0];
}

export function getVenue(id: string): Venue | undefined {
  return VENUES.find((v) => v.id === id);
}

export function getBusiness(id: string): Business | undefined {
  return BUSINESSES.find((b) => b.id === id);
}
