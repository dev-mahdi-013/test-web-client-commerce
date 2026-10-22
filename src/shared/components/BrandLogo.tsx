import logoUrl from "@/assets/images/brand/logo.svg";
import { cn } from "@/lib/cn";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  return <img alt="HodHod" className={cn("shrink-0 select-none", className)} draggable={false} src={logoUrl} />;
}
