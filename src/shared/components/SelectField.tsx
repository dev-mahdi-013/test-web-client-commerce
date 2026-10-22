import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { Dropdown } from "@heroui/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { BlurBackdrop } from "./BlurBackdrop";
import { singleSelectedKeys } from "./tableSelection";

export type SelectFieldOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  /** Accessible name of the control, also used as the menu label. */
  label: string;
  value: string;
  options: SelectFieldOption[];
  onChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  menuClassName?: string;
  showBackdrop?: boolean;
  isDisabled?: boolean;
};

/** A dropdown styled like the muted form fields, for one-of-many values picked inside a form. */
export function SelectField({
  label,
  value,
  options,
  onChange,
  className,
  triggerClassName,
  popoverClassName,
  menuClassName,
  showBackdrop = false,
  isDisabled,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <BlurBackdrop isOpen={showBackdrop && isOpen} />
      <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <Dropdown.Trigger
        aria-label={label}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-xl bg-(--field-muted) px-3 text-sm",
          className,
          triggerClassName,
        )}
        isDisabled={isDisabled}
      >
        <span className="truncate">{selected?.label ?? label}</span>
        <AltArrowDownIcon className="ms-auto size-4 shrink-0 text-muted" />
      </Dropdown.Trigger>
      <Dropdown.Popover
        className={cn("max-h-80 w-(--trigger-width) rounded-[20px] shadow-(--box-shadow)", popoverClassName)}
        offset={8}
        placement="bottom"
      >
        <Dropdown.Menu
          aria-label={label}
          className={cn("gap-1 p-2", menuClassName)}
          disallowEmptySelection
          selectedKeys={singleSelectedKeys(value)}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const [next] = keys === "all" ? [] : [...keys];
            if (typeof next === "string" && next !== value) {
              onChange(next);
              setIsOpen(false);
            }
          }}
        >
          {options.map((option) => (
            <Dropdown.Item
              key={option.value}
              className="items-center gap-2 rounded-xl px-3 py-2.5 text-[13px]"
              id={option.value}
              textValue={option.label}
            >
              {({ isSelected }) => (
                <>
                  <span className="truncate">{option.label}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "ms-auto size-4 shrink-0 rounded-full transition-[border-width] duration-150",
                      isSelected ? "border-[5.5px] border-accent bg-white" : "border-0 bg-(--panel-border)",
                    )}
                  />
                </>
              )}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
      </Dropdown>
    </>
  );
}
