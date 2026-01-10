export interface Venue {
  name: string;
  address: string;
  rating: number;
  priceLevel: number;
  types: string[];
  url: string;
  photoUrl?: string;
  whyItFits: string;
}

export interface DatePlanResult {
  primarySpot: Venue;
  backupOption: Venue;
  outfitSuggestion: string;
  conversationStarters: string[];
  endOfNightMove: {
    type: string;
    suggestion: string;
    venue?: Venue;
  };
  city: string;
  vibe: string;
  timeOfDay: string;
  budget: string;
}

type Budget = "low" | "medium" | "high";
type Vibe = "artsy" | "outdoorsy" | "foodie" | "chill" | "adventurous";
type TimeOfDay = "afternoon" | "evening" | "late night";

// Map vibes to Google Places search types
const vibeToPlaceTypes: Record<Vibe, string[]> = {
  artsy: ["art_gallery", "museum", "cafe", "book_store"],
  outdoorsy: ["park", "hiking_area", "botanical_garden", "zoo"],
  foodie: ["restaurant", "cafe", "bakery", "bar"],
  chill: ["cafe", "spa", "park", "movie_theater"],
  adventurous: ["amusement_park", "bowling_alley", "escape_room", "rock_climbing"],
};

// Map budget to price levels
const budgetToPriceLevel: Record<Budget, number[]> = {
  low: [0, 1],
  medium: [1, 2],
  high: [2, 3, 4],
};

// Map time of day to keywords
const timeKeywords: Record<TimeOfDay, string[]> = {
  afternoon: ["brunch", "lunch", "daytime", "outdoor"],
  evening: ["dinner", "sunset", "romantic"],
  "late night": ["cocktail", "lounge", "bar", "nightlife"],
};

// Outfit suggestions based on vibe and time
const outfitSuggestions: Record<Vibe, Record<TimeOfDay, string>> = {
  artsy: {
    afternoon: "Smart casual: dark jeans, a fitted button-down with rolled sleeves, clean white sneakers. Add a subtle watch.",
    evening: "Elevated casual: black chinos, a textured sweater or blazer, leather boots. Think gallery opening vibes.",
    "late night": "Creative edge: all-black outfit with one statement piece - a cool jacket or interesting accessory.",
  },
  outdoorsy: {
    afternoon: "Active casual: well-fitted joggers or chinos, a quality henley, comfortable sneakers. Layer with a light jacket.",
    evening: "Relaxed outdoorsy: clean hiking boots, fitted jeans, a flannel or quarter-zip over a tee.",
    "late night": "Cozy adventure: dark jeans, a warm sweater, comfortable boots for any late-night walks.",
  },
  foodie: {
    afternoon: "Polished casual: chinos, a crisp oxford shirt, loafers. Look like you know good food.",
    evening: "Date night classic: dark jeans or slacks, a well-fitted blazer, nice leather shoes. Dress for the restaurant's vibe.",
    "late night": "Upscale casual: dark pants, a quality sweater or casual button-down, clean leather shoes.",
  },
  chill: {
    afternoon: "Effortless cool: well-fitted jeans, a quality t-shirt, clean sneakers. Simple but put-together.",
    evening: "Relaxed date: dark jeans, a nice sweater or casual button-down, comfortable shoes.",
    "late night": "Laid-back style: comfortable but clean - fitted jeans, a soft henley or sweater, casual shoes.",
  },
  adventurous: {
    afternoon: "Activity-ready: athletic wear that looks good, comfortable sneakers, maybe a cool cap.",
    evening: "Smart adventure: dark jeans, a fitted jacket, versatile shoes that work for activities.",
    "late night": "Bold casual: something with personality - a statement jacket, interesting sneakers, confidence.",
  },
};

