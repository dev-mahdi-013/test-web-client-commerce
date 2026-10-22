import { EyeIcon } from "@solar-icons/react/linear/eye";
import { Button, Spinner, Table } from "@heroui/react";
import { useNavigate } from "react-router";
import { formatJalali } from "@/lib/date";
import { TruncatedText } from "@/shared/components/TruncatedText";
import { AssemblyStatusBadge } from "../../components/AssemblyStatusBadge";
import { ASSEMBLY_CREATED_BY_MAX_CHARS, ASSEMBLY_TITLE_MAX_CHARS } from "../../config";
import type { Assembly } from "../../types";

type UserAssembliesTableProps = {
  assemblies: Assembly[];
  startIndex: number;
  isLoading: boolean;
};

const headerCellClassName = "text-start text-xs font-normal text-muted whitespace-nowrap";
const cellClassName = "text-sm whitespace-nowrap";

/** Read-only assemblies table — full columns, scrolls horizontally on all breakpoints. */
export function UserAssembliesTable({ assemblies, startIndex, isLoading }: UserAssembliesTableProps) {
  const navigate = useNavigate();
  const rows = assemblies.map((assembly, index) => ({ ...assembly, rowNumber: startIndex + index }));

  return (
    <div className="flex   w-full flex-1 flex-col overflow-hidden rounded-[20px] bg-white">
      <Table className="flex   w-full flex-1 flex-col bg-transparent p-0">
        <Table.ScrollContainer className="  w-full flex-1 overflow-x-auto overflow-y-auto">
          <Table.Content aria-label="لیست مجامع" className="min-w-[1000px] bg-transparent">
            <Table.Header className="sticky top-0 z-10">
              <Table.Column className={headerCellClassName} isRowHeader>
                عنوان
              </Table.Column>
              <Table.Column className={headerCellClassName}>وضعیت</Table.Column>
              <Table.Column className={headerCellClassName}>تارگت</Table.Column>
              <Table.Column className={headerCellClassName}>توسط</Table.Column>
              <Table.Column className={headerCellClassName}>تاریخ ساخت</Table.Column>
              <Table.Column className={headerCellClassName}>روز برگزاری</Table.Column>
              <Table.Column className={headerCellClassName}>زمان شروع</Table.Column>
              <Table.Column className={headerCellClassName}>زمان پایان</Table.Column>
              <Table.Column className={`${headerCellClassName} w-36 text-center`}>ورود به پنل کاربری</Table.Column>
            </Table.Header>
            <Table.Body
              items={rows}
              renderEmptyState={() => (
                <div className="flex h-40 items-center justify-center text-sm text-muted">
                  {isLoading ? <Spinner size="sm" /> : "مجمعی پیدا نشد"}
                </div>
              )}
            >
              {(assembly) => (
                <Table.Row id={assembly.id}>
                  <Table.Cell className={`${cellClassName} py-4 text-start`}>
                    <span className="inline-flex items-center gap-1">
                      <span>{assembly.rowNumber}.</span>
                      <TruncatedText maxChars={ASSEMBLY_TITLE_MAX_CHARS} value={assembly.title} />
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <AssemblyStatusBadge status={assembly.status} />
                  </Table.Cell>
                  <Table.Cell className={cellClassName}>{assembly.association}</Table.Cell>
                  <Table.Cell className={cellClassName}>
                    <TruncatedText maxChars={ASSEMBLY_CREATED_BY_MAX_CHARS} value={assembly.createdBy} />
                  </Table.Cell>
                  <Table.Cell className={cellClassName}>
                    <span dir="ltr">{formatJalali(assembly.createdAt)}</span>
                  </Table.Cell>
                  <Table.Cell className={cellClassName}>
                    <span dir="ltr">{formatJalali(assembly.newsDate)}</span>
                  </Table.Cell>
                  <Table.Cell className={cellClassName}>
                    <span dir="ltr">{assembly.startsAt}</span>
                  </Table.Cell>
                  <Table.Cell className={cellClassName}>
                    <span dir="ltr">{assembly.endsAt}</span>
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <Button
                      isIconOnly
                      aria-label={`ورود به پنل کاربری ${assembly.title}`}
                      className="size-8 min-w-8 rounded-full bg-accent text-white"
                      size="sm"
                      onPress={() => navigate(`/user/assemblies/${assembly.id}`)}
                    >
                      <EyeIcon className="size-4" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}
