import { format } from "date-fns";

interface TournamentData {
  name: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  prize_pool: number;
  max_participants: number;
  status: string;
  banner_url?: string | null;
  game?: { name: string } | null;
}

const BASE_URL = "https://riftarena.lovable.app";

export function buildTournamentJsonLd(tournament: TournamentData, id: string): Record<string, unknown> {
  const startDate = new Date(tournament.start_date);
  const endDate = tournament.end_date ? new Date(tournament.end_date) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: tournament.name,
    description: tournament.description || `Competitive esports tournament on RIFT Arena`,
    startDate: startDate.toISOString(),
    ...(endDate && { endDate: endDate.toISOString() }),
    eventStatus: tournament.status === "cancelled"
      ? "https://schema.org/EventCancelled"
      : tournament.status === "completed"
        ? "https://schema.org/EventPostponed"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: `${BASE_URL}/tournaments/${id}`,
    },
    organizer: {
      "@type": "Organization",
      name: "RIFT Arena",
      url: BASE_URL,
    },
    maximumAttendeeCapacity: tournament.max_participants,
    ...(tournament.prize_pool > 0 && {
      offers: {
        "@type": "Offer",
        name: "Prize Pool",
        priceCurrency: "USD",
        price: tournament.prize_pool,
      },
    }),
    ...(tournament.banner_url && { image: tournament.banner_url }),
    ...(tournament.game && {
      sport: tournament.game.name,
    }),
    url: `${BASE_URL}/tournaments/${id}`,
  };
}

export function buildWebsiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RIFT Arena",
    url: BASE_URL,
    description: "The premier esports competition platform. Join elite tournaments, climb global rankings, and compete with the best players.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/tournaments?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RIFT Arena",
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    sameAs: [],
  };
}
