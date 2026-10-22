import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import { Button } from "@heroui/react";
import { useState, type ReactNode } from "react";
import { SearchField } from "./SearchField";
import { SectionHeading } from "./SectionHeading";

type ListSectionHeaderProps = {
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  searchError?: string | null;
  action?: ReactNode;
  /** Puts the action past the search field instead of before it. */
  actionAtEnd?: boolean;
};

export function ListSectionHeader({
  title,
  query,
  onQueryChange,
  searchError,
  action,
  actionAtEnd = false,
}: ListSectionHeaderProps) {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const showCompactSearch = isSearchOpen || query !== "";

  return (
    <header className="mb-3 px-1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-h-10 items-center">
          <SectionHeading>{title}</SectionHeading>
        </div>
        <div className="flex items-center gap-2">
          {!actionAtEnd && action}
          <SearchField
            className="hidden w-[310px] shrink-0 lg:block"
            errorMessage={searchError}
            value={query}
            onChange={onQueryChange}
          />
          <Button
            isIconOnly
            aria-expanded={showCompactSearch}
            aria-label="جست و جو"
            className="size-9 min-w-9 self-center rounded-full bg-white lg:hidden"
            variant="ghost"
            onPress={() => setSearchOpen((open) => !open)}
          >
            <MagnifierIcon className="size-4" />
          </Button>
          {actionAtEnd && action}
        </div>
      </div>
      {showCompactSearch && (
        <SearchField
          autoFocus={isSearchOpen}
          className="animate-fade-in mt-3 lg:hidden"
          errorMessage={searchError}
          value={query}
          onChange={onQueryChange}
        />
      )}
    </header>
  );
}
