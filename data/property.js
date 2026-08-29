/**
 * RENO APARTMENTS ABUJA — CENTRAL PROPERTY DATA
 * ------------------------------------------------
 * Every piece of business-specific content on this website is read from
 * this one file. Update a phone number, add an apartment, change a price —
 * do it here once and it updates everywhere (header, footer, WhatsApp
 * messages, structured data, the AI chat assistant, and every page).
 *
 * IMPORTANT: Do not invent facts. Every field below is either information
 * that was supplied, or is left as a clearly-marked placeholder for the
 * property owner to fill in. The AI assistant and every template on this
 * site treat this file as the ONLY source of truth — nothing is
 * hallucinated on top of it.
 */

const PROPERTY = {
  name: "Reno Apartments Abuja",
  tagline: "Serviced apartments in Guzape District, Abuja",
  legalName: "Reno Apartments Abuja",

  address: {
    line1: "4 Sam'ila Gwarzo St",
    line2: "Guzape District",
    city: "Abuja",
    postalCode: "900110",
    region: "Federal Capital Territory",
    country: "Nigeria",
    full: "4 Sam'ila Gwarzo St, Guzape District, Abuja 900110, Federal Capital Territory, Nigeria",
  },

  geo: {
    // Approximate coordinates for Guzape District, Abuja — used only for
    // map embedding and LocalBusiness structured data. Replace with the
    // exact pin from Google Business Profile if greater precision is needed.
    lat: 9.0392,
    lng: 7.5136,
    googleMapsUrl: "https://maps.app.goo.gl/Wma4rP4a3KxW1Rf56",
  },

  contact: {
    // Call / SMS numbers as supplied by the property
    phones: ["+234 712 002 8009", "+234 803 590 9393"],
    // WhatsApp number as supplied by the property (used to build wa.me links)
    whatsapp: "+234 916 000 0085",
    whatsappDigits: "2349160000085",
    email: "renoapartmentsabuja@gmail.com",
  },

  hours: {
    checkIn: "PLACEHOLDER — confirm standard check-in time",
    checkOut: "PLACEHOLDER — confirm standard check-out time",
    reception: "PLACEHOLDER — confirm reception / front desk hours",
  },

  social: {
    instagram: null,
    facebook: null,
  },

  // Aggregate rating as shown on the property's Google Business listing
  // (captured 29 Aug 2026). This is Google's own aggregated rating, not
  // individual review text we've written or selected — displayed with
  // clear attribution to Google, never presented as our own testimonials.
  googleRating: {
    value: 4.5,
    count: 73,
    source: "Google",
    capturedDate: "2026-08-29",
  },

  // ---------------------------------------------------------------------
  // APARTMENTS
  // Two distinct room styles are visible in the property's own published
  // photos (sourced from their Google Business listing). No official room
  // names, capacities, or confirmed nightly rates were supplied by the
  // property. `priceFrom` is intentionally left null — the price shown
  // publicly next to this listing is an aggregated OTA rate (Agoda,
  // Expedia, Hotels.com, Vio.com all show different, higher numbers for
  // the same dates), not Reno's own direct rate, so it is not reliable
  // enough to publish here. Replace with a real direct rate once the
  // property confirms one.
  // ---------------------------------------------------------------------
  apartments: [
    {
      id: "room-type-1",
      name: "Room Type 1",
      slug: "room-type-1",
      shortDescription:
        "A warm-toned guest room with a dark wood headboard, lounge seating, and an en-suite marble bathroom with a glass-enclosed shower. Name and full details to be confirmed by the property.",
      guests: null,
      bedrooms: 1,
      bathrooms: 1,
      bedConfig: null,
      amenities: [],
      priceFrom: null,
      currency: "NGN",
      priceNote: null,
      images: [
        "images/gallery/bedroom-1.jpg",
        "images/gallery/bedroom-2.jpg",
        "images/gallery/bedroom-3.jpg",
        "images/gallery/bathroom-1.jpg",
      ],
      published: true,
    },
    {
      id: "room-type-2",
      name: "Room Type 2",
      slug: "room-type-2",
      shortDescription:
        "A guest room with a black headboard with gold accent lighting, a mirrored dresser, and a bright marble en-suite bathroom. Name and full details to be confirmed by the property.",
      guests: null,
      bedrooms: 1,
      bathrooms: 1,
      bedConfig: null,
      amenities: [],
      priceFrom: null,
      currency: "NGN",
      priceNote: null,
      images: [
        "images/gallery/bedroom-9.jpg",
        "images/gallery/bedroom-10.jpg",
        "images/gallery/bedroom-11.jpg",
        "images/gallery/bathroom-6.jpg",
      ],
      published: true,
    },
  ],

  // ---------------------------------------------------------------------
  // AMENITIES
  // Only include amenities the property has confirmed. Each entry can
  // optionally cite which gallery category illustrates it.
  // ---------------------------------------------------------------------
  amenities: [
    { name: "24-hour reception", icon: "clock", confirmed: false },
    { name: "Wi-Fi", icon: "wifi", confirmed: false },
    { name: "Air conditioning", icon: "snow", confirmed: false },
    { name: "Laundry facilities", icon: "laundry", confirmed: true },
    { name: "Elevator access", icon: "elevator", confirmed: true },
    { name: "On-site dining", icon: "dining", confirmed: true },
    { name: "Lounge / common area", icon: "lounge", confirmed: true },
    { name: "Games room", icon: "games", confirmed: true },
    { name: "Secure gated compound", icon: "shield", confirmed: true },
    { name: "Parking", icon: "parking", confirmed: false },
  ],

  // ---------------------------------------------------------------------
  // GALLERY — sourced from the property's real photography
  // ---------------------------------------------------------------------
  galleryCategories: [
    { key: "exterior", label: "Exterior" },
    { key: "lobby", label: "Lobby & Lounge" },
    { key: "bedroom", label: "Apartments" },
    { key: "bathroom", label: "Bathrooms" },
    { key: "dining", label: "Dining" },
    { key: "amenities", label: "Amenities" },
  ],

  policies: {
    cancellation: "PLACEHOLDER — add the property's cancellation policy",
    pets: "PLACEHOLDER — confirm pet policy",
    smoking: "PLACEHOLDER — confirm smoking policy",
    children: "PLACEHOLDER — confirm children/extra guest policy",
    idRequirement:
      "PLACEHOLDER — confirm ID / registration requirements at check-in",
  },

  faqs: [
    {
      q: "How can I book an apartment at Reno Apartments Abuja?",
      a: "Use the booking form on this website to send a request with your dates and the apartment you're interested in, or message us directly on WhatsApp. Our team will confirm availability and rates with you personally.",
    },
    {
      q: "Where is Reno Apartments Abuja located?",
      a: "We're located at 4 Sam'ila Gwarzo Street, Guzape District, Abuja, Federal Capital Territory, Nigeria. Use the Get Directions button on the Location page to open the route in Google Maps.",
    },
    {
      q: "How can I check availability?",
      a: "Submit a booking request with your check-in and check-out dates through the website, or contact us on WhatsApp or by phone. Because availability is confirmed by our team, we don't publish live calendars online.",
    },
    {
      q: "Can I enquire through WhatsApp?",
      a: "Yes — WhatsApp is the fastest way to reach us. Tap any WhatsApp button on the site to start a chat that's already filled in with your enquiry details.",
    },
    {
      q: "How do I get directions to the property?",
      a: "Tap Get Directions anywhere on the site to open our exact location in Google Maps from your device.",
    },
    {
      q: "What are the check-in and check-out times?",
      a: "PLACEHOLDER — Reno Apartments Abuja has not yet confirmed standard check-in/check-out times for this website. Please contact us directly and we'll update this page once confirmed.",
    },
  ],
};

// Expose for both classic <script> usage and any future module bundling.
// (Top-level `const` does NOT become a `window` property automatically —
// this explicit assignment is what makes `window.PROPERTY` available to
// every other script on the page.)
window.PROPERTY = PROPERTY;
if (typeof module !== "undefined") {
  module.exports = PROPERTY;
}
