import { Spinner, Table } from "@heroui/react";
import { useState } from "react";
import { formatJalali } from "@/lib/date";
import type { AssociationSecretary } from "../types";
import { DeleteSecretaryButton } from "./DeleteSecretaryButton";

type SecretariesTableProps = {
  title: string;
  secretaries: AssociationSecretary[];
  startIndex: number;
  isLoading: boolean;
  onDelete: (secretary: AssociationSecretary) => void;
};

function formatTenure(secretary: AssociationSecretary) {
  const appointed = formatJalali(secretary.appointedAt);
  return secretary.dismissedAt ? `${appointed} - ${formatJalali(secretary.dismissedAt)}` : appointed;
}

/** Same table chrome as `OfficersTable`; wired to association secretary rows. */
export function SecretariesTable({
  title,
  secretaries,
  startIndex,
  isLoading,
  onDelete,
}: SecretariesTableProps) {
  const rows = secretaries.map((secretary, i) => ({ ...secretary, rowNumber: startIndex + i }));
  const [deleteTarget, setDeleteTarget] = useState<AssociationSecretary | null>(null);

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
                  {isLoading ? <Spinner size="sm" /> : "دبیری ثبت نشده است"}
                </div>
              )}
            >
              {(secretary) => (
                <Table.Row id={secretary.id}>
                  <Table.Cell className="py-4 text-sm whitespace-nowrap">
                    {secretary.rowNumber}. {secretary.fullName}
                  </Table.Cell>
                  <Table.Cell className="text-sm whitespace-nowrap">
                    <span dir="ltr">{secretary.phone}</span>
                  </Table.Cell>
                  <Table.Cell className="text-sm whitespace-nowrap">
                    <span dir="ltr">{formatTenure(secretary)}</span>
                  </Table.Cell>
                  <Table.Cell>
                    {secretary.dismissedAt ? (
                      <span className="text-sm text-muted">—</span>
                    ) : (
                      <DeleteSecretaryButton
                        isOpen={deleteTarget?.id === secretary.id}
                        secretary={secretary}
                        onDelete={onDelete}
                        onOpenChange={(open) => setDeleteTarget(open ? secretary : null)}
                      />
                    )}
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
