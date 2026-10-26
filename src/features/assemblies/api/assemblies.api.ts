import { jalaliToDate } from "@/lib/date";
import { commerceHttp, commercePage, toEpoch } from "@/lib/commerce-http";
import { currentCommerceScope, type CommerceScope } from "@/lib/commerce-scope";
import { ApiError } from "@/lib/http";
import type { Paginated } from "@/shared/types/api";
import type {
  Assembly,
  AssemblyDetail,
  AssemblyStatus,
  CreateAgendaInput,
  CreateAssemblyInput,
  AddAgendaCandidateInput,
  ListAssembliesParams,
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
        eligibilityScope: toEligibilityCode(input.unit ?? agenda.unit),
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
