import { Modal, toast } from "@heroui/react";
import { useAddAssociationMember } from "../hooks/useAssociationMutations";
import { AssociationMemberPicker, type PickerMember } from "./AssociationMemberPicker";

type AddAssociationMemberModalProps = {
  associationId: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const dialogClassName = "w-full max-w-[calc(100vw-2rem)] rounded-[28px] p-6 sm:max-w-[480px]";

/** Adds one of the chamber's members to the selected association. */
export function AddAssociationMemberModal({
  associationId,
  isOpen,
  onOpenChange,
}: AddAssociationMemberModalProps) {
  const addMember = useAddAssociationMember(associationId ?? "");

  const handleAdd = (member: PickerMember, onSuccess: () => void) => {
    if (!associationId) {
      toast.info("برای افزودن عضو ابتدا یک انجمن را انتخاب کنید");
      return;
    }
    const [memberId = "", memberRoleId = ""] = member.key.split(".");
    if (!memberId || !memberRoleId) return;

    addMember.mutate(
      { memberId, memberRoleId },
      {
        onSuccess: () => {
          onSuccess();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Modal.Backdrop isOpen={isOpen} variant="blur" onOpenChange={onOpenChange}>
      <Modal.Container placement="center">
        <Modal.Dialog className={dialogClassName}>
          <Modal.CloseTrigger className="start-auto end-5 top-5" />
          <Modal.Header>
            <Modal.Heading className="text-xl font-bold text-foreground">افزودن عضو انجمن</Modal.Heading>
          </Modal.Header>

          <Modal.Body className="mt-2 py-2">
            {/* Remounting on open drops the previous search and selection with it. */}
            <AssociationMemberPicker
              key={String(isOpen)}
              isAdding={addMember.isPending}
              onAdd={handleAdd}
            />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
