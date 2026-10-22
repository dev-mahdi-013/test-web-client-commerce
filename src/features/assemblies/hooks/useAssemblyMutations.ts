import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { getErrorMessage } from "@/lib/http";
import { assembliesApi, assemblyKeys } from "../api";
import type {
  Assembly,
  AssemblyDetail,
  AssemblyStatus,
  AssemblyUnit,
  AddAgendaCandidateInput,
  CreateAgendaInput,
  CreateAssemblyInput,
  UpdateAgendaInput,
} from "../types";

function isAssemblyDetailKey(queryKey: readonly unknown[]) {
  return queryKey[0] === "assemblies" && queryKey[2] === "detail";
}

/** Mark list queries stale/refetch; leave a just-written detail cache alone. */
function invalidateAssemblyLists(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: assemblyKeys.all,
    predicate: (query) => !isAssemblyDetailKey(query.queryKey),
  });
}

function writeAssemblyDetail(
  queryClient: QueryClient,
  assemblyId: string,
  detail: AssemblyDetail | null | undefined,
) {
  if (detail) queryClient.setQueryData(assemblyKeys.detail(assemblyId), detail);
  invalidateAssemblyLists(queryClient);
}

/** Patch list-shaped update fields onto the cached detail without refetching surveys. */
function patchAssemblyDetail(queryClient: QueryClient, assemblyId: string, patch: Assembly) {
  queryClient.setQueryData(assemblyKeys.detail(assemblyId), (previous: AssemblyDetail | undefined) => {
    if (!previous) return previous;
    return {
      ...previous,
      ...patch,
      agendas: previous.agendas,
      voterStats: previous.voterStats,
    };
  });
  invalidateAssemblyLists(queryClient);
}

function invalidateAssemblies(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: assemblyKeys.all });
}

export function useCreateAssembly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAssemblyInput) => assembliesApi.createAssembly(input),
    onSuccess: () => {
      invalidateAssemblies(queryClient);
      toast.success("مجمع افزوده شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error)),
  });
}

export function useDeleteAssembly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assemblyId: string) => assembliesApi.deleteAssembly(assemblyId),
    onSuccess: () => {
      invalidateAssemblies(queryClient);
      toast.success("مجمع حذف شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error)),
  });
}

export function useUpdateAssemblyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assemblyId, status }: { assemblyId: string; status: AssemblyStatus }) =>
      assembliesApi.updateAssemblyStatus(assemblyId, status),
    onSuccess: (detail, variables) => {
      writeAssemblyDetail(queryClient, variables.assemblyId, detail);
    },
    onError: (error) => toast.danger(getErrorMessage(error)),
  });
}

export function useUpdateAssemblyTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assemblyId, title }: { assemblyId: string; title: string }) =>
      assembliesApi.updateAssemblyTitle(assemblyId, title),
    onSuccess: (assembly, variables) => {
      if (assembly) patchAssemblyDetail(queryClient, variables.assemblyId, assembly);
      else invalidateAssemblies(queryClient);
    },
    onError: (error) => toast.danger(getErrorMessage(error, "به‌روزرسانی عنوان انجام نشد")),
  });
}

export function useUpdateAssemblyNewsDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assemblyId, votingDay }: { assemblyId: string; votingDay: string }) =>
      assembliesApi.updateAssemblyNewsDate(assemblyId, votingDay),
    onSuccess: (assembly, variables) => {
      if (assembly) patchAssemblyDetail(queryClient, variables.assemblyId, assembly);
      else invalidateAssemblies(queryClient);
    },
    onError: (error) => toast.danger(getErrorMessage(error, "به‌روزرسانی روز رأی‌گیری انجام نشد")),
  });
}

export function useUpdateAssemblyUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assemblyId, unit }: { assemblyId: string; unit: AssemblyUnit }) =>
      assembliesApi.updateAssemblyUnit(assemblyId, unit),
    onSuccess: (assembly, variables) => {
      if (assembly) patchAssemblyDetail(queryClient, variables.assemblyId, assembly);
      else invalidateAssemblies(queryClient);
      toast.success("واجدین مجمع به‌روزرسانی شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error, "به‌روزرسانی واجدین انجام نشد")),
  });
}

export function useAddAgenda(assemblyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAgendaInput) => assembliesApi.addAgenda(assemblyId, input),
    onSuccess: (detail) => {
      writeAssemblyDetail(queryClient, assemblyId, detail);
      toast.success("دستور افزوده شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error, "افزودن دستور انجام نشد")),
  });
}

export function useUpdateAgenda(assemblyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agendaId, input }: { agendaId: string; input: UpdateAgendaInput }) => {
      const cached = queryClient.getQueryData<AssemblyDetail>(assemblyKeys.detail(assemblyId));
      return assembliesApi.updateAgenda(assemblyId, agendaId, input, cached);
    },
    onSuccess: (detail) => {
      writeAssemblyDetail(queryClient, assemblyId, detail);
      toast.success("دستور به‌روزرسانی شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error, "ویرایش دستور انجام نشد")),
  });
}

export function useAddAgendaCandidate(assemblyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddAgendaCandidateInput) => assembliesApi.addAgendaCandidate(assemblyId, input),
    onSuccess: (detail) => {
      writeAssemblyDetail(queryClient, assemblyId, detail);
      toast.success("کاندیدا اضافه شد");
    },
    onError: () => toast.danger("افزودن کاندیدا انجام نشد"),
  });
}

export function useRemoveAgenda(assemblyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agendaId: string) => assembliesApi.removeAgenda(assemblyId, agendaId),
    onSuccess: (detail) => {
      writeAssemblyDetail(queryClient, assemblyId, detail);
      toast.success("دستور حذف شد");
    },
  });
}

export function useRemoveAgendaCandidate(assemblyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agendaId, candidateId }: { agendaId: string; candidateId: string }) =>
      assembliesApi.removeAgendaCandidate(assemblyId, agendaId, candidateId),
    onSuccess: (detail) => {
      writeAssemblyDetail(queryClient, assemblyId, detail);
    },
  });
}