// Conversation starters based on vibe
const conversationStartersByVibe: Record<Vibe, string[]> = {
  artsy: [
    "What's a creative project you've always wanted to try?",
    "If you could have dinner with any artist, dead or alive, who would it be?",
    "What's the last thing that genuinely moved you - a book, song, or movie?",
    "Do you have a favorite museum memory from traveling?",
    "What's your hot take on modern art?",
  ],
  outdoorsy: [
    "What's the most beautiful place you've ever been?",
    "Are you more of a sunrise or sunset person?",
    "If you could live anywhere for a year, where would you go?",
    "What's on your adventure bucket list?",
    "Beach vacation or mountain getaway?",
  ],
  foodie: [
    "What's your death row meal?",
    "Best thing you've eaten while traveling?",
    "Are you a cook-at-home person or an explore-restaurants person?",
    "What food did you hate as a kid but love now?",
    "If you had to eat one cuisine for the rest of your life, what would it be?",
  ],
  chill: [
    "What's your perfect lazy Sunday?",
    "What are you watching right now that you'd recommend?",
    "Are you a morning person or night owl?",
    "What's something small that always makes your day better?",
    "What's your comfort movie - the one you've seen a hundred times?",
  ],
  adventurous: [
    "What's the most spontaneous thing you've ever done?",
    "Skydiving or scuba diving?",
    "What's something you've done that surprised yourself?",
    "If you could learn any skill overnight, what would it be?",
    "What's a fear you've conquered or want to conquer?",
  ],
};

// End of night suggestions
const endOfNightMoves: Record<TimeOfDay, Record<Vibe, { type: string; suggestion: string }>> = {
  afternoon: {
    artsy: { type: "dessert", suggestion: "Find a quirky dessert spot or an artisanal ice cream shop nearby" },
    outdoorsy: { type: "walk", suggestion: "Take a scenic walk through a nearby park or waterfront" },
    foodie: { type: "dessert", suggestion: "Hit up that famous bakery or dessert bar you've been eyeing" },
    chill: { type: "walk", suggestion: "Grab coffee to-go and stroll through a nice neighborhood" },
    adventurous: { type: "activity", suggestion: "Extend the date with a quick arcade visit or mini golf" },
  },
  evening: {
    artsy: { type: "bar", suggestion: "Find a speakeasy or cocktail bar with interesting decor" },
    outdoorsy: { type: "walk", suggestion: "Night walk through a well-lit park or along the water" },
    foodie: { type: "dessert", suggestion: "Upscale dessert bar or a wine bar with a cheese board" },
    chill: { type: "walk", suggestion: "Walk to a quiet spot and just talk - connection over activity" },
    adventurous: { type: "bar", suggestion: "Find a rooftop bar or somewhere with live music" },
  },
  "late night": {
    artsy: { type: "bar", suggestion: "Underground jazz bar or a late-night coffee shop with live poetry" },
    outdoorsy: { type: "walk", suggestion: "Find a spot to stargaze or watch the city lights" },
    foodie: { type: "food", suggestion: "Late-night taco spot or a 24-hour diner for a nightcap meal" },
    chill: { type: "walk", suggestion: "Quiet late-night walk, maybe grab a slice of pizza" },
    adventurous: { type: "activity", suggestion: "Late-night bowling, karaoke, or dancing" },
  },
};

// Fetch venues from Google Places API
export async function fetchDateSpots(
  city: string,
  budget: Budget,
  vibe: Vibe,
  timeOfDay: TimeOfDay
): Promise<Venue[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.log("No Google Places API key found, using curated recommendations");
    return generateFallbackVenues(city, budget, vibe, timeOfDay);
  }

  const placeTypes = vibeToPlaceTypes[vibe];
  const priceLevels = budgetToPriceLevel[budget];
  const keywords = timeKeywords[timeOfDay];

  try {
    // Build search query
    const searchQuery = `${vibe} ${keywords[0]} spots in ${city}`;
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

    const response = await fetch(textSearchUrl);
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      console.log("Google Places returned no results, using fallback");
      return generateFallbackVenues(city, budget, vibe, timeOfDay);
    }

    // Filter and map results
    const venues: Venue[] = data.results
      .filter((place: any) => {
        const priceLevel = place.price_level ?? 1;
        return priceLevels.includes(priceLevel);
      })
      .slice(0, 5)
      .map((place: any) => ({
        name: place.name,
        address: place.formatted_address,
        rating: place.rating || 4.0,
        priceLevel: place.price_level || 1,
        types: place.types || [],
        url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        photoUrl: place.photos?.[0]
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
          : undefined,
        whyItFits: generateWhyItFits(place, vibe, timeOfDay),
      }));

    return venues.length >= 2 ? venues : generateFallbackVenues(city, budget, vibe, timeOfDay);
  } catch (error) {
    console.error("Error fetching from Google Places:", error);
    return generateFallbackVenues(city, budget, vibe, timeOfDay);
  }
}

