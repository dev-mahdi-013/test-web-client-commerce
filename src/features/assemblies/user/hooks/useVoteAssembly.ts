import { toast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/http";
import { assemblyKeys } from "../../api";
import { userAssembliesApi } from "../api/user.api";

export function useVoteAssembly(pollId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surveyId, voteOptions }: { surveyId: string; voteOptions: string[] }) =>
      userAssembliesApi.vote(pollId, surveyId, voteOptions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assemblyKeys.detail(pollId) });
      toast.success("رأی شما ثبت شد");
    },
    onError: (error) => toast.danger(getErrorMessage(error, "ثبت رأی انجام نشد")),
  });
}
