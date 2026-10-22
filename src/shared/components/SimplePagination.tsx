import { ArrowLeftIcon } from "@solar-icons/react/linear/arrow-left";
import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { Pagination } from "@heroui/react";

type SimplePaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDisabled?: boolean;
};

export function SimplePagination({ page, totalPages, onPageChange, isDisabled }: SimplePaginationProps) {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <Pagination className="w-full flex-row flex-nowrap items-center justify-between gap-3" size="sm">
      <Pagination.Summary className="text-xs text-muted">
        صفحه {page} از {totalPages}
      </Pagination.Summary>
      <Pagination.Content className="gap-3">
        <Pagination.Item>
          <Pagination.Next
            className="gap-1 text-sm font-bold text-foreground"
            isDisabled={isDisabled || isLast}
            onPress={() => onPageChange(page + 1)}
          >
            <ArrowRightIcon className="size-4" />
            بعدی
          </Pagination.Next>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Previous
            className="gap-1 text-sm font-bold text-foreground"
            isDisabled={isDisabled || isFirst}
            onPress={() => onPageChange(page - 1)}
          >
            قبلی
            <ArrowLeftIcon className="size-4" />
          </Pagination.Previous>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
