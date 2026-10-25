import { EyeIcon } from "@solar-icons/react/linear/eye";
import { Button, Spinner, Table } from "@heroui/react";
import { cn } from "@/lib/cn";
import { selectableRowClassName, singleSelectionProps } from "@/shared/components/tableSelection";
import type { ChamberMember } from "../types";

type MembersListProps = {
  members: ChamberMember[];
  selectedId: string | null;
  startIndex: number;
  isLoading: boolean;
  onSelect: (id: string) => void;
  showAssociationCount?: boolean;
  /** Fill the parent's height and scroll rows (and columns) inside it, keeping the header sticky. */
  fillHeight?: boolean;
};

export function MembersTable({
  members,
  selectedId,
  startIndex,
  isLoading,
  onSelect,
  showAssociationCount = true,
  fillHeight = false,
}: MembersListProps) {
  const rows = members.map((member, index) => ({ ...member, rowNumber: startIndex + index }));

  return (
    <Table
      className={cn(
        "flex min-w-0 flex-col bg-transparent p-0",
        fillHeight && "relative min-h-0 flex-1 overflow-hidden",
      )}
    >
      <Table.ScrollContainer
        className={cn("w-full min-w-0 overflow-auto", fillHeight && "absolute inset-0 w-auto")}
      >
        <Table.Content
          aria-label="لیست اعضا"
          className={showAssociationCount ? "min-w-[720px]" : "min-w-[560px]"}
          {...singleSelectionProps(selectedId, onSelect)}
        >
          <Table.Header className="sticky top-0 z-10">
            <Table.Column isRowHeader className="text-start text-xs font-normal text-muted">
              نام و نام خانوادگی
            </Table.Column>
            <Table.Column className="text-start text-xs font-normal text-muted">شماره تماس</Table.Column>
            <Table.Column className="text-start text-xs font-normal text-muted">
              {showAssociationCount ? "تعداد کارت" : "تعداد کارت ها"}
            </Table.Column>
            {showAssociationCount && (
              <Table.Column className="text-start text-xs font-normal text-muted">تعداد انجمن‌ها</Table.Column>
            )}
            <Table.Column className="w-32 text-center text-xs font-normal text-muted whitespace-nowrap">
              {showAssociationCount ? "مشاهده کارت" : "مشاهده کارت ها"}
            </Table.Column>
          </Table.Header>
          <Table.Body
            items={rows}
            renderEmptyState={() => (
              <div className="flex h-40 items-center justify-center text-sm text-muted">
                {isLoading ? <Spinner size="sm" /> : "عضوی پیدا نشد"}
              </div>
            )}
          >
            {(member) => (
              <Table.Row id={member.id} className={selectableRowClassName}>
                <Table.Cell className="py-4 text-sm whitespace-nowrap">
                  {member.rowNumber}. {member.fullName}
                </Table.Cell>
                <Table.Cell className="text-sm">
                  <span dir="ltr">{member.phone}</span>
                </Table.Cell>
                <Table.Cell className="text-sm">{member.cards.length}</Table.Cell>
                {showAssociationCount && <Table.Cell className="text-sm">{member.associationCount}</Table.Cell>}
                <Table.Cell
                  className="text-center"
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <Button
                    isIconOnly
                    aria-label={`مشاهده کارت ${member.fullName}`}
                    className="size-8 min-w-8 rounded-full bg-accent text-white"
                    size="sm"
                    onPress={() => onSelect(member.id)}
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
  );
}
