import { FilterIcon } from "@solar-icons/react/linear/filter";
import { Dropdown } from "@heroui/react";
import { cn } from "@/lib/cn";
import { singleSelectedKeys } from "@/shared/components/tableSelection";

export type FilterOption = {
  value: string;
  label: string;
};

type AssemblyFilterChipProps = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

export function AssemblyFilterChip({ label, value, options, onChange }: AssemblyFilterChipProps) {
  const selected = options.find((option) => option.value === value);
  const isFiltered = selected != null && selected.value !== "all";

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={label}
        className={cn(
          "flex size-9 min-w-9 items-center justify-center rounded-full border border-(--panel-border) bg-white text-note text-muted transition-colors hover:bg-white/70 lg:h-9 lg:w-auto lg:min-w-0 lg:justify-start lg:gap-2 lg:px-4",
          isFiltered && "border-accent/40 font-bold text-accent",
        )}
      >
        <FilterIcon className="size-4 shrink-0" />
        <span className="hidden whitespace-nowrap lg:inline">
          {selected ? selected.label : label}
        </span>
      </Dropdown.Trigger>
      <Dropdown.Popover className="max-h-80 min-w-48 rounded-[20px] shadow-(--box-shadow)" offset={8} placement="bottom start">
        <Dropdown.Menu
          aria-label={label}
          className="gap-1 overflow-y-auto p-2"
          disallowEmptySelection
          selectedKeys={singleSelectedKeys(value)}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const [next] = keys === "all" ? [] : [...keys];
            if (typeof next === "string" && next !== value) onChange(next);
          }}
        >
          {options.map((option) => (
            <Dropdown.Item
              key={option.value}
              className="items-center gap-2 rounded-xl px-3 py-2.5 text-note"
              id={option.value}
              textValue={option.label}
            >
              {({ isSelected }) => (
                <>
                  <span className="whitespace-nowrap">{option.label}</span>
                  <span
                    aria-hidden
                    className={
                      isSelected
                        ? "ms-auto size-4 shrink-0 rounded-full border-[5.5px] border-accent bg-white transition-[border-width] duration-150"
                        : "ms-auto size-4 shrink-0 rounded-full border-0 border-accent bg-(--panel-border) transition-[border-width] duration-150"
                    }
                  />
                </>
              )}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
