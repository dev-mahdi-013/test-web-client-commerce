import coverUrl from "@/assets/images/brand/login-cover-mobile.png";
import logoUrl from "@/assets/images/brand/login-logo.svg";

/**
 * The phone header: the tall blue band with the star artwork on the right, the wordmark on the
 * top-left and the portal name plus version under it. The form sheet overlaps its lower part.
 */
export function MobileAuthHeader() {
  return (
    <section className="relative flex h-[470px] w-full flex-col justify-between overflow-hidden bg-[#0485f7] px-5 pt-5 pb-[225px] text-white">
      <div className="flex flex-col">
          <img
            alt=""
            aria-hidden
            className="pointer-events-none absolute -top-6 -right-[30px] z-0 w-[356px] max-w-none select-none"
            src={coverUrl}
          />

          <img alt="HodHod" className="relative z-10 h-[120px] w-auto self-end select-none" draggable={false} src={logoUrl} />

          {/* Like the Figma frame, the wordmark and the texts under it sit on the left; the star stays right. */}
          <div className="relative z-10 w-full text-left mt-3">
            <p className="text-sm ">در حال ورود به</p>
            <p className="text-sm font-bold ">درگاه اتاق بازرگانی</p>
            <p className="mt-2.5 text-sm text-white/75">هدهد ۱۴۰۵ — نسخه ۲.۱.۴</p>
          </div>
      </div>
    </section>
  );
}
