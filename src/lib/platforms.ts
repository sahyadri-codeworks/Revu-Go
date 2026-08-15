export type IntegrationLevel = "full" | "partial" | "qr_only";

export interface PlatformMeta {
  key: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  integrationLevel: IntegrationLevel;
  urlPlaceholder: string;
  description: string;
  icon: string;
}

export const PLATFORMS: PlatformMeta[] = [
  {
    key: "revugo",
    name: "RevuGo (Our Platform)",
    shortName: "RevuGo",
    color: "#7C3AED",
    bgColor: "#F3E8FF",
    integrationLevel: "full",
    urlPlaceholder: "",
    description: "Full integration with reviews, analytics, coupons, and campaigns",
    icon: "R",
  },
  {
    key: "google",
    name: "Google Reviews",
    shortName: "Google",
    color: "#4285F4",
    bgColor: "#E8F0FE",
    integrationLevel: "qr_only",
    urlPlaceholder: "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID",
    description: "Redirect customers to your Google Business review page",
    icon: "G",
  },
  {
    key: "zomato",
    name: "Zomato",
    shortName: "Zomato",
    color: "#E23744",
    bgColor: "#FDE8EA",
    integrationLevel: "qr_only",
    urlPlaceholder: "https://www.zomato.com/your-restaurant/reviews",
    description: "Redirect customers to your Zomato review page",
    icon: "Z",
  },
  {
    key: "tripadvisor",
    name: "TripAdvisor",
    shortName: "TripAdvisor",
    color: "#00AF87",
    bgColor: "#E6F7F2",
    integrationLevel: "qr_only",
    urlPlaceholder: "https://www.tripadvisor.com/Review-YOUR_BUSINESS",
    description: "Redirect customers to your TripAdvisor review page",
    icon: "T",
  },
  {
    key: "yelp",
    name: "Yelp",
    shortName: "Yelp",
    color: "#D32323",
    bgColor: "#FCE8E8",
    integrationLevel: "qr_only",
    urlPlaceholder: "https://www.yelp.com/biz/your-business",
    description: "Redirect customers to your Yelp business page",
    icon: "Y",
  },
  {
    key: "facebook",
    name: "Facebook Reviews",
    shortName: "Facebook",
    color: "#1877F2",
    bgColor: "#E7F0FD",
    integrationLevel: "qr_only",
    urlPlaceholder: "https://www.facebook.com/your-page/reviews",
    description: "Redirect customers to your Facebook page reviews",
    icon: "f",
  },
  {
    key: "yahoo",
    name: "Yahoo Reviews",
    shortName: "Yahoo",
    color: "#6001D2",
    bgColor: "#F0E6FA",
    integrationLevel: "qr_only",
    urlPlaceholder: "https://local.yahoo.com/your-business",
    description: "Redirect customers to your Yahoo local listing",
    icon: "Y!",
  },
  {
    key: "justdial",
    name: "JustDial",
    shortName: "JustDial",
    color: "#0066CC",
    bgColor: "#E6F0FF",
    integrationLevel: "qr_only",
    urlPlaceholder: "https://www.justdial.com/your-business",
    description: "Redirect customers to your JustDial listing",
    icon: "JD",
  },
  {
    key: "swiggy",
    name: "Swiggy",
    shortName: "Swiggy",
    color: "#FC8019",
    bgColor: "#FFF3E6",
    integrationLevel: "qr_only",
    urlPlaceholder: "https://www.swiggy.com/restaurants/your-restaurant",
    description: "Redirect customers to your Swiggy restaurant page",
    icon: "S",
  },
];

export function getPlatformMeta(key: string): PlatformMeta | undefined {
  return PLATFORMS.find((p) => p.key === key);
}

export function getIntegrationLabel(level: IntegrationLevel): string {
  switch (level) {
    case "full": return "Full Integration";
    case "partial": return "Partial Integration";
    case "qr_only": return "QR / Link Only";
  }
}
