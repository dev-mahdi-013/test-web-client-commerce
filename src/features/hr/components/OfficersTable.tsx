import { Spinner, Table } from "@heroui/react";
import { useState } from "react";
import { formatJalali } from "@/lib/date";
import type { Officer, OfficerUnit } from "../types";
import { DismissOfficerButton } from "./DismissOfficerButton";

type OfficersTableProps = {
  unit: OfficerUnit;
  title: string;
  officers: Officer[];
  startIndex: number;
  isLoading: boolean;
};

function formatTenure(officer: Officer) {
  const appointed = formatJalali(officer.appointedAt);
  return officer.dismissedAt ? `${appointed} - ${formatJalali(officer.dismissedAt)}` : appointed;
}

/** Officers table — full columns, scrolls horizontally on narrow viewports. */
export function OfficersTable({ unit, title, officers, startIndex, isLoading }: OfficersTableProps) {
  const rows = officers.map((officer, i) => ({ ...officer, rowNumber: startIndex + i }));
  const [dismissTarget, setDismissTarget] = useState<Officer | null>(null);

  return (
    <div className="relative flex w-full max-w-full flex-1 flex-col overflow-hidden rounded-[20px] bg-white">
      <Table className="relative flex w-full flex-1 flex-col overflow-hidden bg-transparent p-0">
        <Table.ScrollContainer className="absolute inset-0 overflow-auto">
          <Table.Content aria-label={title} className="min-w-[560px] bg-transparent">
            <Table.Header className="sticky top-0 z-10">
              <Table.Column isRowHeader className="text-start text-xs font-normal text-muted whitespace-nowrap">
                نام و نام خانوادگی
              </Table.Column>
              <Table.Column className="text-start text-xs font-normal text-muted whitespace-nowrap">
                شماره تماس
              </Table.Column>
              <Table.Column className="text-start text-xs font-normal text-muted whitespace-nowrap">
                تاریخ نصب و عزل
              </Table.Column>
              <Table.Column className="w-24 text-start text-xs font-normal text-muted whitespace-nowrap">
                اعمال
              </Table.Column>
            </Table.Header>
            <Table.Body
              items={rows}
              renderEmptyState={() => (
                <div className="flex h-40 items-center justify-center text-sm text-muted">
                  {isLoading ? <Spinner size="sm" /> : "مأموری ثبت نشده است"}
                </div>
              )}
            >
              {(officer) => (
                <Table.Row id={officer.id}>
                  <Table.Cell className="py-4 text-sm whitespace-nowrap">
                    {officer.rowNumber}. {officer.fullName}
                  </Table.Cell>
                  <Table.Cell className="text-sm whitespace-nowrap">
                    <span dir="ltr">{officer.phone}</span>
                  </Table.Cell>
                  <Table.Cell className="text-sm whitespace-nowrap">
                    <span dir="ltr">{formatTenure(officer)}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <DismissOfficerButton
                      isOpen={dismissTarget?.id === officer.id}
                      officer={officer}
                      unit={unit}
                      onOpenChange={(open) => setDismissTarget(open ? officer : null)}
                    />
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
