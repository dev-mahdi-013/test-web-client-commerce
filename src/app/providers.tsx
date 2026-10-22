import { I18nProvider, Toast } from "@heroui/react";
import { SolarProvider } from "@solar-icons/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { queryClient } from "./query-client";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SolarProvider color="currentColor" strokeWidth={1.5}>
        <I18nProvider locale="fa-IR">
          {children}
          <Toast.Provider placement="top" />
        </I18nProvider>
      </SolarProvider>
      {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-left" />}
    </QueryClientProvider>
  );
}
