import { EyeIcon } from "@solar-icons/react/linear/eye";
import { Button, Spinner, Table } from "@heroui/react";
import { useNavigate } from "react-router";
import { formatJalali } from "@/lib/date";
import { TruncatedText } from "@/shared/components/TruncatedText";
import { ASSEMBLY_CREATED_BY_MAX_CHARS, ASSEMBLY_TITLE_MAX_CHARS } from "../config";
import type { Assembly } from "../types";
import { AssemblyStatsColumnHeader, AssemblyStatsValue } from "./AssemblyStatsValue";
import { AssemblyStatusBadge } from "./AssemblyStatusBadge";

type AssembliesTableProps = {
  assemblies: Assembly[];
  startIndex: number;
  isLoading: boolean;
};

const headerCellClassName = "text-start text-xs font-normal text-muted whitespace-nowrap";
const cellClassName = "text-sm whitespace-nowrap";

export function AssembliesTable({ assemblies, startIndex, isLoading }: AssembliesTableProps) {
  const navigate = useNavigate();
  const rows = assemblies.map((assembly, index) => ({ ...assembly, rowNumber: startIndex + index }));

  return (
    <div className="relative flex w-full max-w-full flex-1 flex-col overflow-hidden rounded-[20px] bg-white">
      <Table className="relative flex w-full flex-1 flex-col overflow-hidden bg-transparent p-0">
        <Table.ScrollContainer className="absolute inset-0 overflow-auto">
          <Table.Content aria-label="لیست مجامع" className="w-[1400px] bg-transparent">
            <Table.Header className="sticky top-0 z-10">
              <Table.Column className={headerCellClassName} isRowHeader>
                عنوان
              </Table.Column>
              <Table.Column className={headerCellClassName}>وضعیت</Table.Column>
              <Table.Column className={headerCellClassName}>تارگت</Table.Column>
              <Table.Column className={headerCellClassName}>توسط</Table.Column>
              <Table.Column className={headerCellClassName}>تاریخ ساخت</Table.Column>
              <Table.Column className={headerCellClassName}>روز رای‌گیری</Table.Column>
              <Table.Column className={headerCellClassName}>زمان شروع</Table.Column>
              <Table.Column className={headerCellClassName}>زمان پایان</Table.Column>
              <Table.Column className={`${headerCellClassName} min-w-[200px] text-center`}>
                <AssemblyStatsColumnHeader className="inline-flex w-full flex-col items-start gap-0.5 pr-[30px] leading-tight" />
              </Table.Column>
              <Table.Column className={`${headerCellClassName} w-24 text-center`}>مشاهده</Table.Column>
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
                  <Table.Cell className={`${cellClassName} py-4`}>
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
                  <Table.Cell className={`${cellClassName} text-center`}>
                    <span className="inline-flex w-full justify-start pr-[30px]">
                      <AssemblyStatsValue assembly={assembly} />
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <Button
                      isIconOnly
                      aria-label={`مشاهده ${assembly.title}`}
                      className="size-8 min-w-8 rounded-full bg-accent text-white"
                      size="sm"
                      onPress={() => navigate(`/assemblies/${assembly.id}`)}
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
