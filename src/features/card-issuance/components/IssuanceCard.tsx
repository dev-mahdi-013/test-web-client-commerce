import { MembershipCard } from "@/shared/components/MembershipCard";
import type { MembershipCardData } from "@/shared/types/membership";
import { AddCommerceCardButton } from "./AddCommerceCardButton";
import { DeleteCardButton } from "./DeleteCardButton";
import { DeleteCommerceCardButton } from "./DeleteCommerceCardButton";
import { ExpiryDatePicker } from "./ExpiryDatePicker";

type IssuanceCardProps = {
  memberId: string;
  card: MembershipCardData;
  onCardRemoved?: (cardId: string) => void;
};

export function IssuanceCard({ memberId, card, onCardRemoved }: IssuanceCardProps) {
  return (
    <MembershipCard
      stacked
      card={card}
      commerceFooter={
        <>
          <DeleteCommerceCardButton cardId={card.id} cardNo={card.cardNo} memberId={memberId} />
          <ExpiryDatePicker card={card} memberId={memberId} target="commerce" />
        </>
      }
      footer={
        <>
          <DeleteCardButton cardId={card.id} cardNo={card.cardNo} memberId={memberId} onRemoved={onCardRemoved} />
          <ExpiryDatePicker card={card} memberId={memberId} />
        </>
      }
      missingCommerceFooter={<AddCommerceCardButton cardId={card.id} memberId={memberId} />}
    />
  );
}
