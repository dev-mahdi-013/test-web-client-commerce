import { Button, Modal, Spinner, Table, toast } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/http";
import { toPersianDigits } from "@/lib/digits";
import { SearchField } from "@/shared/components/SearchField";
import { useSearchPagination } from "@/shared/hooks/useSearchPagination";
import { useDownloadPollSlip, usePollMembers } from "../../hooks/usePollSlip";
import type { PollMember } from "../../types";

type IssueSlipModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  assemblyId: string;
};

const headerClassName = "text-start text-xs font-normal text-muted whitespace-nowrap";
const cellClassName =
  "border-b border-(--panel-cards) bg-(--background) py-3 text-sm font-normal whitespace-nowrap";

type SlipRow = PollMember & { id: string };

function filenameFromContentDisposition(header: string | null, fallbackName: string) {
  if (!header) return `فیش ${fallbackName}`;

  const encodedFilename = /filename\*\s*=\s*(?:[^']*'[^']*')?([^;]+)/i.exec(header)?.[1]
    ?.trim()
    .replace(/^"|"$/g, "");
  if (encodedFilename) {
    try {
      return decodeURIComponent(encodedFilename);
    } catch {
      return encodedFilename;
    }
  }

  const filename = /filename\s*=\s*(?:"([^"]+)"|([^;]+))/i.exec(header);
  return (filename?.[1] ?? filename?.[2]?.trim()) || `فیش ${fallbackName}`;
}

function saveSlip(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.replace(/[\\/:*?"<>|]/g, "-");
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Safari needs the object URL alive until the download has started.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** User search + "دانلود فیش" for the members of an in-person poll. */
export function IssueSlipModal({
  isOpen,
  onOpenChange,
  assemblyId,
}: IssueSlipModalProps) {
  const { query, setQuery, debouncedQuery, searchError } = useSearchPagination();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadPercent, setDownloadPercent] = useState<number | null>(null);
  const members = usePollMembers(assemblyId, debouncedQuery, isOpen);
  const download = useDownloadPollSlip(assemblyId);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = members;
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const rows: SlipRow[] = (members.data?.pages ?? [])
    .flatMap((page) => page.items)
    .map((member) => ({
      ...member,
      id: `${member.memberId}.${member.memberRoleId}`,
    }));

  // Report a failed member list once per failure, with the Persian text the http layer gives.
  useEffect(() => {
    if (members.isError) toast.danger(getErrorMessage(members.error, "دریافت اعضای مجمع انجام نشد"));
  }, [members.isError, members.error]);

  // Load the next page when the sentinel below the last row scrolls into view.
  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { root, rootMargin: "120px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, rows.length]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuery("");
    }
    onOpenChange(open);
  };

  const downloadSlip = (member: SlipRow) => {
    setDownloadingId(member.id);
    setDownloadPercent(null);
    download.mutate(
      {
        memberId: member.memberId,
        memberRoleId: member.memberRoleId,
        onDownloadProgress: ({ loaded, total }) =>
          setDownloadPercent(total ? Math.min(100, Math.round((loaded / total) * 100)) : null),
      },
      {
        onSuccess: ({ blob, contentDisposition }) =>
          saveSlip(blob, filenameFromContentDisposition(contentDisposition, member.name)),
        onError: (downloadError) =>
          toast.danger(getErrorMessage(downloadError, "دریافت فیش انجام نشد")),
        onSettled: () => {
          setDownloadingId(null);
          setDownloadPercent(null);
        },
      },
    );
  };

  const downloadLabel = (rowId: string) => {
    if (downloadingId !== rowId) return "دانلود فیش";
    return downloadPercent === null ? "در حال دریافت" : `${toPersianDigits(downloadPercent)}٪`;
  };

  return (
    <Modal.Backdrop isOpen={isOpen} variant="blur" onOpenChange={handleOpenChange}>
      <Modal.Container placement="center">
        <Modal.Dialog className="w-full max-w-[calc(100vw-2rem)] rounded-[28px] p-6 sm:max-w-[620px]">
          <Modal.CloseTrigger className="start-auto end-5 top-5" />
          <Modal.Header>
            <Modal.Heading className="text-lg font-bold">جستجوی کاربر</Modal.Heading>
          </Modal.Header>

          <Modal.Body className="mt-3 flex flex-col gap-3 py-2">
            <SearchField
              autoFocus
              isMuted
              errorMessage={searchError}
              placeholder="نام و نام خانوادگی"
              value={query}
              onChange={setQuery}
            />

            <div className="flex flex-col rounded-[20px] bg-white">
              <Table className="bg-transparent p-0" variant="secondary">
                <Table.ScrollContainer
                  ref={scrollRef}
                  className="max-h-[420px] min-h-[220px] overflow-auto"
                >
                  <Table.Content aria-label="اعضای مجمع" className="min-w-[520px]">
                    <Table.Header className="sticky top-0 z-10 bg-(--field-muted) rounded-full">
                      <Table.Column isRowHeader className={headerClassName}>
                        نام و نام خانوادگی
                      </Table.Column>
                      <Table.Column className={headerClassName}>شماره موبایل</Table.Column>
                      <Table.Column className={headerClassName}>شماره کارت</Table.Column>
                      <Table.Column className={`${headerClassName} w-28 text-center`}>
                        دانلود
                      </Table.Column>
                    </Table.Header>
                    <Table.Body
                      items={rows}
                      renderEmptyState={() => (
                        <div className="flex h-32 items-center justify-center text-sm text-muted">
                          {members.isPending ? (
                            <Spinner size="sm" />
                          ) : members.isError ? null : (
                            "عضوی پیدا نشد"
                          )}
                        </div>
                      )}
                    >
                      {(row) => (
                        <Table.Row id={row.id}>
                          <Table.Cell className={`${cellClassName} font-bold`}>{row.name}</Table.Cell>
                          <Table.Cell className={cellClassName}>
                            <span dir="ltr">{row.phone ?? "—"}</span>
                          </Table.Cell>
                          <Table.Cell className={cellClassName}>
                            <span dir="ltr">{row.cardNo ?? "—"}</span>
                          </Table.Cell>
                          <Table.Cell className={`${cellClassName} text-center`}>
                            <Button
                              className="h-6 gap-1 rounded-full bg-accent px-2.5 text-xs text-white"
                              isPending={downloadingId === row.id}
                              size="sm"
                              variant="secondary"
                              onPress={() => downloadSlip(row)}
                            >
                              <img alt="" aria-hidden className="size-3 shrink-0" src="/icons/slip-download.svg" />
                              {downloadLabel(row.id)}
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table.Content>
                  {isFetchingNextPage && (
                    <div className="flex h-12 shrink-0 items-center justify-center">
                      <Spinner size="sm" />
                    </div>
                  )}
                  <div ref={sentinelRef} aria-hidden className="h-px shrink-0" />
                </Table.ScrollContainer>
              </Table>
            </div>

          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
