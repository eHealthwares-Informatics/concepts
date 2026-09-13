export type LocalityRef = { id: string; code: string; name: string; type: string };

export type PharmacyType = {
  id: string;
  premisesId: string;
  premisesName: string | null;
  premisesAddress: string | null;
  premisesState: string | null;
  pharmacistId: string | null;
  pharmacistFirstName: string | null;
  pharmacistMiddleName: string | null;
  pharmacistLastName: string | null;
  pharmacist: string | null;
  stateCode: string | null;
  stateName: string | null;
  lgaName: string | null;
  lgaCode: string | null;
  wardName: string | null;
  wardCode: string | null;
  area: string | null;
  neighbourhood: string | null;
  settlement: string | null;
  settlementCode: string | null;
  stateMatch: string | null;
  certificateNo: string | null;
  category: string | null;
  yearLicenced: string | null;
  dateApproved: string | null;
  isLicencePrinted: boolean;
  datePrinted: string | null;
  matchedStateCode: string | null;
  matchedLgaCode: string | null;
  matchedWardCode: string | null;
  lgaMatch: string | null;
  wardMatch: string | null;
  state: { id: string; code: string; name: string } | null;
  lga: { id: string; code: string; name: string } | null;
  ward: { id: string; code: string; name: string } | null;
  areaLocality: LocalityRef | null;
  neighbourhoodLocality: LocalityRef | null;
  settlementLocality: LocalityRef | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type NearbyPharmacyType = PharmacyType & {
  nearbyTier: string | null;
  nearbyDistanceKm: number | null;
};

export type PharmacyListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, string>;
};
