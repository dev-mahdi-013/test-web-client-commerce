import axios, { type Method } from "axios";
import { recordBackendResponse } from "./backend-storage";

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = {
  method?: Method;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Resolve with the whole envelope (e.g. to read `meta`) instead of only its `data` */
  envelope?: boolean;
};

type HttpClientOptions = {
  baseUrl: string;
  authorization: (token: string, activeRoleId: string | null) => string;
  /** The response body is `{ success, message, data }`; resolve with `data` and fail when `success` is false. */
  unwrapEnvelope?: boolean;
  translateMessage?: (message: string) => string;
};

const FALLBACK_MESSAGE = "خطایی در ارتباط با سرور رخ داد";
const NETWORK_ERROR_MESSAGE = "ارتباط با سرور برقرار نشد، اتصال اینترنت را بررسی کنید";
const REQUEST_TIMEOUT_MS = 3_000;

type SessionRejectedHandler = (error: ApiError) => void;
let onSessionRejected: SessionRejectedHandler = () => {};

/** Called when the backend rejects the session (expired token) or the user's permission. */
export function setSessionRejectedHandler(handler: SessionRejectedHandler) {
  onSessionRejected = handler;
}

const SESSION_REJECTED_MESSAGES = ["authentication error", "access denied", "no access"];

function isSessionRejection(status: number, rawMessage: string | null) {
  if (status === 401 || status === 403) return true;
  const raw = rawMessage?.trim().toLowerCase() ?? "";
  return SESSION_REJECTED_MESSAGES.some((text) => raw.includes(text));
}

let getAccessToken: () => string | null = () => null;
let getActiveRoleId: () => string | null = () => null;
export function setAccessTokenGetter(getter: () => string | null) {
  getAccessToken = getter;
}

export function setActiveRoleIdGetter(getter: () => string | null) {
  getActiveRoleId = getter;
}

function readMessage(data: unknown) {
  if (!data || typeof data !== "object") return null;
  if ("message" in data && typeof data.message === "string" && data.message) return data.message;

  for (const value of Object.values(data)) {
    if (Array.isArray(value)) {
      const message = value.find((item): item is string => typeof item === "string" && item.length > 0);
      if (message) return message;
    }
  }

  return null;
}

export function createHttpClient({ baseUrl, authorization, unwrapEnvelope, translateMessage }: HttpClientOptions) {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: REQUEST_TIMEOUT_MS,
    headers: { Accept: "application/json" },
  });

  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = authorization(token, getActiveRoleId());
    return config;
  });

  const toApiError = (status: number, data: unknown) => {
    const message = readMessage(data);
    const error = new ApiError((message && translateMessage?.(message)) || message || FALLBACK_MESSAGE, status, data);
    if (isSessionRejection(status, message)) onSessionRejected(error);
    return error;
  };

  return async function request<T>(
    path: string,
    { method = "GET", body, params, headers, signal, envelope }: RequestOptions = {},
  ) {
    try {
      const { data, status } = await instance.request<unknown>({ url: path, method, data: body, params, headers, signal });
      recordBackendResponse(path, status, data);

      if (unwrapEnvelope && data && typeof data === "object") {
        if ("success" in data && !data.success) throw toApiError(status, data);
        if (!envelope && "data" in data) return data.data as T;
      }
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (axios.isAxiosError(error) && error.response) throw toApiError(error.response.status, error.response.data);
      throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
    }
  };
}

export function getErrorMessage(error: unknown, fallback = "خطایی رخ داد، دوباره تلاش کنید") {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** 403 / backend “access denied” / “no access to this routes” (e.g. association secretary on `/ap/agents`). */
export function isAccessDeniedError(error: unknown) {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 403) return true;
  const message = error.message.toLowerCase();
  return (
    message.includes("access denied") ||
    message.includes("no access") ||
    message.includes("دسترسی ندارد") ||
    message.includes("دسترسی ندارید")
  );
}
