import { UserIcon } from "@solar-icons/react/linear/user";
import { ProgressCircle } from "@heroui/react";
import { cn } from "@/lib/cn";
import type { AssemblyVoters } from "../types";

type VotersRingCardProps = {
  voters: AssemblyVoters;
  className?: string;
};

const SIZE = 148;
const CENTER = SIZE / 2;
const STROKE = 6;
const GAP = 5;

const rings = [
  { key: "eligible" as const, radius: 66, color: "var(--chart-mid)", label: "واجدین" },
  { key: "present" as const, radius: 66 - (STROKE + GAP), color: "var(--chart-strong)", label: "حاضرین" },
  { key: "voted" as const, radius: 66 - 2 * (STROKE + GAP), color: "var(--chart-soft)", label: "رأی‌دهندگان" },
];

const stats = [
  { key: "total" as const, label: "کل", color: "var(--chart-track)" },
  { key: "present" as const, label: "حاضرین", color: "var(--chart-strong)" },
  { key: "eligible" as const, label: "واجدین", color: "var(--chart-mid)" },
  { key: "voted" as const, label: "رأی‌دهندگان", color: "var(--chart-soft)" },
];

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-start gap-2">
      <span aria-hidden className="mt-0.5 h-9 w-[3px] shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex flex-col gap-1">
        <span className="text-micro sm:text-xs leading-none text-muted">{label}</span>
        <p className="leading-none text-xs font-bold sm:text-sm">
          <span dir="ltr">{value}</span> <span>نفر</span>
        </p>
      </div>
    </div>
  );
}

function VoterRing({
  value,
  max,
  radius,
  color,
  label,
}: {
  value: number;
  max: number;
  radius: number;
  color: string;
  label: string;
}) {
  const circumference = 2 * Math.PI * radius;

  return (
    <ProgressCircle
      aria-label={label}
      className="absolute inset-0 size-full"
      maxValue={max || 1}
      minValue={0}
      value={value}
    >
      {({ percentage = 0 }) => (
        <ProgressCircle.Track className="!size-full" viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <ProgressCircle.TrackCircle
            className="stroke-(--chart-track)"
            cx={CENTER}
            cy={CENTER}
            r={radius}
            strokeWidth={STROKE}
          />
          <ProgressCircle.FillCircle
            cx={CENTER}
            cy={CENTER}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (percentage / 100) * circumference}
            strokeWidth={STROKE}
            style={{ stroke: color }}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        </ProgressCircle.Track>
      )}
    </ProgressCircle>
  );
}

export function VotersRingCard({ voters, className }: VotersRingCardProps) {
  return (
    <div aria-label="آمار رای‌دهندگان" className={cn("flex items-center justify-start", className)}>
      <div className="flex w-full flex-wrap items-center justify-start gap-4 sm:gap-6">
        <div className="relative order-1 size-[128px] shrink-0 sm:size-[148px]">
          {rings.map(({ key, radius, color, label }) => (
            <VoterRing
              key={key}
              color={color}
              label={label}
              max={voters.total}
              radius={radius}
              value={voters[key]}
            />
          ))}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center">
            <UserIcon aria-hidden className="size-4 text-muted sm:size-5" />
            <p className="text-sm leading-none font-bold tracking-tight sm:text-base" dir="ltr">
              {voters.eligible}
            </p>
            <p className="text-micro leading-none text-muted sm:text-caption">کل واجدین</p>
          </div>
        </div>

        <div className="order-2 grid flex-1 grid-cols-2 gap-x-4 gap-y-5 sm:flex-none sm:gap-x-6 sm:gap-y-6">
          {stats.map(({ key, label, color }) => (
            <Stat key={key} color={color} label={label} value={voters[key]} />
          ))}
        </div>
      </div>
    </div>
  );
}
