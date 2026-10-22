import { BellIcon } from "@solar-icons/react/linear/bell";
import { HamburgerMenuIcon } from "@solar-icons/react/linear/hamburger-menu";
import { Button } from "@heroui/react";
import { useLocation, useNavigate } from "react-router";
import { useUiStore } from "@/shared/stores/ui.store";
import { RoleSwitcher } from "./RoleSwitcher";
import { navItems } from "./nav-items";

/** Section landing pages (the sidebar destinations) plus home: going "back" from them is meaningless. */
const sectionRootPaths = new Set<string>(["/", ...navItems.map((item) => item.to)]);

/** Assembly detail pages keep the icon-only circle on phones. */
const compactBackButtonPaths = [
  /^\/association\/assemblies\/[^/]+$/,
  /^\/organizations\/assemblies\/[^/]+$/,
];

function isSectionRootPage(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return sectionRootPaths.has(normalized);
}

function isCompactBackButtonPage(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return compactBackButtonPaths.some((pattern) => pattern.test(normalized));
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Button
      isIconOnly
      aria-label="بازگشت به صفحه قبل"
      className="size-[42px] min-w-[42px] shrink-0 rounded-full bg-(--field-muted) text-foreground shadow-none md:h-[46px] md:w-auto md:min-w-[46px] md:gap-2 md:px-3"
      variant="secondary"
      onPress={onPress}
    >
      <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M15.75 0C16.1642 -5.96046e-08 16.5 0.335786 16.5 0.75C16.5 2.99444 15.548 4.4696 14.3132 5.35865C13.1167 6.22016 11.7034 6.5 10.75 6.5L2.56066 6.5L6.28033 10.2197C6.57322 10.5126 6.57322 10.9874 6.28033 11.2803C5.98744 11.5732 5.51256 11.5732 5.21967 11.2803L0.21967 6.28033C-0.0732233 5.98744 -0.0732233 5.51256 0.21967 5.21967L5.21967 0.219671C5.51256 -0.0732224 5.98744 -0.0732225 6.28033 0.219671C6.57322 0.512564 6.57322 0.987438 6.28033 1.28033L2.56066 5L10.75 5C11.4633 5 12.55 4.77984 13.4368 4.14135C14.2853 3.5304 15 2.50556 15 0.75C15 0.335786 15.3358 5.96047e-08 15.75 0Z" fillRule="evenodd" clipRule="evenodd" fill="black"/>
      </svg>
      <span className="hidden md:inline">بازگشت به صفحه قبل</span>
    </Button>
  );
}

/** Duplicate of the back control that keeps the desktop pill (icon + label) on phones too. */
function DesktopStyleBackButton({ onPress }: { onPress: () => void }) {
  return (
    <Button
      isIconOnly
      aria-label="بازگشت به صفحه قبل"
      className="h-[42px] w-auto min-w-[42px] shrink-0 gap-1.5 rounded-full bg-(--field-muted) px-2.5 text-foreground shadow-none md:h-[46px] md:min-w-[46px] md:gap-2 md:px-3"
      variant="secondary"
      onPress={onPress}
    >
      <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M15.75 0C16.1642 -5.96046e-08 16.5 0.335786 16.5 0.75C16.5 2.99444 15.548 4.4696 14.3132 5.35865C13.1167 6.22016 11.7034 6.5 10.75 6.5L2.56066 6.5L6.28033 10.2197C6.57322 10.5126 6.57322 10.9874 6.28033 11.2803C5.98744 11.5732 5.51256 11.5732 5.21967 11.2803L0.21967 6.28033C-0.0732233 5.98744 -0.0732233 5.51256 0.21967 5.21967L5.21967 0.219671C5.51256 -0.0732224 5.98744 -0.0732225 6.28033 0.219671C6.57322 0.512564 6.57322 0.987438 6.28033 1.28033L2.56066 5L10.75 5C11.4633 5 12.55 4.77984 13.4368 4.14135C14.2853 3.5304 15 2.50556 15 0.75C15 0.335786 15.3358 5.96047e-08 15.75 0Z" fillRule="evenodd" clipRule="evenodd" fill="black"/>
      </svg>
      <span>بازگشت به صفحه قبل</span>
    </Button>
  );
}

export function AppHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const headerActions = useUiStore((state) => state.headerActions);
  const showBackButton = !isSectionRootPage(pathname);
  const BackButtonForPage = isCompactBackButtonPage(pathname) ? BackButton : DesktopStyleBackButton;

  return (
    <div className="sticky top-0 z-20 -mx-6 overflow-anchor-none bg-(--background) lg:-mx-10 2xl:-mx-24">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-6 pt-5 pb-5 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto] lg:gap-4 lg:px-10 lg:pt-10 lg:pb-10 2xl:px-24">
        <Button
          isIconOnly
          aria-label="باز کردن منو"
          className="col-start-1 row-start-1 size-[42px] min-w-[42px] shrink-0 rounded-full bg-(--icon-button) text-black hover:bg-(--icon-button-hover) md:size-10 md:min-w-10 md:bg-transparent md:hover:bg-transparent lg:hidden"
          variant="ghost"
          onPress={() => setMobileNavOpen(true)}
        >
          <HamburgerMenuIcon className="size-5" />
        </Button>

        <div className="col-start-2 row-start-1 md:w-[272px] md:flex-none">
          <RoleSwitcher />
        </div>

        {headerActions && (
          <div className="hidden justify-end lg:col-start-3 lg:row-start-1 lg:flex">
            {headerActions}
          </div>
        )}

        <div
          className="col-start-3 row-start-1 ms-auto flex items-center gap-2 lg:col-start-4 lg:gap-3"
        >
          {showBackButton && (
            <div className="hidden lg:block">
              <BackButtonForPage onPress={() => navigate(-1)} />
            </div>
          )}
          <Button
            isIconOnly
            aria-label="اعلان‌ها"
            className="size-[42px] min-w-[42px] shrink-0 rounded-full bg-(--icon-button) text-black hover:bg-(--icon-button-hover) md:size-10 md:min-w-10 md:bg-transparent md:hover:bg-transparent lg:size-[46px] lg:min-w-[46px] lg:bg-(--icon-button) lg:hover:bg-(--icon-button-hover)"
            variant="ghost"
          >
            <BellIcon className="size-6" strokeWidth={2.5} />
          </Button>
        </div>
      </header>
      <div
        className="flex flex-row-reverse flex-wrap items-center justify-start gap-2 px-6 pb-2 lg:hidden"
      >
        {showBackButton && <BackButtonForPage onPress={() => navigate(-1)} />}
        {headerActions && <div className="flex min-w-0 flex-1 justify-start">{headerActions}</div>}
      </div>
    </div>
  );
}
