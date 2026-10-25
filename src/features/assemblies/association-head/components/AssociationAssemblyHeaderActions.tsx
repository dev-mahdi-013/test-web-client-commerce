import { Button } from "@heroui/react";
import type { AssemblyStatus } from "../../types";

type AssociationAssemblyHeaderActionsProps = {
  status: AssemblyStatus;
  hasAgendas: boolean;
  isPending?: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
};

const buttonClassName =
  "h-9 max-w-full gap-1.5 rounded-full px-2.5 text-caption sm:h-[46px] sm:gap-2 sm:px-4 sm:text-note";

/** Send / cancel review controls for association-head assembly detail. */
export function AssociationAssemblyHeaderActions({
  status,
  hasAgendas,
  isPending,
  onPrimaryAction,
  onSecondaryAction,
}: AssociationAssemblyHeaderActionsProps) {
  const canStartOrSend =
    hasAgendas && (status === "pending" || status === "published");
  const canCancelReview = status === "canceled";
  const canEnd = status === "running";
  const showEndAction = status === "published" || canEnd;

  return (
    <div className="flex max-w-[min(100%,42rem)] flex-wrap items-center justify-end gap-1.5 sm:gap-2">
      <Button
        className={`${buttonClassName} ${
          canStartOrSend
            ? status === "pending"
              ? "bg-foreground text-white"
              : "bg-success text-white transition-opacity hover:opacity-90"
            : "bg-(--field-muted) text-white pointer-events-none"
        } data-[disabled=true]:bg-(--field-muted) data-[disabled=true]:text-white/80`}
        isDisabled={!canStartOrSend || isPending}
        onPress={onPrimaryAction}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM8.69349 13.8458L13.4137 11.059C14.1954 10.5974 14.1954 9.40259 13.4137 8.94103L8.69349 6.15419C7.93371 5.70561 7 6.28947 7 7.21316V12.7868C7 13.7105 7.93371 14.2944 8.69349 13.8458Z" fillRule="evenodd" clipRule="evenodd" fill="#F8F8F8"/>
        </svg>
        <span className="truncate">
          {status === "pending" ? "ارسال برای بازبینی" : "شروع مجمع"}
        </span>
      </Button>
      <Button
        className={`${buttonClassName} ${
          canEnd
            ? "bg-success text-white transition-opacity hover:opacity-90"
            : canCancelReview
              ? "bg-foreground text-white"
            : "bg-(--field-muted) text-white/70 pointer-events-none"
        } data-[disabled=true]:bg-(--field-muted) data-[disabled=true]:text-white/80`}
        isDisabled={(!canCancelReview && !canEnd) || isPending}
        onPress={onSecondaryAction}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM6.07612 6.61732C6 6.80109 6 7.03406 6 7.5V12.5C6 12.9659 6 13.1989 6.07612 13.3827C6.17761 13.6277 6.37229 13.8224 6.61732 13.9239C6.80109 14 7.03406 14 7.5 14C7.96594 14 8.19891 14 8.38268 13.9239C8.62771 13.8224 8.82239 13.6277 8.92388 13.3827C9 13.1989 9 12.9659 9 12.5V7.5C9 7.03406 9 6.80109 8.92388 6.61732C8.82239 6.37229 8.62771 6.17761 8.38268 6.07612C8.19891 6 7.96594 6 7.5 6C7.03406 6 6.80109 6 6.61732 6.07612C6.37229 6.17761 6.17761 6.37229 6.07612 6.61732ZM11.0761 6.61732C11 6.80109 11 7.03406 11 7.5V12.5C11 12.9659 11 13.1989 11.0761 13.3827C11.1776 13.6277 11.3723 13.8224 11.6173 13.9239C11.8011 14 12.0341 14 12.5 14C12.9659 14 13.1989 14 13.3827 13.9239C13.6277 13.8224 13.8224 13.6277 13.9239 13.3827C14 13.1989 14 12.9659 14 12.5V7.5C14 7.03406 14 6.80109 13.9239 6.61732C13.8224 6.37229 13.6277 6.17761 13.3827 6.07612C13.1989 6 12.9659 6 12.5 6C12.0341 6 11.8011 6 11.6173 6.07612C11.3723 6.17761 11.1776 6.37229 11.0761 6.61732Z" fillRule="evenodd" clipRule="evenodd" fill="#F8F8F8"/>
        </svg>
        <span className="truncate">
          {showEndAction ? "پایان مجمع" : "لغو ارسال برای بازبینی"}
        </span>
      </Button>
    </div>
  );
}