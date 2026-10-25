import { PenIcon } from "@solar-icons/react/linear/pen";
import { Button } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { InlineEditControl } from "@/shared/components/InlineEditControl";
import { cn } from "@/lib/cn";
import type { SelectFieldOption } from "@/shared/components/SelectField";
import { AssemblyDetailField } from "../../components/AssemblyDetailField";

type Editor =
  | { type: "text" }
  | { type: "number" }
  | { type: "select"; options: SelectFieldOption[] };

type AgendaInlineEditFieldProps = {
  label: string;
  value: string;
  accessibleName: string;
  isEditable: boolean;
  isEditDisabled?: boolean;
  valueMinWidth: 118 | 207;
  editor: Editor;
  className?: string;
  onSave: (value: string) => boolean;
};

export function AgendaInlineEditField({
  label,
  value,
  accessibleName,
  isEditable,
  isEditDisabled = false,
  valueMinWidth,
  editor,
  className,
  onSave,
}: AgendaInlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const editorRef = useRef<HTMLDivElement>(null);

  // Keep the closed (and draft) label in sync after mutation cache updates (e.g. واحدها).
  useEffect(() => {
    if (!isEditing) setDraft(value);
  }, [value, isEditing]);

  const startEditing = () => {
    setDraft(value);
    setIsEditing(true);
  };

  const save = () => {
    if (onSave(draft)) setIsEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
  };
  const valueMinWidthClassName =
    valueMinWidth === 118
      ? "min-w-[118px]"
      : "max-w-[120px] min-w-0 sm:max-w-none sm:min-w-[207px]";

  useEffect(() => {
    if (!isEditing || editor.type === "select") return;

    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !editorRef.current?.contains(event.target)) {
        setIsEditing(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointerDown, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointerDown, true);
  }, [editor.type, isEditing]);

  return (
    <>
      <AssemblyDetailField
        className={cn(className, isEditing && "!mr-0")}
        label={label}
        value={
          isEditing ? (
            <InlineEditControl
              accessibleName={accessibleName}
              autoFocus={editor.type !== "select"}
              className={editor.type === "number" ? "w-[250px] max-w-full " : "w-full"}
              editorRef={editorRef}
              inputClassName="min-w-0 sm:max-lg:overflow-hidden sm:max-lg:text-ellipsis sm:max-lg:whitespace-nowrap"
              isOpen
              mode={editor.type}
              options={editor.type === "select" ? editor.options : undefined}
              selectTriggerClassName={
                editor.type === "select" && accessibleName === "واحدها" ? "max-sm:!pr-0" : undefined
              }
              selectPopoverClassName={editor.type === "select" ? "max-sm:!w-[200px]" : undefined}
              value={draft}
              onCancel={cancel}
              onChange={setDraft}
              onConfirm={save}
            />
          ) : (
            <span
              className={
                isEditable
                  ? `inline-flex min-h-[23px] items-center justify-between gap-2 rounded-[11.5px] bg-(--field-muted) px-2 py-0.5 leading-snug ${valueMinWidthClassName}`
                  : valueMinWidth === 207
                    ? "max-w-[120px] break-words sm:max-w-none"
                    : undefined
              }
            >
              <span className="min-w-0 break-words whitespace-normal">{value}</span>
              {isEditable && (
                <Button
                  isIconOnly
                  aria-label={`ویرایش ${accessibleName}`}
                  className="size-4 min-w-4 shrink-0 rounded-full bg-accent text-white"
                  isDisabled={isEditDisabled}
                  size="sm"
                  onPress={startEditing}
                >
                  <PenIcon className="size-2.5" />
                </Button>
              )}
            </span>
          )
        }
      />
    </>
  );
}
