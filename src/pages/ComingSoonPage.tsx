import { useLocation } from "react-router";
import { navItems } from "@/app/layouts/dashboard/nav-items";

export function ComingSoonPage() {
  const { pathname } = useLocation();
  const title = navItems.find((item) => item.to === pathname)?.label;

  return (
    <section className="flex min-h-80 flex-col items-center justify-center gap-2 rounded-[28px] bg-(--panel) p-6 text-center">
      <h1 className="text-lg font-bold">{title}</h1>
      <p className="text-sm text-muted">این بخش به‌زودی اضافه می‌شود</p>
    </section>
  );
}
