export type OfficerUnit = "organizations" | "card-issuance";

export type Officer = {
  /** Unique per appointment; the same person may be appointed more than once */
  id: string;
  userId: string;
  roleId: string;
  fullName: string;
  phone: string;
  appointedAt: string;
  dismissedAt: string | null;
};

export type ListOfficersParams = {
  unit: OfficerUnit;
  page: number;
  pageSize: number;
};

export type AddOfficerPayload = {
  unit: OfficerUnit;
  fullName: string;
  phone: string;
};

export type DismissOfficerPayload = {
  unit: OfficerUnit;
  officer: Officer;
};
