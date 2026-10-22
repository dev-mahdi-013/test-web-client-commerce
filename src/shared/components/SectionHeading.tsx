type SectionHeadingProps = {
  children: string;
  className?: string;
};

export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <h2 className={`flex items-center gap-2 text-[15px] font-normal ${className ?? ""}`}>
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-(--heading-bullet)" />
      {children}
    </h2>
  );
}
