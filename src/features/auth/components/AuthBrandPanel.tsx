import coverUrl from "@/assets/images/brand/login-cover.png";
import logoUrl from "@/assets/images/brand/login-logo.svg";

/**
 * The blue brand area of the login screen: the wave artwork behind the wordmark and the portal name.
 * On phones it is the header the form sheet overlaps; on wide screens it becomes the full-height side panel.
 */
export function AuthBrandPanel() {
  return (
    <section className="flex min-h-[212px] w-full flex-col overflow-hidden rounded-b-[39px] bg-[#0485f7] px-6 pt-8 pb-14 text-white lg:min-h-full lg:w-[47%] lg:max-w-[880px] lg:shrink-0 lg:justify-end lg:overflow-visible lg:rounded-none lg:p-10">
      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-[-10px] -right-[-0px] w-[66%] z-[9999] select-none h-[80%]"
        src={coverUrl}
      />

      <div className="flex flex-col gap-4 lg:w-full lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <img
          alt="HodHod"
          className="h-[86px] w-auto self-start select-none lg:h-[180px]"
          draggable={false}
          src={logoUrl}
        />
        <div className="lg:pb-1">
          <div className="flex w-[252px] flex-wrap">
            <p className="w-full text-[22px] font-normal leading-9 lg:text-[32px] lg:leading-[52px]">
                    در حال ورود به
              </p>
            <p className="w-full text-[22px] font-bold leading-9 lg:text-[32px] lg:leading-[52px]">
                درگاه اتاق بازرگانی
              </p>
          </div>
          <p className="mt-2 text-[15px] text-white/75 lg:mt-5 lg:text-[18px]">هدهد ۱۴۰۵ — نسخه ۲.۱.۴</p>
        </div>
      </div>
    </section>
  );
}
