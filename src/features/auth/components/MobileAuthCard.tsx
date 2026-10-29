import type { ReactNode } from "react";
import { BrandAvatar } from "@/shared/components/BrandAvatar";

type MobileAuthCardProps = {
  children: ReactNode;
};

/**
 * The phone form sheet: an inset panel (87% wide, 507px tall like the Figma frame) with large
 * rounded top corners and a hairline top border. It is frosted so the blue header stays faintly
 * visible behind its upper part, and it overlaps the header by 212px.
 */
export function MobileAuthCard({ children }: MobileAuthCardProps) {
  return (
    <section className="mx-auto flex h-[507px] w-[350px] flex-col items-center rounded-t-[39px] border-t border-(--panel-border) bg-(--panel)/80 px-6 pt-9 pb-8 backdrop-blur-[20px]">
      {/* The phone design uses a slightly smaller avatar than the desktop card. */}
      <div className="mb-[40px] [&_img]:size-[70px] mt-4">
        <BrandAvatar />
      </div>
      <div className="flex w-full flex-1 flex-col">{children}</div>
    </section>
  );
}
