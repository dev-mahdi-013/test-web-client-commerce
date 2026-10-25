import { RefreshIcon } from "@solar-icons/react/linear/refresh";
import { FieldError, Input, Spinner, TextField } from "@heroui/react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Captcha } from "../types";

type CaptchaFieldProps = {
  captcha: UseQueryResult<Captcha>;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  isDisabled?: boolean;
};

export function CaptchaField({ captcha, value, onChange, error, isDisabled = false }: CaptchaFieldProps) {
  return (
    <TextField
      aria-label="کد امنیتی"
      isDisabled={isDisabled || !captcha.data || captcha.isFetching}
      isInvalid={!!error}
      name="captcha"
      value={value}
      onChange={onChange}
    >
      <div className="flex h-[61px] items-center gap-4 rounded-xl bg-field px-2 shadow-(--box-shadow)">
        <Input
          autoComplete="off"
          className="input-ltr-type h-[43px] w-[134px] shrink-0 rounded-xl bg-(--field-muted) text-sm shadow-none"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="ورود کپچا"
        />

        <div className="relative h-[43px] w-[123px] shrink-0">
          <div className="flex size-full items-center justify-center overflow-hidden rounded-lg border border-[#d6e0ea] bg-[#f1f5f9]">
            {captcha.isFetching ? (
              <Spinner size="sm" />
            ) : captcha.isError || !captcha.data ? (
              <button
                className="flex size-full cursor-pointer flex-col items-center justify-center gap-0.5 px-2"
                type="button"
                onClick={() => captcha.refetch()}
              >
                <span className="text-center text-caption leading-4 text-danger">خطا در بارگذاری</span>
                <span className="text-micro text-accent">تلاش مجدد</span>
              </button>
            ) : (
              <img alt="کد امنیتی" className="size-full object-cover" src={captcha.data.image} />
            )}
          </div>

          <button
            aria-label="دریافت کد امنیتی جدید"
            className="absolute -start-2 top-1/2 flex size-[15px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-accent text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={captcha.isFetching}
            type="button"
            onClick={() => captcha.refetch()}
          >
            <RefreshIcon className="size-[11px]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <FieldError>{error}</FieldError>
    </TextField>
  );
}
