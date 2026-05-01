export interface ArtWave {
  id: string;
  slug: string;
  name: string;
  name_uk?: string | null;
  period?: string | null;
  start_year?: number | null;
  end_year?: number | null;
  description: string;
  full_description?: string | null;
  cover_image_url?: string | null;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArtArtist {
  id: string;
  slug: string;
  name: string;
  name_uk?: string | null;
  born?: number | null;
  died?: number | null;
  birth_place?: string | null;
  short_bio: string;
  full_bio?: string | null;
  profile_image_url?: string | null;
  website_url?: string | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  // Joined in queries
  waves?: ArtWave[];
}

export interface ArtObject {
  id: string;
  slug: string;
  title: string;
  title_uk?: string | null;
  artist_id?: string | null;
  wave_id?: string | null;
  year?: number | null;
  medium?: string | null;
  dimensions?: string | null;
  location?: string | null;
  short_description: string;
  full_description?: string | null;
  image_url?: string | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  // Joined in queries
  artist?: ArtArtist | null;
  wave?: ArtWave | null;
}

// Form payloads (omit DB-generated fields)
export type ArtWavePayload = Omit<ArtWave, 'id' | 'created_at' | 'updated_at'>;
export type ArtArtistPayload = Omit<ArtArtist, 'id' | 'created_at' | 'updated_at' | 'waves'> & {
  wave_ids?: string[];
};
export type ArtObjectPayload = Omit<ArtObject, 'id' | 'created_at' | 'updated_at' | 'artist' | 'wave'>;
