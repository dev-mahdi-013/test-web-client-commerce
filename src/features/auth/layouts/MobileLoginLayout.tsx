import type { ReactNode } from "react";
import { MobileAuthCard } from "../components/MobileAuthCard";
import { MobileAuthHeader } from "../components/MobileAuthHeader";

/** Target of the «تماس با پشتیبانی» link. Replace with the support page or phone (`tel:`). */
const SUPPORT_URL = "";

type MobileLoginLayoutProps = {
  children: ReactNode;
};

/** Phones: the blue header with the form sheet pulled up over it. */
export function MobileLoginLayout({ children }: MobileLoginLayoutProps) {
  return (
    <main className="flex min-h-full flex-col bg-white">
      <MobileAuthHeader />

      <div className="-mt-[212px] flex w-full flex-1 flex-col bg-(--background)">
        <MobileAuthCard>{children}</MobileAuthCard>

        <p className="px-4 pt-4 pb-6 text-center text-note leading-6 text-[#333]">
          برای ورود به سامانه نیاز به راهنمایی دارید؟{" "}
          <a className="cursor-pointer font-bold text-accent underline-offset-4 hover:underline" href={SUPPORT_URL || "#support"}>
            تماس با پشتیبانی
          </a>
        </p>
      </div>
    </main>
  );
}
