import { jalaliToDate } from "@/lib/date";
import { commerceBlob, commerceHttp, commercePage, toEpoch } from "@/lib/commerce-http";
import { currentCommerceScope, type CommerceScope } from "@/lib/commerce-scope";
import { ApiError, type DownloadProgressHandler } from "@/lib/http";
import type { Paginated } from "@/shared/types/api";
import type {
  Assembly,
  AssemblyCardType,
  AssemblyDetail,
  AssemblyStatus,
  CreateAgendaInput,
  CreateAssemblyInput,
  AddAgendaCandidateInput,
  ListAssembliesParams,
  PollMember,
  UpdateAgendaInput,
} from "../types";
import {
  pollOperation,
  toAgenda,
  toAssembly,
  toAssemblyDetail,
  toCardScopeCode,
  toEligibilityCode,
  toPollStatusCode,
  type ApiPoll,
  type ApiSurvey,
} from "./poll-mappers";

function pollsBase(scope: CommerceScope = currentCommerceScope()) {
  return `/${scope}/polls`;
}

function jalaliToEpoch(value: string) {
  const [jy = 0, jm = 0, jd = 0] = value.split("/").map(Number);
  return toEpoch(jalaliToDate({ jy, jm, jd }));
}

function filterByQuery(items: Assembly[], query?: string) {
  const keyword = query?.trim();
  if (!keyword) return items;
  return items.filter(
    (assembly) => assembly.title.includes(keyword) || assembly.createdBy.includes(keyword),
  );
}

/** One row of `/polls/{id}/members/list`; the docs do not pin the response shape down. */
type ApiPollMemberRow = {
  _id?: string;
  id?: string;
  roleId?: string;
  memberId?: string;
  memberRoleId?: string;
  name?: string;
  memberName?: string;
  fullName?: string;
  phone?: string;
  memberPhone?: string;
  cardNum?: string;
  cardNo?: string;
  cardNumber?: string;
  cardDetails?: { cardNum?: string; cardNo?: string; cardNumber?: string };
  memberCard?: {
    cardNum?: string;
    cardNo?: string;
    cardNumber?: string;
    cardDetails?: { cardNum?: string; cardNo?: string; cardNumber?: string };
  };
  card?: {
    _id?: string;
    cardNum?: string;
    cardNo?: string;
    cardNumber?: string;
    cardDetails?: { cardNum?: string; cardNo?: string; cardNumber?: string };
  };
  cards?: Array<{
    _id?: string;
    cardNum?: string;
    cardNo?: string;
    cardNumber?: string;
    cardDetails?: { cardNum?: string; cardNo?: string; cardNumber?: string };
  }>;
  data?: ApiPollMemberRow;
};

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return null;
}

/** Cursor for the next page of the poll members list; the docs do not pin the response shape down. */
function nextCursorOf(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const record = payload as Record<string, unknown>;
  const meta = record.meta && typeof record.meta === "object" ? (record.meta as Record<string, unknown>) : {};
  const pagination =
    record.pagination && typeof record.pagination === "object"
      ? (record.pagination as Record<string, unknown>)
      : {};
  const directCursor = firstText(
    record.nextCursor,
    record.next_cursor,
    meta.nextCursor,
    meta.next_cursor,
    pagination.nextCursor,
    pagination.next_cursor,
  );
  if (directCursor) return directCursor;
  return record.data && typeof record.data === "object" ? nextCursorOf(record.data) : null;
}

export type PollMembersPage = { items: PollMember[]; nextCursor: string | null };

/** Accepts a bare array and the wrappers the service has used for other member lists. */
function pollMemberRows(payload: unknown): ApiPollMemberRow[] {
  if (Array.isArray(payload)) return payload as ApiPollMemberRow[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["items", "members", "list", "rows", "data"]) {
    const value = record[key];
    if (Array.isArray(value)) return value as ApiPollMemberRow[];
    if (value && typeof value === "object") return pollMemberRows(value);
  }
  return [];
}

