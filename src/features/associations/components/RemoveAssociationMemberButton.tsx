import { CloseCircleIcon } from "@solar-icons/react/linear/close-circle";
import { Button, useOverlayState } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { getErrorMessage } from "@/lib/http";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { associationKeys, associationsApi } from "../api";

type RemoveAssociationMemberButtonProps = {
  associationId: string;
  memberId: string;
  memberRoleId: string;
  cardNo: string;
};

export function RemoveAssociationMemberButton({
  associationId,
  memberId,
  memberRoleId,
  cardNo,
}: RemoveAssociationMemberButtonProps) {
  const confirm = useOverlayState();
  const queryClient = useQueryClient();
  const removeMember = useMutation({
    mutationFn: () => associationsApi.removeMember({ associationId, memberId, memberRoleId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...associationKeys.all, "members", associationId] });
      toast.success("عضو از انجمن حذف شد");
      confirm.close();
    },
    onError: (error) => toast.danger(getErrorMessage(error)),
  });

  return (
    <>
      <Button
        aria-label={`حذف کارت ${cardNo}`}
        className="h-9 gap-1.5 rounded-full bg-(--card-expiry-alert) ps-1.5 pe-4 text-xs font-bold text-white"
        isDisabled={removeMember.isPending}
        size="sm"
        onPress={confirm.open}
      >
        <CloseCircleIcon className="size-6" />
        <span className="mt-1 font-bold"> حذف کارت</span>
      </Button>

      <ConfirmModal
        confirmLabel="حذف"
        isOpen={confirm.isOpen}
        isPending={removeMember.isPending}
        message="آیا حذف را تأیید می‌کنید؟"
        onConfirm={() => removeMember.mutate()}
        onOpenChange={confirm.setOpen}
      />
    </>
  );
}
