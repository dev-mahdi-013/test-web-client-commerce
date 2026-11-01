import type { Key } from "@heroui/react";
import { Autocomplete, ListBox, SearchField, Spinner } from "@heroui/react";
import { useState, type UIEvent } from "react";
import { cn } from "@/lib/cn";
import type { SelectFieldOption } from "./SelectField";

/** Backend search of the options: every keystroke is sent as the list's search keyword. */
export type SearchableSelectSearch = {
  /** Rows the backend returned for the current query. */
  options: SelectFieldOption[];
  /** A new search is in flight, so the rows of the previous query are gone. */
  isSearching?: boolean;
  /** The next page of the same query is in flight. */
  isLoadingMore?: boolean;
  /** The backend reported another page for the current query. */
  hasMore?: boolean;
  errorMessage?: string | null;
  onQueryChange: (query: string) => void;
  /** Asks for the next page; only used together with `hasMore`. */
  onLoadMore?: () => void;
};

type SearchableSelectFieldProps = {
  /** Accessible name of the control, also used as the search label. */
  label: string;
  value: string;
  options: SelectFieldOption[];
  onChange: (value: string) => void;
  /** When set, a query is answered by the backend instead of filtering `options` here. */
  search?: SearchableSelectSearch;
  /** Open the popover and focus the search box as soon as the field mounts. */
  autoOpen?: boolean;
  isDisabled?: boolean;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  placeholder?: string;
};

/** Id of the placeholder row that shows loading / error / empty states inside the list. */
const STATUS_ITEM_ID = "__status__";

/** Distance from the end of the list, in pixels, that starts loading the next page. */
const LOAD_MORE_THRESHOLD = 48;

/** Id of the disabled row that shows the next page is being fetched. */
const LOAD_MORE_ITEM_ID = "__more__";

/** Persian text is typed with both Arabic and Persian letters, and with or without ZWNJ. */
function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, "");
}

/** One-of-many field that searches its options, for lists too long to scan by eye. */
export function SearchableSelectField({
  label,
  value,
  options,
  onChange,
  search,
  autoOpen = false,
  isDisabled = false,
  className,
  triggerClassName,
  popoverClassName,
  placeholder,
}: SearchableSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value);
  const trimmedQuery = query.trim();
  // Without a backend search the loaded options are filtered here; with one, its rows are the answer.
  const visibleOptions = !trimmedQuery
    ? options
    : search
      ? search.options
      : options.filter((option) => normalize(option.label).includes(normalize(trimmedQuery)));

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setQuery("");
      search?.onQueryChange("");
    }
  };

  const handleChange = (keys: Key | Key[] | null) => {
    const key = Array.isArray(keys) ? keys[0] : keys;
    if (typeof key !== "string" || key === STATUS_ITEM_ID || key === LOAD_MORE_ITEM_ID) return;
    onChange(key);
    handleOpenChange(false);
  };

  /**
   * Scrolls the next page in only when the backend has one; a list filtered here has no pages,
   * so the local mode never calls `onLoadMore`.
   */
  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!search?.hasMore || search.isLoadingMore || search.isSearching) return;
    const list = event.currentTarget;
    if (list.scrollHeight - list.scrollTop - list.clientHeight > LOAD_MORE_THRESHOLD) return;
    search.onLoadMore?.();
  };

  const statusContent = search?.errorMessage ? (
    <p className="py-2 text-center text-xs text-danger">{search.errorMessage}</p>
  ) : search?.isSearching ? (
    <Spinner size="sm" />
  ) : (
    <p className="py-2 text-center text-xs text-muted">نتیجه‌ای پیدا نشد</p>
  );

  return (
    <Autocomplete
      className={cn("w-0 flex-1", className)}
      isDisabled={isDisabled}
      isOpen={isOpen}
      placeholder={placeholder ?? label}
      selectionMode="single"
      value={value || null}
      variant="secondary"
      onChange={handleChange}
      onOpenChange={handleOpenChange}
    >
      <Autocomplete.Trigger
        className={cn(
          "flex h-9 w-full min-w-0 cursor-pointer items-center gap-1 bg-transparent text-sm shadow-none",
          triggerClassName,
        )}
      >
        <span className={cn("truncate", !selected && "text-muted")}>
          {selected?.label ?? placeholder ?? label}
        </span>
        <Autocomplete.Indicator className="ms-auto size-4 shrink-0 text-muted" />
      </Autocomplete.Trigger>
      <Autocomplete.Popover
        className={cn(
          "z-[var(--z-index-overlay)] w-[280px] max-w-[calc(100vw-2rem)] rounded-xl bg-white p-2 shadow-(--box-shadow)",
          popoverClassName,
        )}
      >
        {/* The search is done here or by the backend, so the local collection filter must not hide anything. */}
        <Autocomplete.Filter filter={() => true}>
          <SearchField
            aria-label={`جستجوی ${label}`}
            autoFocus
            className="mb-2"
            value={query}
            variant="secondary"
            onChange={(next) => {
              setQuery(next);
              search?.onQueryChange(next);
            }}
          >
            <SearchField.Group
              className="h-9 gap-0 rounded-xl border border-(--panel-border) bg-white px-0"
              dir="ltr"
            >
              <SearchField.SearchIcon className="!ms-1 size-4 shrink-0 text-muted" />
              <SearchField.Input
                className="!px-0 min-w-0 flex-1 bg-transparent text-start text-sm shadow-none"
                dir="rtl"
                placeholder="جستجو"
              />
              <SearchField.ClearButton className="!me-0 size-4 cursor-pointer" />
            </SearchField.Group>
          </SearchField>

          <ListBox
            aria-label={label}
            className="max-h-56 overflow-y-auto"
            onScroll={handleListScroll}
          >
            {visibleOptions.length === 0 ? (
              <ListBox.Item
                key={STATUS_ITEM_ID}
                id={STATUS_ITEM_ID}
                className="cursor-default justify-center opacity-100"
                isDisabled
                textValue="وضعیت"
              >
                {statusContent}
              </ListBox.Item>
            ) : (
              visibleOptions.map((option) => (
                <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
                  <span className="truncate">{option.label}</span>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))
            )}
            {search?.isLoadingMore ? (
              <ListBox.Item
                key={LOAD_MORE_ITEM_ID}
                id={LOAD_MORE_ITEM_ID}
                className="cursor-default justify-center opacity-100"
                isDisabled
                textValue="بارگذاری صفحه‌ی بعد"
              >
                <Spinner size="sm" />
              </ListBox.Item>
            ) : null}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
