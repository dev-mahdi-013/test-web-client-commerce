import { DeleteConfirmPopoverButton } from "../../components/DeleteConfirmPopoverButton";
import { useDeleteAssembly } from "../../hooks/useAssemblyMutations";
import type { Assembly } from "../../types";

type DeleteAssemblyButtonProps = {
  assembly: Assembly;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

/** Delete confirm popover anchored under the close icon, same pattern as HR dismiss. */
export function DeleteAssemblyButton({ assembly, isOpen, onOpenChange }: DeleteAssemblyButtonProps) {
  const deleteAssembly = useDeleteAssembly();

  const confirm = (onSuccess: () => void) => {
    deleteAssembly.mutate(assembly.id, {
      onSuccess,
    });
  };

  return (
    <DeleteConfirmPopoverButton
      label={`حذف ${assembly.title}`}
      isOpen={isOpen}
      isPending={deleteAssembly.isPending}
      onOpenChange={onOpenChange}
      onConfirm={confirm}
    />
  );
}