// Generate "why it fits" explanation
function generateWhyItFits(place: any, vibe: Vibe, timeOfDay: TimeOfDay): string {
  const vibeDescriptions: Record<Vibe, string> = {
    artsy: "creative atmosphere and unique aesthetic",
    outdoorsy: "natural setting and fresh air vibes",
    foodie: "exceptional food and culinary experience",
    chill: "relaxed ambiance perfect for conversation",
    adventurous: "exciting activities and memorable experiences",
  };

  const timeDescriptions: Record<TimeOfDay, string> = {
    afternoon: "great daytime energy",
    evening: "romantic evening atmosphere",
    "late night": "perfect late-night vibes",
  };

  const rating = place.rating ? `${place.rating} stars` : "highly rated";
  return `${rating} with ${vibeDescriptions[vibe]} and ${timeDescriptions[timeOfDay]}`;
}

// Fallback venues when API isn't available
function generateFallbackVenues(
  city: string,
  budget: Budget,
  vibe: Vibe,
  timeOfDay: TimeOfDay
): Venue[] {
  const fallbackSpots: Record<Vibe, { primary: Partial<Venue>; backup: Partial<Venue>; endSpot: Partial<Venue> }> = {
    artsy: {
      primary: { name: `${city} Museum of Art`, types: ["museum", "art_gallery"] },
      backup: { name: `The Creative Corner Cafe`, types: ["cafe", "art_gallery"] },
      endSpot: { name: `Gallery Lounge`, types: ["bar", "art_gallery"] },
    },
    outdoorsy: {
      primary: { name: `${city} Botanical Gardens`, types: ["park", "botanical_garden"] },
      backup: { name: `Riverside Walking Trail`, types: ["park", "hiking"] },
      endSpot: { name: `Sunset Point Viewpoint`, types: ["park", "viewpoint"] },
    },
    foodie: {
      primary: { name: `Chef's Table ${city}`, types: ["restaurant", "fine_dining"] },
      backup: { name: `The Local Kitchen`, types: ["restaurant", "cafe"] },
      endSpot: { name: `Sweet Endings Dessert Bar`, types: ["bakery", "dessert"] },
    },
    chill: {
      primary: { name: `Cozy Bean Coffee House`, types: ["cafe", "coffee_shop"] },
      backup: { name: `The Reading Room`, types: ["cafe", "book_store"] },
      endSpot: { name: `Moonlight Park`, types: ["park"] },
    },
    adventurous: {
      primary: { name: `${city} Adventure Center`, types: ["amusement", "entertainment"] },
      backup: { name: `Urban Escape Rooms`, types: ["escape_room", "entertainment"] },
      endSpot: { name: `Rooftop Games Bar`, types: ["bar", "entertainment"] },
    },
  };

  const priceLevel = budget === "low" ? 1 : budget === "medium" ? 2 : 3;
  const spots = fallbackSpots[vibe];

  const createVenue = (base: Partial<Venue>, index: number): Venue => ({
    name: base.name || `Great ${vibe} Spot`,
    address: `Search "${base.name}" in ${city} for directions`,
    rating: 4.2 + (index * 0.1),
    priceLevel,
    types: base.types || [],
    url: `https://www.google.com/maps/search/${encodeURIComponent((base.name || "") + " " + city)}`,
    whyItFits: `Perfect ${vibe} spot for ${timeOfDay} dates - matches your ${budget} budget`,
  });

  return [
    createVenue(spots.primary, 0),
    createVenue(spots.backup, 1),
    createVenue(spots.endSpot, 2),
  ];
}

// Generate complete date plan
export function generateDatePlan(
  spots: Venue[],
  city: string,
  budget: Budget,
  vibe: Vibe,
  timeOfDay: TimeOfDay
): DatePlanResult {
  const primarySpot = spots[0];
  const backupOption = spots[1] || spots[0];
  const endSpot = spots[2];

  // Get outfit suggestion
  const outfitSuggestion = outfitSuggestions[vibe][timeOfDay];

  // Get conversation starters (pick 3 random ones)
  const allStarters = conversationStartersByVibe[vibe];
  const shuffled = [...allStarters].sort(() => Math.random() - 0.5);
  const conversationStarters = shuffled.slice(0, 3);

  // Get end of night move
  const endMove = endOfNightMoves[timeOfDay][vibe];

  return {
    primarySpot,
    backupOption,
    outfitSuggestion,
    conversationStarters,
    endOfNightMove: {
      type: endMove.type,
      suggestion: endMove.suggestion,
      venue: endSpot,
    },
    city,
    vibe,
    timeOfDay,
    budget,
  };
}
