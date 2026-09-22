export type GeoRef = { id: string; code: string; name: string } | null;

export type DiagnosticCenterType = {
  id: string;
  code: string;
  name: string | null;
  address: string | null;
  description: string | null;
  stateName: string | null;
  lgaName: string | null;
  openHours: string | null;
  rating: string | null;
  providerId: string | null;
  sourceUrl: string | null;
  state: GeoRef;
  lga: GeoRef;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type DiagnosticCenterListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, string>;
};
