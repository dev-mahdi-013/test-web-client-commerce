import { fromEpoch, type ApiCardDetails } from "@/lib/commerce-http";
import type {
  AgendaCandidate,
  AgendaKind,
  Assembly,
  AssemblyAgenda,
  AssemblyCardType,
  AssemblyDetail,
  AssemblyStatus,
  AssemblyUnit,
  AssemblyVoters,
} from "../types";

/** Backend poll status codes (see Commerce poll status in the API docs). */
export const pollStatusCode: Record<AssemblyStatus, number | null> = {
  pending: 0x01,
  canceled: 0x02,
  published: 0x03,
  running: 0x04,
  finished: 0x05,
  archived: null,
};

const statusByCode: Record<number, AssemblyStatus> = {
  0x01: "pending",
  0x02: "canceled",
  0x03: "published",
  0x04: "running",
  0x05: "finished",
};

/** Backend eligibility scopes (All / RealCardsOnly / LegalCardsOnly). */
export const eligibilityCode: Record<AssemblyUnit, number> = {
  همه: 0x01,
  حقیقی: 0x02,
  حقوقی: 0x03,
};

/** Backend card scopes (AllCards / CommerceCardsOnly). */
export const cardScopeCode: Record<AssemblyCardType, number> = {
  همه: 0x01,
  بازرگانی: 0x02,
};

const unitByCode: Record<number, AssemblyUnit> = {
  0x01: "همه",
  0x02: "حقیقی",
  0x03: "حقوقی",
};

export const pollOperation = {
  sendToReview: 0x01,
  reDraft: 0x02,
  approve: 0x03,
  startVoting: 0x04,
  endVoting: 0x05,
} as const;

export function toPollStatusCode(status: AssemblyStatus) {
  return pollStatusCode[status] ?? undefined;
}

export function toAssemblyStatus(code: number): AssemblyStatus {
  return statusByCode[code] ?? "pending";
}

export function toEligibilityCode(unit: AssemblyUnit) {
  return eligibilityCode[unit];
}

export function toCardScopeCode(cardType: AssemblyCardType) {
  return cardScopeCode[cardType];
}

export function toAssemblyUnit(code: number | string | undefined): AssemblyUnit {
  if (code == null || code === "") return "حقوقی";
  const normalized = typeof code === "string" ? Number(code) : code;
  return unitByCode[normalized] ?? "حقوقی";
}

export type ApiPollTarget = {
  type: string;
  data: {
    _id: string;
    name: string;
    membersCount?: number;
    allowedMembersCount?: number;
    eligibilityScope?: number;
    cardScope?: number;
  };
};

export type ApiPoll = {
  _id: string;
  title: string;
  stats?: { registerCount?: number; votersCount?: number };
  status: number;
  target?: ApiPollTarget;
  createdBy?: { type?: string; data?: { _id?: string; name?: string } };
  createdDate?: number;
  pollDate?: number;
  startDate?: number;
  endDate?: number;
};

type ApiSurveyMemberItem = {
  type: "Member";
  data: {
    _id: string;
    memberId?: string;
    memberName: string;
    memberCard?: ApiCardDetails;
    votesCount?: number;
    votersCount?: number;
  };
};

type ApiSurveyFreeItem = {
  type: "Free";
  data: {
    _id: string;
    content: string;
    votesCount?: number;
    votersCount?: number;
  };
};

export type ApiSurveyItem = ApiSurveyMemberItem | ApiSurveyFreeItem;

export type ApiSurvey = {
  _id: string;
  pollId?: string;
  title: string;
  voted?: ({ _id?: string } & Record<string, unknown>) | null;
  maxSelection?: number;
  eligibilityScope?: number;
  orderItemSource?: { type?: string };
  items?: ApiSurveyItem[];
};

