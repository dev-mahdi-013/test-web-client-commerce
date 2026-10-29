import type { ReactNode } from "react";
import { AuthBrandPanel } from "../components/AuthBrandPanel";
import { AuthCard } from "../components/AuthCard";

/** Target of the «تماس با پشتیبانی» link. Replace with the support page or phone (`tel:`). */
const SUPPORT_URL = "";

type DesktopLoginLayoutProps = {
  children: ReactNode;
};

/** Wide screens: the blue brand panel beside the centered form card. */
export function DesktopLoginLayout({ children }: DesktopLoginLayoutProps) {
  return (
    <main className="flex min-h-full relative flex-col items-center bg-background lg:flex-row lg:items-stretch lg:bg-white">
      <AuthBrandPanel />

      <div className="bg-(--background) relative -mt-8 flex w-full flex-1 flex-col items-stretch sm:items-center sm:px-6 lg:mt-0 lg:justify-center lg:px-8">
        <AuthCard>{children}</AuthCard>

        {/* Per the design this line sits on the page background, just below the card, not inside it. */}
        <p className="mt-5 px-4 pb-6 text-center text-note leading-6 text-[#333] sm:pb-0">
          برای ورود به سامانه نیاز به راهنمایی دارید؟{" "}
          <a className="cursor-pointer font-bold text-accent underline-offset-4 hover:underline" href={SUPPORT_URL || "#support"}>
            تماس با پشتیبانی
          </a>
        </p>
      </div>
    </main>
  );
}
