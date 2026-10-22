import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { getErrorMessage } from "@/lib/http";
import { associationKeys, associationsApi } from "../api";

async function invalidateAssociations(queryClient: ReturnType<typeof useQueryClient>, associationId?: string) {
  const invalidations = [queryClient.invalidateQueries({ queryKey: associationKeys.all })];
  if (associationId) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: [...associationKeys.all, "members", associationId] }),
    );
  }
  await Promise.all(invalidations);
}

export function useCreateAssociation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: associationsApi.createAssociation,
    onSuccess: async () => {
      await invalidateAssociations(queryClient);
      toast.success("انجمن افزوده شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error)),
  });
}

export function useUpdateAssociation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      associationId,
      name,
      foundedAt,
    }: {
      associationId: string;
      name: string;
      foundedAt: string;
    }) => associationsApi.updateAssociation(associationId, { name, foundedAt }),
    onSuccess: async (_data, variables) => {
      await invalidateAssociations(queryClient, variables.associationId);
      toast.success("انجمن به‌روز شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error)),
  });
}

export function useChangeAssociationBoss() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      associationId,
      memberId,
      memberRoleId,
    }: {
      associationId: string;
      memberId: string;
      memberRoleId: string;
    }) =>
      associationsApi.changeBoss({ associationId, memberId, memberRoleId }),
    onSuccess: async (_data, variables) => {
      const { associationId } = variables;
      await invalidateAssociations(queryClient, associationId);
      toast.success("رئیس انجمن به‌روزرسانی شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error)),
  });
}

export function useAddAssociationMember(associationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, memberRoleId }: { memberId: string; memberRoleId: string }) =>
      associationsApi.addMember({ associationId, memberId, memberRoleId }),
    onSuccess: async () => {
      await invalidateAssociations(queryClient, associationId);
      toast.success("عضو به انجمن افزوده شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error)),
  });
}