function formatClock(iso: string | null) {
  if (!iso) return "--:--";
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function createdByLabel(poll: ApiPoll) {
  const by = poll.createdBy;
  if (by?.data?.name) return by.data.name;
  if (by?.type === "Chamber") return "اتاق";
  if (by?.type === "Association") return "انجمن";
  return "—";
}

export function toAssembly(poll: ApiPoll): Assembly {
  const total = poll.target?.data.membersCount ?? 0;
  const eligible = poll.target?.data.allowedMembersCount ?? 0;
  const voted = poll.stats?.votersCount ?? 0;
  const present = poll.stats?.registerCount ?? 0;
  const startIso = fromEpoch(poll.startDate ?? 0);
  const endIso = fromEpoch(poll.endDate ?? 0);

  return {
    id: poll._id,
    title: poll.title,
    association: poll.target?.data.name ?? "—",
    associationId: poll.target?.data._id ?? null,
    status: toAssemblyStatus(poll.status),
    announcedAt: fromEpoch(poll.createdDate ?? 0),
    createdBy: createdByLabel(poll),
    createdById: poll.createdBy?.data?._id ?? null,
    createdAt: fromEpoch(poll.createdDate ?? 0),
    newsDate: fromEpoch(poll.pollDate ?? 0),
    startsAt: formatClock(startIso),
    endsAt: formatClock(endIso),
    endsAtDate: endIso,
    unit: toAssemblyUnit(poll.target?.data.eligibilityScope),
    voters: {
      total,
      eligible,
      voted,
      present,
      remaining: Math.max(0, total - voted),
    },
  };
}

function toCandidate(item: ApiSurveyItem): AgendaCandidate {
  if (item.type === "Member") {
    return {
      id: item.data._id,
      name: item.data.memberName,
      cardNo: item.data.memberCard?.cardNum ?? null,
      memberId: item.data.memberId,
      voterCount: item.data.votersCount ?? 0,
      voteCount: item.data.votesCount ?? 0,
    };
  }
  return {
    id: item.data._id,
    name: item.data.content,
    cardNo: null,
    voterCount: item.data.votersCount ?? 0,
    voteCount: item.data.votesCount ?? 0,
  };
}

const VOTED_OPTION_KEYS = ["voteOptions", "options", "items", "selectedItems", "selected", "votes", "answers"];

function votedOptionId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const data = record.data && typeof record.data === "object" ? (record.data as Record<string, unknown>) : {};
  for (const candidate of [record.itemId, record.optionId, record._id, record.id, data._id]) {
    if (typeof candidate === "string") return candidate;
  }
  return null;
}

/** Candidate ids the current user already voted for, matched on item id or member id. */
function toVotedOptionIds(survey: ApiSurvey, candidates: AgendaCandidate[]): string[] {
  const voted = survey.voted;
  if (!voted) return [];

  const raw: string[] = [];
  for (const key of VOTED_OPTION_KEYS) {
    const list = voted[key];
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      const id = votedOptionId(entry);
      if (id) raw.push(id);
    }
  }

  const ids = new Set<string>();
  for (const id of raw) {
    const match = candidates.find((candidate) => candidate.id === id || candidate.memberId === id);
    if (match) ids.add(match.id);
  }
  return [...ids];
}

export function toAgenda(survey: ApiSurvey): AssemblyAgenda {
  const kind: AgendaKind = survey.orderItemSource?.type === "FromMembers" ? "person" : "text";
  const candidates = (survey.items ?? []).map(toCandidate);
  return {
    id: survey._id,
    title: survey.title,
    hasVoted: Boolean(survey.voted?._id),
    votedOptionIds: toVotedOptionIds(survey, candidates),
    kind,
    unit: toAssemblyUnit(survey.eligibilityScope),
    minSelections: survey.maxSelection ?? 1,
    candidates,
  };
}

function toVoterStats(poll: ApiPoll): AssemblyVoters {
  const total = poll.target?.data.membersCount ?? 0;
  const eligible = poll.target?.data.allowedMembersCount ?? 0;
  const present = poll.stats?.registerCount ?? 0;
  const voted = poll.stats?.votersCount ?? 0;
  return {
    total,
    eligible,
    voted,
    present,
  };
}

export function toAssemblyDetail(poll: ApiPoll, surveys: ApiSurvey[]): AssemblyDetail {
  const assembly = toAssembly(poll);
  return {
    ...assembly,
    voterStats: toVoterStats(poll),
    agendas: surveys.map(toAgenda),
  };
}
