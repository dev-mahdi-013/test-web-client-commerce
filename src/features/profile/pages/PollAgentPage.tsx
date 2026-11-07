/** Poll agents (مامور اخذ رای) have no web workspace; the commerce changelog sends them to the app. */
export function PollAgentPage() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-[28px] bg-(--panel) p-8 text-center">
      <p className="max-w-md text-sm leading-6 text-muted">
        برای استفاده از این بخش از اپلیکیشن HodHod Commerce Assistant استفاده کنید.
      </p>
    </div>
  );
}
