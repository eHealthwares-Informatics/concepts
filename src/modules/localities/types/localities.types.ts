export type LocalityType = {
  id: string;
  code: string;
  type: string;
  name: string;
  gazetteerWardCode: string | null;
  lon: number | null;
  lat: number | null;
  pharmacyCount: number;
  source: string | null;
  confidence: string | null;
};

export type NearbyLocalityType = {
  tier: string | null;
  distanceKm: number | null;
  locality: LocalityType | null;
};

export type LocalityListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  filters?: Record<string, string>;
};
