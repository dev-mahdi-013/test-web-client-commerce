import { CheckIcon } from "@solar-icons/react/linear/check";
import { CloseIcon } from "@solar-icons/react/linear/close";
import type { RefObject } from "react";
import { OpaqueBackdrop } from "./OpaqueBackdrop";
import { cn } from "@/lib/cn";
import { SelectField, type SelectFieldOption } from "./SelectField";

type InlineEditControlProps = {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** Longest text the editor accepts. */
  maxLength?: number;
  className?: string;
  inputClassName?: string;
  editorRef?: RefObject<HTMLDivElement | null>;
  stopPropagation?: boolean;
  handleKeyboard?: boolean;
  mode?: "text" | "number" | "select";
  options?: SelectFieldOption[];
  selectTriggerClassName?: string;
  selectPopoverClassName?: string;
  accessibleName?: string;
};

const actionButtonClassName =
  "inline-flex size-4 min-w-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-white";

export function InlineEditControl({
  isOpen,
  value,
  onChange,
  onConfirm,
  onCancel,
  placeholder,
  autoFocus,
  maxLength,
  className,
  inputClassName,
  editorRef,
  stopPropagation = false,
  handleKeyboard = true,
  mode = "text",
  options = [],
  selectTriggerClassName,
  selectPopoverClassName,
  accessibleName = placeholder ?? "ویرایش",
}: InlineEditControlProps) {
  if (!isOpen) return null;

  const stopEvent = (event: { stopPropagation: () => void }) => {
    if (stopPropagation) event.stopPropagation();
  };

  const control =
    mode === "select" ? (
      <SelectField
        className="h-9 w-0 flex-1 rounded-xl bg-transparent text-sm shadow-none"
        label={accessibleName}
        options={options}
        popoverClassName={selectPopoverClassName}
        triggerClassName={selectTriggerClassName}
        value={value}
        onChange={onChange}
      />
    ) : (
      <input
        autoFocus={autoFocus}
        aria-label={accessibleName}
        className={cn(
          "h-full flex-1 bg-transparent py-0 text-sm leading-9 outline-none",
          mode === "number" && "input-ltr-type",
          inputClassName,
        )}
        inputMode={mode === "number" ? "numeric" : undefined}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onChange(mode === "number" ? event.target.value.replace(/\D/g, "") : event.target.value)
        }
        onPointerDown={stopEvent}
        onKeyDown={(event) => {
          if (!handleKeyboard) return;
          if (event.key === "Enter") {
            event.preventDefault();
            onConfirm();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
      />
    );

  return (
    <>
      <OpaqueBackdrop isOpen />
      <div
        ref={editorRef}
        className={cn("relative z-[var(--z-index-overlay)] flex h-9 items-center gap-1 rounded-xl bg-(--field-muted) ps-3 pe-1", className)}
        onPointerDown={stopEvent}
      >
        {control}
        <button
          type="button"
          aria-label="تأیید ویرایش"
          className={cn(actionButtonClassName, "bg-success")}
          onPointerDown={stopEvent}
          onClick={(event) => {
            stopEvent(event);
            onConfirm();
          }}
        >
          <CheckIcon className="size-2.5" />
        </button>
        <button
          type="button"
          aria-label="لغو ویرایش"
          className={cn(actionButtonClassName, "bg-danger")}
          onPointerDown={stopEvent}
          onClick={(event) => {
            stopEvent(event);
            onCancel();
          }}
        >
          <CloseIcon className="size-2.5" />
        </button>
      </div>
    </>
  );
}
