import { MembershipCard, WithAccentStrip } from "@/shared/components/MembershipCard";
import type { MembershipCardData } from "@/shared/types/membership";
import { DeleteCardButton } from "./DeleteCardButton";
import { ExpiryDatePicker } from "./ExpiryDatePicker";

type IssuanceCardProps = {
  memberId: string;
  card: MembershipCardData;
};

export function IssuanceCard({ memberId, card }: IssuanceCardProps) {
  return (
    <WithAccentStrip>
      <MembershipCard
        card={card}
        footer={
          <>
            <DeleteCardButton cardId={card.id} cardNo={card.cardNo} memberId={memberId} />
            <ExpiryDatePicker card={card} memberId={memberId} />
          </>
        }
      />
    </WithAccentStrip>
  );
}