function toPollMember(source: ApiPollMemberRow): PollMember | null {
  const row = source.data ?? source;
  const memberId = firstText(row.memberId, row._id, row.id);
  // The QR auth endpoint needs the card role id next to the member id.
  const memberRoleId = firstText(row.memberRoleId, row.roleId, row.card?._id, row.cards?.[0]?._id);
  if (!memberId || !memberRoleId) return null;
  const memberCard = row.cards?.find((card) => card._id === memberRoleId) ?? row.cards?.[0];
  return {
    memberId,
    memberRoleId,
    name: firstText(row.memberName, row.name, row.fullName) ?? "—",
    phone: firstText(row.phone, row.memberPhone),
    cardNo: firstText(
      row.cardNum,
      row.cardNo,
      row.cardNumber,
      row.cardDetails?.cardNum,
      row.cardDetails?.cardNo,
      row.cardDetails?.cardNumber,
      row.memberCard?.cardNum,
      row.memberCard?.cardNo,
      row.memberCard?.cardNumber,
      row.memberCard?.cardDetails?.cardNum,
      row.memberCard?.cardDetails?.cardNo,
      row.memberCard?.cardDetails?.cardNumber,
      row.card?.cardDetails?.cardNum,
      row.card?.cardDetails?.cardNo,
      row.card?.cardDetails?.cardNumber,
      row.card?.cardNum,
      row.card?.cardNo,
      row.card?.cardNumber,
      memberCard?.cardDetails?.cardNum,
      memberCard?.cardDetails?.cardNo,
      memberCard?.cardDetails?.cardNumber,
      memberCard?.cardNum,
      memberCard?.cardNo,
      memberCard?.cardNumber,
    ),
  };
}

async function listPollsPage(params: ListAssembliesParams): Promise<Paginated<Assembly>> {
  const scope = currentCommerceScope();
  const status = params.status ? toPollStatusCode(params.status) : undefined;

  if (scope === "cm") {
    const polls = await commerceHttp<ApiPoll[]>(`${pollsBase(scope)}/list`);
    const mapped = filterByQuery(polls.map(toAssembly), params.query);
    const pageSize = Math.max(1, mapped.length) || 1;
    return {
      items: mapped,
      page: 1,
      pageSize,
      total: mapped.length,
      totalPages: 1,
    };
  }

  const page = await commercePage<ApiPoll, Assembly>(
    `${pollsBase(scope)}/list`,
    {
      page: params.page,
      status: status ?? undefined,
      // The association-president list is already scoped to the active association.
      associationId: scope === "ap" ? undefined : params.association,
    },
    toAssembly,
  );

  return { ...page, items: filterByQuery(page.items, params.query) };
}

