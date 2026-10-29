import type { ReactNode } from "react";
import { BrandAvatar } from "@/shared/components/BrandAvatar";

type AuthCardProps = {
  children: ReactNode;
};

export function AuthCard({ children }: AuthCardProps) {
  return (
    <section className="flex min-h-[486px] w-full max-w-[407px] flex-1 flex-col items-center rounded-t-[39px] bg-(--panel) px-4 pt-14 pb-8 sm:min-h-[587px] sm:flex-none sm:rounded-[39px] sm:px-6 sm:pt-[104px] sm:pb-10">
      <BrandAvatar className="mb-7" />
      <div className="flex w-full max-w-72 flex-1 flex-col">{children}</div>
    </section>
  );
}
