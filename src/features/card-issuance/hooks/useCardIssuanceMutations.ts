import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { getErrorMessage } from "@/lib/http";
import { memberKeys } from "@/features/members/api";
import { cardIssuanceApi, type CardPayload, type CreateMemberPayload } from "../api";

function invalidateMembers(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: memberKeys.all });
}

function cardErrorMessage(error: unknown, isLegal: boolean) {
  const message = getErrorMessage(error);
  if (/national code is not valid/i.test(message)) return "کد ملی معتبر نیست";
  if (isLegal && !/[\u0600-\u06ff]/.test(message)) {
    return "افزودن کارت حقوقی انجام نشد؛ لطفاً اطلاعات کارت و مدیرعامل را بررسی کنید.";
  }
  return message;
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMemberPayload) => cardIssuanceApi.createMember(input),
    onSuccess: () => {
      invalidateMembers(queryClient);
      toast.success("عضو افزوده شد");
    },
    onError: (error, input) => toast.danger(cardErrorMessage(error, input.card.kind === "legal")),
  });
}

export function useAddCard(memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (card: CardPayload) => cardIssuanceApi.addCard(memberId, card),
    onSuccess: () => {
      invalidateMembers(queryClient);
      toast.success("کارت افزوده شد");
    },
    onError: (error, input) => toast.danger(cardErrorMessage(error, input.kind === "legal")),
  });
}

export function useExtendCardExpiry(memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardRoleId, expiresAt }: { cardRoleId: string; expiresAt: string }) =>
      cardIssuanceApi.extendExpiry(memberId, cardRoleId, expiresAt),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: memberKeys.all });
      toast.success("تاریخ انقضا به‌روز شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error)),
  });
}

export function useRemoveCard(memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardRoleId: string) => cardIssuanceApi.removeCard(memberId, cardRoleId),
    onSuccess: () => {
      invalidateMembers(queryClient);
      toast.success("کارت حذف شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error)),
  });
}
