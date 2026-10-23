import { AddIcon } from "@solar-icons/react/linear/add";
import { Button, Input, TextField } from "@heroui/react";
import { useState } from "react";
import { AgendaMemberSearchField, type AgendaMemberCandidate } from "./AgendaMemberSearchField";
import type { AgendaCandidateInput } from "../types";

type AgendaCandidateAddFieldProps = {
  associationId?: string | null;
  isMember: boolean;
  existingNames: string[];
  existingIds: string[];
  existingMemberIds: string[];
  isPending?: boolean;
  onAdd: (candidate: AgendaCandidateInput, onSuccess: () => void) => void;
};

/** Plus + candidate-name field used as the first row in agenda candidate tables. */
export function AgendaCandidateAddField({
  associationId,
  isMember,
  existingNames,
  existingIds,
  existingMemberIds,
  isPending,
  onAdd,
}: AgendaCandidateAddFieldProps) {
  const [candidateName, setCandidateName] = useState("");
  const trimmedName = candidateName.trim();
  const isDuplicate = existingNames.some((name) => name === trimmedName);

  const submit = () => {
    if (!trimmedName || isDuplicate || isPending) return;
    onAdd({ name: trimmedName }, () => setCandidateName(""));
  };

  const addMember = (member: AgendaMemberCandidate, onSuccess: () => void) => {
    onAdd(
      {
        name: member.name,
        cardNo: member.cardNo,
        memberId: member.memberId,
        memberRoleId: member.memberRoleId,
      },
      onSuccess,
    );
  };

  if (isMember) {
    return (
      <div className="px-4 py-3">
        <AgendaMemberSearchField
          associationId={associationId}
          existingIds={existingIds}
          existingMemberIds={existingMemberIds}
          isPending={isPending}
          onAdd={addMember}
        />
      </div>
    );
  }

  return (
    <form
      className="flex items-center gap-6 px-4 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Button
        isIconOnly
        aria-label="افزودن کاندیدا"
        className="size-[23px] min-w-[23px] rounded-full bg-accent p-0 text-white"
        isDisabled={!trimmedName || isDuplicate || isPending}
        isPending={isPending}
        type="button"
        onPress={submit}
      >
        <AddIcon className="size-3.5" />
      </Button>
      <TextField
        aria-label="نام کاندیدا"
        className="flex-1"
        isDisabled={isPending}
        value={candidateName}
        onChange={setCandidateName}
      >
        <Input
          className="h-[23px] rounded-full bg-(--field-muted) text-sm shadow-none"
          placeholder="نام کاندیدا"
        />
      </TextField>
    </form>
  );
}
