import avatarUrl from "@/assets/images/brand/avatar.svg";
import { cn } from "@/lib/cn";

type BrandAvatarProps = {
  className?: string;
};

export function BrandAvatar({ className }: BrandAvatarProps) {
  return <img alt="" aria-hidden className={cn("size-[76px] shrink-0 select-none", className)} draggable={false} src={avatarUrl} />;
}
