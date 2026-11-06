export type OfficerUnit =
  | "organizations"
  | "card-issuance"
  /** ChamberPollAgent 0x16 — «مامور اخذ رای اتاق استان» */
  | "chamber-poll-agent"
  /** AssociationPollAgent 0x17 — «مامور اخذ رای انجمن» */
  | "association-poll-agent";

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
