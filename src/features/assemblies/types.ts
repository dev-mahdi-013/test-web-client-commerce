export type AssemblyStatus = "published" | "running" | "pending" | "finished" | "archived" | "canceled";

/** Backend eligibilityScope: All `0x01` / RealCardsOnly `0x02` / LegalCardsOnly `0x03`. */
export type AssemblyUnit = "همه" | "حقیقی" | "حقوقی";

/** نوع کارت chosen when creating an assembly. */
export type AssemblyCardType = "همه" | "بازرگانی";

export type AssemblyVoterStat = {
  /** `target.data.membersCount` — کل */
  total: number;
  /** `target.data.allowedMembersCount` — واجدین */
  eligible: number;
  /** `stats.votersCount` — رأی‌دهندگان */
  voted: number;
  /** `stats.registerCount` — حاضرین */
  present: number;
  /** `total - voted` */
  remaining: number;
};

export type Assembly = {
  id: string;
  title: string;
  association: string;
  associationId: string | null;
  status: AssemblyStatus;
  announcedAt: string | null;
  createdBy: string;
  createdById: string | null;
  createdAt: string | null;
  /** `pollDate` — روز رای‌گیری */
  newsDate: string | null;
  startsAt: string;
  /** Clock label from `endDate` (e.g. `09:30`). */
  endsAt: string;
  /** Full ISO from backend `endDate`; null while voting has not ended yet. */
  endsAtDate: string | null;
  unit: AssemblyUnit;
  /** `cardScope` — نوع کارت the assembly is limited to (همه / بازرگانی). */
  cardType: AssemblyCardType;
  voters: AssemblyVoterStat;
};

export type AgendaKind = "person" | "text";

export type AgendaCandidate = {
  id: string;
  name: string;
  cardNo: string | null;
  memberId?: string;
  voterCount: number;
  voteCount: number;
};

export type AssemblyAgenda = {
  id: string;
  title: string;
  hasVoted?: boolean;
  /** Candidate ids the current user already voted for (from `survey.voted`). */
  votedOptionIds?: string[];
  kind: AgendaKind;
  unit: AssemblyUnit;
  minSelections: number;
  candidates: AgendaCandidate[];
};

export type AssemblyVoters = {
  total: number;
  eligible: number;
  present: number;
  voted: number;
};

export type AssemblyDetail = Assembly & {
  voterStats: AssemblyVoters;
  agendas: AssemblyAgenda[];
};

export type ListAssembliesParams = {
  page: number;
  query?: string;
  status?: AssemblyStatus;
  /** Association document id; the list endpoint filters by this, not the name. */
  association?: string;
};

export type CreateAssemblyInput = {
  title: string;
  votingDay: string;
  associationId: string;
  unit: AssemblyUnit;
  /** Sent as the poll's `cardScope`: همه → all cards, بازرگانی → commerce cards only. */
  cardType?: AssemblyCardType;
};

export type CreateAgendaInput = {
  title: string;
  maxSelections: number;
  kind: AgendaKind;
  unit: AssemblyUnit;
  candidates: AgendaCandidateInput[];
};

export type AgendaCandidateInput =
  | { name: string; cardNo?: string | null; memberId: string; memberRoleId: string }
  | { name: string; cardNo?: string | null; memberId?: undefined; memberRoleId?: undefined };

export type UpdateAgendaInput = {
  title?: string;
  unit?: AssemblyUnit;
  minSelections?: number;
};

export type AddAgendaCandidateInput = {
  agendaId: string;
  candidate: AgendaCandidateInput;
};
