// Wandr demo data — works without any backend

export interface TourStop {
  order: number
  title: string
  description?: string
  latitude: number
  longitude: number
  audio_duration_seconds?: number
  walking_duration_seconds?: number
  image_url?: string
  image_caption?: string
}

export interface Tour {
  id: number
  title: string
  description: string
  city: string
  country: string
  theme: string
  difficulty: string
  price: number
  currency: string
  duration_minutes: number
  distance_km: number
  original_language: string
  available_languages: string[]
  cover_image_url: string
  avg_rating: number
  review_count: number
  total_purchases: number
  stops: TourStop[]
  guide: {
    name: string
    avatar_url: string
    bio: string
    tagline: string
    is_verified_local: boolean
  }
}

export const themeLabels: Record<string, string> = {
  history: 'History',
  food: 'Food & Drink',
  architecture: 'Architecture',
  hidden_gems: 'Hidden Gems',
  nightlife: 'Nightlife',
  street_art: 'Street Art',
  culture: 'Culture',
  nature: 'Nature',
  photography: 'Photography',
}

export const demoTours: Tour[] = [
  {
    id: 1,
    title: 'Alfama: Fado & Forgotten Stories',
    description: "Wind through Lisbon's oldest neighborhood, where every alley has a story. From Moorish walls to fado houses, discover 900 years of history in 90 minutes.",
    city: 'Lisbon', country: 'Portugal',
    theme: 'history', difficulty: 'moderate',
    price: 7.99, currency: 'EUR',
    duration_minutes: 90, distance_km: 2.8,
    original_language: 'en', available_languages: ['en', 'pt', 'es'],
    cover_image_url: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800',
    avg_rating: 4.7, review_count: 24, total_purchases: 89,
    guide: {
      name: 'Ana Rodrigues',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      bio: "Lisbon-born historian and storyteller. I've been giving walking tours for 8 years and fell in love with sharing my city's hidden layers.",
      tagline: 'History whispered through cobblestones',
      is_verified_local: true,
    },
    stops: [
      { order: 1, title: 'Miradouro de Santa Luzia', description: 'Start at this iconic viewpoint overlooking the red rooftops of Alfama and the Tagus river.', latitude: 38.7118, longitude: -9.1304, audio_duration_seconds: 180 },
      { order: 2, title: 'Largo das Portas do Sol', description: 'Just steps away, this square was once a gate in the Moorish city walls.', latitude: 38.7124, longitude: -9.1298, audio_duration_seconds: 210, walking_duration_seconds: 60 },
      { order: 3, title: 'Rua de São Miguel', description: 'Dive into the heart of Alfama through this narrow, laundry-draped street.', latitude: 38.7109, longitude: -9.1300, audio_duration_seconds: 240, walking_duration_seconds: 120 },
      { order: 4, title: 'Feira da Ladra Corner', description: 'The thieves\' market has operated here since the 12th century.', latitude: 38.7150, longitude: -9.1264, audio_duration_seconds: 195, walking_duration_seconds: 180 },
      { order: 5, title: 'Panteão Nacional', description: 'The stunning National Pantheon, once a church plagued by collapses and legends of a curse.', latitude: 38.7153, longitude: -9.1247, audio_duration_seconds: 270, walking_duration_seconds: 90 },
      { order: 6, title: 'Fado Museum Courtyard', description: 'Stand where fado was born — the soulful music of longing and the sea.', latitude: 38.7104, longitude: -9.1313, audio_duration_seconds: 300, walking_duration_seconds: 240 },
      { order: 7, title: 'Sé de Lisboa', description: "End at Lisbon's medieval cathedral, standing since 1147.", latitude: 38.7098, longitude: -9.1325, audio_duration_seconds: 250, walking_duration_seconds: 180 },
    ],
  },
  {
    id: 2,
    title: 'Belém: Age of Discovery Walk',
    description: 'Trace the footsteps of Vasco da Gama and Magellan along the riverfront where Portugal launched its maritime empire.',
    city: 'Lisbon', country: 'Portugal',
    theme: 'history', difficulty: 'easy',
    price: 6.99, currency: 'EUR',
    duration_minutes: 75, distance_km: 2.2,
    original_language: 'en', available_languages: ['en', 'pt'],
    cover_image_url: 'https://images.unsplash.com/photo-1580323956656-26bbb0a85e75?w=800',
    avg_rating: 4.5, review_count: 18, total_purchases: 62,
    guide: {
      name: 'Ana Rodrigues',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      bio: "Lisbon-born historian and storyteller.",
      tagline: 'History whispered through cobblestones',
      is_verified_local: true,
    },
    stops: [
      { order: 1, title: 'Padrão dos Descobrimentos', description: 'The Monument to the Discoveries stands where ships once departed for unknown worlds.', latitude: 38.6936, longitude: -9.2057, audio_duration_seconds: 240 },
      { order: 2, title: 'Rosa dos Ventos', description: 'The giant compass rose in the pavement maps Portuguese discoveries.', latitude: 38.6933, longitude: -9.2060, audio_duration_seconds: 180, walking_duration_seconds: 30 },
      { order: 3, title: 'Torre de Belém', description: "This UNESCO jewel guarded the entrance to Lisbon's harbour.", latitude: 38.6916, longitude: -9.2160, audio_duration_seconds: 300, walking_duration_seconds: 360 },
      { order: 4, title: 'Mosteiro dos Jerónimos', description: 'The crown jewel of Manueline architecture, built with spice trade wealth.', latitude: 38.6979, longitude: -9.2068, audio_duration_seconds: 350, walking_duration_seconds: 420 },
      { order: 5, title: 'Pastéis de Belém', description: 'No visit is complete without the famous custard tarts, made here since 1837.', latitude: 38.6975, longitude: -9.2032, audio_duration_seconds: 180, walking_duration_seconds: 120 },
      { order: 6, title: 'Jardim de Belém', description: 'End your walk in the gardens, reflecting on five centuries of exploration.', latitude: 38.6971, longitude: -9.2050, audio_duration_seconds: 150, walking_duration_seconds: 60 },
    ],
  },
  {
    id: 3,
    title: "Taste of Mouraria: Lisbon's Secret Kitchen",
    description: "From century-old tascas to Mozambican spice shops, explore the multicultural flavors of Lisbon's most underrated neighborhood.",
    city: 'Lisbon', country: 'Portugal',
    theme: 'food', difficulty: 'easy',
    price: 8.99, currency: 'EUR',
    duration_minutes: 105, distance_km: 2.0,
    original_language: 'en', available_languages: ['en', 'pt', 'fr'],
    cover_image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    avg_rating: 4.9, review_count: 31, total_purchases: 112,
    guide: {
      name: 'Marco Silva',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
      bio: 'Chef turned food guide. After 12 years in Lisbon kitchens, I now take people on culinary adventures.',
      tagline: 'Taste Lisbon like a local',
      is_verified_local: true,
    },
    stops: [
      { order: 1, title: 'Martinho da Arcada (context)', description: "We start near Lisbon's oldest café to set the culinary scene.", latitude: 38.7075, longitude: -9.1364, audio_duration_seconds: 210 },
      { order: 2, title: 'Mercearia do Largo', description: 'A neighborhood grocer where African, Indian, and Portuguese ingredients collide.', latitude: 38.7143, longitude: -9.1348, audio_duration_seconds: 240, walking_duration_seconds: 300 },
      { order: 3, title: 'Tasca do Chico', description: 'A fado tasca where petiscos are served with raw emotion.', latitude: 38.7137, longitude: -9.1341, audio_duration_seconds: 270, walking_duration_seconds: 60 },
      { order: 4, title: 'Cantinho do Aziz', description: "Mozambican-Portuguese fusion in a space the size of a closet — and it's magical.", latitude: 38.7148, longitude: -9.1332, audio_duration_seconds: 240, walking_duration_seconds: 90 },
      { order: 5, title: 'Padaria Portuguesa', description: 'Learn why Portuguese bread culture is an underrated treasure.', latitude: 38.7155, longitude: -9.1326, audio_duration_seconds: 180, walking_duration_seconds: 60 },
      { order: 6, title: 'O Velho Eurico', description: "A traditional tasca that hasn't changed its recipe in 40 years.", latitude: 38.7131, longitude: -9.1310, audio_duration_seconds: 240, walking_duration_seconds: 120 },
      { order: 7, title: 'Ginjinha Stall', description: 'Sip the cherry liqueur that Lisboetas have loved since 1840.', latitude: 38.7143, longitude: -9.1387, audio_duration_seconds: 195, walking_duration_seconds: 180 },
      { order: 8, title: 'Mercado da Figueira', description: 'End at this local market where chefs and grandmothers shop side by side.', latitude: 38.7132, longitude: -9.1378, audio_duration_seconds: 220, walking_duration_seconds: 90 },
    ],
  },
  {
    id: 4,
    title: 'Pastéis & Port: Sweet Side of Lisbon',
    description: "A sugar-fueled stroll through Lisbon's best bakeries, chocolate shops, and wine bars.",
    city: 'Lisbon', country: 'Portugal',
    theme: 'food', difficulty: 'easy',
    price: 6.99, currency: 'EUR',
    duration_minutes: 70, distance_km: 1.8,
    original_language: 'en', available_languages: ['en', 'pt'],
    cover_image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
    avg_rating: 4.6, review_count: 15, total_purchases: 48,
    guide: {
      name: 'Marco Silva',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
      bio: 'Chef turned food guide.',
      tagline: 'Taste Lisbon like a local',
      is_verified_local: true,
    },
    stops: [
      { order: 1, title: 'Manteigaria', description: 'Watch custard tarts being made through the glass window.', latitude: 38.7105, longitude: -9.1422, audio_duration_seconds: 200 },
      { order: 2, title: 'Confeitaria Nacional', description: "Operating since 1829, this is Portugal's oldest confectionery.", latitude: 38.7132, longitude: -9.1387, audio_duration_seconds: 240, walking_duration_seconds: 180 },
      { order: 3, title: 'Landeau Chocolate', description: 'The chocolate cake that has Lisbon obsessed.', latitude: 38.7075, longitude: -9.1462, audio_duration_seconds: 180, walking_duration_seconds: 240 },
      { order: 4, title: 'By the Wine', description: 'A cozy José Maria da Fonseca wine bar in Chiado.', latitude: 38.7108, longitude: -9.1420, audio_duration_seconds: 220, walking_duration_seconds: 180 },
      { order: 5, title: 'Fábrica dos Pastéis de Nata', description: 'Compare your pastéis — which bakery wins?', latitude: 38.7145, longitude: -9.1398, audio_duration_seconds: 180, walking_duration_seconds: 150 },
      { order: 6, title: 'A Ginjinha', description: 'End with a shot of ginjinha at this legendary standing-room-only bar.', latitude: 38.7152, longitude: -9.1390, audio_duration_seconds: 160, walking_duration_seconds: 60 },
    ],
  },
  {
    id: 5,
    title: 'LX Factory to Alcântara: Street Art Trail',
    description: "Discover massive murals, political stencils, and guerrilla installations in Lisbon's creative west side.",
    city: 'Lisbon', country: 'Portugal',
    theme: 'street_art', difficulty: 'easy',
    price: 5.99, currency: 'EUR',
    duration_minutes: 80, distance_km: 2.5,
    original_language: 'en', available_languages: ['en', 'pt', 'de'],
    cover_image_url: 'https://images.unsplash.com/photo-1561059488-916d69792237?w=800',
    avg_rating: 4.8, review_count: 20, total_purchases: 73,
    guide: {
      name: 'Sofia Mendes',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
      bio: 'Street art curator and urban culture enthusiast. I track every new mural, stencil, and paste-up across the city.',
      tagline: 'The city is the canvas',
      is_verified_local: true,
    },
    stops: [
      { order: 1, title: 'LX Factory Entrance Mural', description: 'The gateway piece by Bordalo II, made from recycled trash — a fox that watches over the complex.', latitude: 38.7036, longitude: -9.1780, audio_duration_seconds: 220 },
      { order: 2, title: 'Ler Devagar Bookshop Wall', description: 'The iconic printing-press-turned-bookshop with its flying bicycle sculpture.', latitude: 38.7032, longitude: -9.1775, audio_duration_seconds: 200, walking_duration_seconds: 60 },
      { order: 3, title: 'Vhils Carved Portrait', description: 'Alexandre Farto (Vhils) carved this face directly into the wall with drills and chisels.', latitude: 38.7040, longitude: -9.1768, audio_duration_seconds: 270, walking_duration_seconds: 90 },
      { order: 4, title: 'Underdogs Gallery Wall', description: 'Curated outdoor gallery showcasing rotating international artists.', latitude: 38.7025, longitude: -9.1745, audio_duration_seconds: 240, walking_duration_seconds: 150 },
      { order: 5, title: 'Alcântara Railway Overpass', description: 'A 200-meter gallery of paste-ups and political stencils under the railway.', latitude: 38.7015, longitude: -9.1720, audio_duration_seconds: 260, walking_duration_seconds: 180 },
      { order: 6, title: 'Utopia Mural', description: "A 4-story collaborative piece imagining Lisbon's future.", latitude: 38.7008, longitude: -9.1695, audio_duration_seconds: 200, walking_duration_seconds: 150 },
      { order: 7, title: 'Village Underground Lisboa', description: 'End at the creative hub housed in repurposed shipping containers and double-decker buses.', latitude: 38.7020, longitude: -9.1670, audio_duration_seconds: 180, walking_duration_seconds: 120 },
    ],
  },
  {
    id: 6,
    title: 'Bairro Alto After Dark: Nightlife & Neon',
    description: "Experience Lisbon's legendary nightlife district — from centuries-old wine bars to underground clubs.",
    city: 'Lisbon', country: 'Portugal',
    theme: 'nightlife', difficulty: 'easy',
    price: 5.99, currency: 'EUR',
    duration_minutes: 60, distance_km: 1.5,
    original_language: 'en', available_languages: ['en', 'pt'],
    cover_image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    avg_rating: 4.4, review_count: 12, total_purchases: 41,
    guide: {
      name: 'Sofia Mendes',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
      bio: 'Street art curator and urban culture enthusiast.',
      tagline: 'The city is the canvas',
      is_verified_local: true,
    },
    stops: [
      { order: 1, title: 'Miradouro de São Pedro de Alcântara', description: 'Start at sunset with the city glowing below you.', latitude: 38.7160, longitude: -9.1455, audio_duration_seconds: 180 },
      { order: 2, title: 'Solar do Vinho do Porto', description: 'A 250-year tradition of port wine tasting in a palace.', latitude: 38.7155, longitude: -9.1462, audio_duration_seconds: 220, walking_duration_seconds: 60 },
      { order: 3, title: 'Rua da Rosa', description: 'The beating heart of Bairro Alto nightlife — 50 bars in 200 meters.', latitude: 38.7135, longitude: -9.1445, audio_duration_seconds: 200, walking_duration_seconds: 120 },
      { order: 4, title: 'Tasca do Chico', description: 'Spontaneous fado happens here — locals sing from their tables.', latitude: 38.7130, longitude: -9.1440, audio_duration_seconds: 260, walking_duration_seconds: 60 },
      { order: 5, title: 'Pensão Amor', description: 'A former brothel turned bohemian bar with a library of erotica.', latitude: 38.7075, longitude: -9.1448, audio_duration_seconds: 240, walking_duration_seconds: 240 },
      { order: 6, title: 'Pink Street (Rua Nova do Carvalho)', description: "End on Lisbon's famous pink-painted street, the new center of nightlife.", latitude: 38.7070, longitude: -9.1445, audio_duration_seconds: 200, walking_duration_seconds: 60 },
    ],
  },
]