async function fetchPoll(assemblyId: string): Promise<ApiPoll | null> {
  const scope = currentCommerceScope();
  if (scope === "cm") {
    const polls = await commerceHttp<ApiPoll[]>(`${pollsBase(scope)}/list`);
    return polls.find((poll) => poll._id === assemblyId) ?? null;
  }
  try {
    return await commerceHttp<ApiPoll>(`${pollsBase(scope)}/${assemblyId}/info`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

async function fetchSurveys(assemblyId: string) {
  const surveys = await commerceHttp<ApiSurvey[]>(`${pollsBase()}/${assemblyId}/surveys/list`);
  return Array.isArray(surveys) ? surveys : [];
}

async function detailOf(poll: ApiPoll): Promise<AssemblyDetail> {
  const surveys = await fetchSurveys(poll._id);
  return toAssemblyDetail(poll, surveys);
}

function operationsForStatusChange(current: AssemblyStatus, next: AssemblyStatus) {
  if (next === "canceled" && current === "pending") return [pollOperation.sendToReview];
  if (next === "published" && current === "canceled") return [pollOperation.approve];
  if (next === "pending" && (current === "canceled" || current === "published")) {
    return [pollOperation.reDraft];
  }
  if (next === "running") {
    // Reviewing must be approved before the vote can start.
    if (current === "canceled") return [pollOperation.approve, pollOperation.startVoting];
    if (current === "published") return [pollOperation.startVoting];
  }
  if (next === "finished" && current === "running") return [pollOperation.endVoting];
  return [];
}

export const assembliesApi = {
  listAssemblies: listPollsPage,

  /** Members of the poll that can receive an in-person voting slip (فیش). */
  listPollMembers: async (
    assemblyId: string,
    { searchKeyword, cursor }: { searchKeyword?: string; cursor?: string } = {},
  ): Promise<PollMembersPage> => {
    // `envelope` keeps the whole body so the next-page cursor is not dropped with the wrapper.
    const payload = await commerceHttp<unknown>(`${pollsBase()}/${assemblyId}/members/list`, {
      params: { searchKeyword: searchKeyword?.trim() || undefined, cursor: cursor || undefined },
      envelope: true,
    });
    const items = pollMemberRows(payload)
      .map(toPollMember)
      .filter((member): member is PollMember => member !== null);
    return { items, nextCursor: nextCursorOf(payload) };
  },

  /** QR auth letter (PDF) of one member in the poll. */
  downloadPollMemberQrAuth: async (
    assemblyId: string,
    memberId: string,
    memberRoleId: string,
    onDownloadProgress?: DownloadProgressHandler,
  ) =>
    commerceBlob(
      `${pollsBase()}/${assemblyId}/members/${memberId}/${memberRoleId}/genQRAuth`,
      onDownloadProgress,
    ),

  getAssembly: async (assemblyId: string) => {
    const poll = await fetchPoll(assemblyId);
    return poll ? detailOf(poll) : null;
  },

  createAssembly: async (input: CreateAssemblyInput) => {
    const scope = currentCommerceScope();
    const poll = await commerceHttp<ApiPoll>(`${pollsBase(scope)}/new`, {
      method: "POST",
      body: {
        title: input.title.trim(),
        pollDate: jalaliToEpoch(input.votingDay),
        eligibilityScope: toEligibilityCode(input.unit),
        cardScope: toCardScopeCode(input.cardType ?? "همه"),
        allowOnlineVoting: input.allowOnlineVoting ?? false,
        // The association-president endpoint is bound to its own association.
        associationId: scope === "ap" ? undefined : input.associationId,
      },
    });
    return toAssembly(poll);
  },

  deleteAssembly: async (assemblyId: string) => {
    await commerceHttp(`${pollsBase()}/${assemblyId}/remove`, { method: "DELETE" });
    return { ok: true as const };
  },

  updateAssemblyStatus: async (assemblyId: string, status: AssemblyStatus) => {
    const poll = await fetchPoll(assemblyId);
    if (!poll) throw new Error("مجمعی پیدا نشد");
    const current = toAssembly(poll).status;
    const operations = operationsForStatusChange(current, status);
    if (operations.length === 0) {
      if (current === status) return detailOf(poll);
      throw new Error("تغییر وضعیت مجمع از وضعیت فعلی امکان‌پذیر نیست");
    }

    for (const operation of operations) {
      await commerceHttp(`${pollsBase()}/${assemblyId}/newOperation`, {
        method: "POST",
        body: { operation },
      });
    }
    return assembliesApi.getAssembly(assemblyId);
  },

  updateAssemblyNewsDate: async (assemblyId: string, votingDay: string) => {
    const poll = await fetchPoll(assemblyId);
    if (!poll) throw new Error("مجمعی پیدا نشد");
    // Update returns an empty `data` payload; refetch the poll afterward.
    await commerceHttp(`${pollsBase()}/${assemblyId}/update`, {
      method: "POST",
      body: {
        title: poll.title,
        pollDate: jalaliToEpoch(votingDay),
        eligibilityScope: poll.target?.data.eligibilityScope ?? toEligibilityCode("حقوقی"),
        cardScope: poll.target?.data.cardScope ?? toCardScopeCode("همه"),
        allowOnlineVoting: poll.allowOnlineVoting !== false,
      },
    });
    const refreshed = await fetchPoll(assemblyId);
    if (!refreshed) throw new Error("مجمعی پیدا نشد");
    return toAssembly(refreshed);
  },

  updateAssemblyTitle: async (assemblyId: string, title: string) => {
    const poll = await fetchPoll(assemblyId);
    if (!poll) throw new Error("مجمعی پیدا نشد");
    await commerceHttp(`${pollsBase()}/${assemblyId}/update`, {
      method: "POST",
      body: {
        title: title.trim(),
        pollDate: poll.pollDate ?? 0,
        eligibilityScope: poll.target?.data.eligibilityScope ?? toEligibilityCode("حقوقی"),
        cardScope: poll.target?.data.cardScope ?? toCardScopeCode("همه"),
        allowOnlineVoting: poll.allowOnlineVoting !== false,
      },
    });
    const refreshed = await fetchPoll(assemblyId);
    if (!refreshed) throw new Error("مجمعی پیدا نشد");
    return toAssembly(refreshed);
  },

  updateAssemblyUnit: async (assemblyId: string, unit: Assembly["unit"]) => {
    const poll = await fetchPoll(assemblyId);
    if (!poll) throw new Error("مجمعی پیدا نشد");
    await commerceHttp(`${pollsBase()}/${assemblyId}/update`, {
      method: "POST",
      body: {
        title: poll.title,
        pollDate: poll.pollDate ?? 0,
        eligibilityScope: toEligibilityCode(unit),
        cardScope: poll.target?.data.cardScope ?? toCardScopeCode("همه"),
        allowOnlineVoting: poll.allowOnlineVoting !== false,
      },
    });
    const refreshed = await fetchPoll(assemblyId);
    if (!refreshed) throw new Error("مجمعی پیدا نشد");
    return toAssembly(refreshed);
  },

  /** One request for a whole table row: title, voting day, واجدین and نوع کارت together. */
  updateAssemblyFields: async (
    assemblyId: string,
    input: {
      title?: string;
      votingDay?: string;
      unit?: Assembly["unit"];
      cardType?: AssemblyCardType;
      allowOnlineVoting?: boolean;
    },
  ) => {
    const poll = await fetchPoll(assemblyId);
    if (!poll) throw new Error("مجمعی پیدا نشد");
    await commerceHttp(`${pollsBase()}/${assemblyId}/update`, {
      method: "POST",
      body: {
        title: input.title?.trim() ?? poll.title,
        pollDate: input.votingDay ? jalaliToEpoch(input.votingDay) : (poll.pollDate ?? 0),
        eligibilityScope: input.unit
          ? toEligibilityCode(input.unit)
          : (poll.target?.data.eligibilityScope ?? toEligibilityCode("حقوقی")),
        cardScope: input.cardType
          ? toCardScopeCode(input.cardType)
          : (poll.target?.data.cardScope ?? toCardScopeCode("همه")),
        allowOnlineVoting: input.allowOnlineVoting ?? (poll.allowOnlineVoting !== false),
      },
    });
    const refreshed = await fetchPoll(assemblyId);
    if (!refreshed) throw new Error("مجمعی پیدا نشد");
    return toAssembly(refreshed);
  },

  updateAssemblyCardType: async (assemblyId: string, cardType: AssemblyCardType) => {
    const poll = await fetchPoll(assemblyId);
    if (!poll) throw new Error("مجمعی پیدا نشد");
    await commerceHttp(`${pollsBase()}/${assemblyId}/update`, {
      method: "POST",
      body: {
        title: poll.title,
        pollDate: poll.pollDate ?? 0,
        eligibilityScope: poll.target?.data.eligibilityScope ?? toEligibilityCode("حقوقی"),
        cardScope: toCardScopeCode(cardType),
        allowOnlineVoting: poll.allowOnlineVoting !== false,
      },
    });
    const refreshed = await fetchPoll(assemblyId);
    if (!refreshed) throw new Error("مجمعی پیدا نشد");
    return toAssembly(refreshed);
  },

  addAgenda: async (assemblyId: string, input: CreateAgendaInput) => {
    if (input.kind === "person" && input.candidates.some((candidate) => !candidate.memberId || !candidate.memberRoleId)) {
      throw new Error("برای دستور عضو، کاندیدا باید از فهرست اعضا انتخاب شود");
    }
    const sourceType = input.kind === "person" ? "FromMembers" : "FreeText";

    const survey = await commerceHttp<ApiSurvey>(`${pollsBase()}/${assemblyId}/surveys/add`, {
      method: "POST",
      body: {
        title: input.title.trim(),
        maxSelection: input.maxSelections,
        orderItemSource: { type: sourceType },
      },
    });

    for (const candidate of input.candidates) {
      if (sourceType === "FromMembers" && candidate.memberId && candidate.memberRoleId) {
        await commerceHttp(`${pollsBase()}/${assemblyId}/surveys/${survey._id}/items/add`, {
          method: "POST",
          body: {
            type: "Member",
            data: { memberId: candidate.memberId, memberRoleId: candidate.memberRoleId },
          },
        });
      } else if (candidate.name.trim()) {
        await commerceHttp(`${pollsBase()}/${assemblyId}/surveys/${survey._id}/items/add`, {
          method: "POST",
          body: { type: "FreeText", data: { content: candidate.name.trim() } },
        });
      }
    }

    return assembliesApi.getAssembly(assemblyId);
  },

  updateAgenda: async (
    assemblyId: string,
    agendaId: string,
    input: UpdateAgendaInput,
    /** Cached detail avoids GET /info + surveys/list after a successful PATCH. */
    cachedDetail?: AssemblyDetail | null,
  ) => {
    const agenda =
      cachedDetail?.agendas.find((item) => item.id === agendaId) ??
      (await fetchSurveys(assemblyId)).map(toAgenda).find((item) => item.id === agendaId);
    if (!agenda) throw new Error("دستوری پیدا نشد");

    await commerceHttp(`${pollsBase()}/${assemblyId}/surveys/${agendaId}/update`, {
      method: "POST",
      body: {
        title: input.title?.trim() ?? agenda.title,
        maxSelection: input.minSelections ?? agenda.minSelections,
      },
    });

    if (cachedDetail) {
      return {
        ...cachedDetail,
        agendas: cachedDetail.agendas.map((item) =>
          item.id === agendaId
            ? {
                ...item,
                title: input.title?.trim() ?? item.title,
                unit: input.unit ?? item.unit,
                minSelections: input.minSelections ?? item.minSelections,
              }
            : item,
        ),
      };
    }

    return assembliesApi.getAssembly(assemblyId);
  },

  removeAgenda: async (assemblyId: string, agendaId: string) => {
    await commerceHttp(`${pollsBase()}/${assemblyId}/surveys/${agendaId}/remove`, { method: "DELETE" });
    return assembliesApi.getAssembly(assemblyId);
  },

  addAgendaCandidate: async (assemblyId: string, { agendaId, candidate }: AddAgendaCandidateInput) => {
    const isMember = Boolean(candidate.memberId && candidate.memberRoleId);
    await commerceHttp(`${pollsBase()}/${assemblyId}/surveys/${agendaId}/items/add`, {
      method: "POST",
      body: isMember
        ? { type: "Member", data: { memberId: candidate.memberId, memberRoleId: candidate.memberRoleId } }
        : { type: "FreeText", data: { content: candidate.name.trim() } },
    });
    return assembliesApi.getAssembly(assemblyId);
  },

  removeAgendaCandidate: async (assemblyId: string, agendaId: string, candidateId: string) => {
    await commerceHttp(`${pollsBase()}/${assemblyId}/surveys/${agendaId}/items/${candidateId}/remove`, {
      method: "DELETE",
    });
    return assembliesApi.getAssembly(assemblyId);
  },
};
