import { Modal, toast } from "@heroui/react";
import {
  AssociationMemberPicker,
  type PickerMember,
} from "@/features/associations/components/AssociationMemberPicker";
import { getErrorMessage } from "@/lib/http";
import { useAddAssociationSecretary } from "../hooks/useAssociationSecretaries";

type AddSecretaryModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const dialogClassName = "w-full max-w-[calc(100vw-2rem)] rounded-[28px] p-6 sm:max-w-[480px]";

/**
 * Docs: `/ap/agents/20/add` takes `memberId` + `memberRoleId` (association member),
 * not free-text name/phone like chamber HR `/pcp/agents`.
 */
export function AddSecretaryModal({ isOpen, onOpenChange }: AddSecretaryModalProps) {
  const addSecretary = useAddAssociationSecretary();

  const handleAdd = (member: PickerMember, onSuccess: () => void) => {
    const [memberId = "", memberRoleId = ""] = member.key.split(".");
    if (!memberId || !memberRoleId) return;

    addSecretary.mutate(
      { memberId, memberRoleId },
      {
        onSuccess: () => {
          toast.success("دبیر با موفقیت اضافه شد");
          onSuccess();
          onOpenChange(false);
        },
        onError: (error) => toast.danger(getErrorMessage(error, "افزودن دبیر انجام نشد")),
      },
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && addSecretary.isPending) return;
    if (!open) addSecretary.reset();
    onOpenChange(open);
  };

  return (
    <Modal.Backdrop
      isDismissable={!addSecretary.isPending}
      isKeyboardDismissDisabled={addSecretary.isPending}
      isOpen={isOpen}
      variant="blur"
      onOpenChange={handleOpenChange}
    >
      <Modal.Container placement="center">
        <Modal.Dialog className={dialogClassName}>
          <Modal.CloseTrigger
            className="start-auto end-5 top-5"
            isDisabled={addSecretary.isPending}
          />
          <Modal.Header>
            <Modal.Heading className="text-lg font-bold">افزودن دبیر</Modal.Heading>
          </Modal.Header>

          <Modal.Body className="mt-2 py-2">
            <AssociationMemberPicker
              key={String(isOpen)}
              isAdding={addSecretary.isPending}
              onAdd={handleAdd}
            />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
