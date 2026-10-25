import { env } from "@/config/env";
import type { Paginated } from "@/shared/types/api";
import type { MembershipCardData } from "@/shared/types/membership";
import { createHttpClient } from "./http";

const messages: Record<string, string> = {
  "authentication error !": "نشست شما منقضی شده است، دوباره وارد شوید",
  "access denied !": "نقش انتخاب‌شده به این بخش دسترسی ندارد",
  "this user already have the role": "این شخص در حال حاضر همین سمت را دارد",
  "this role not allowed to use here": "این سمت در این بخش قابل استفاده نیست",
  "this user not found by this active role": "مأموری با این سمت فعال پیدا نشد",
  "chamber member not found": "عضو اتاق پیدا نشد",
  "poll not found": "مجمع پیدا نشد",
  "draft status not allowed here": "وضعیت پیش‌نویس در این بخش مجاز نیست",
  "name already exists": "این نام قبلاً ثبت شده است",
  "association not found": "انجمن پیدا نشد",
  "the user already a member of this association": "این عضو از قبل در انجمن است",
  "a member can have only one real card": "هر عضو فقط یک کارت حقیقی می‌تواند داشته باشد",
  "the card number already exists": "این شماره کارت قبلاً ثبت شده است",
  "the input card nums already exists": "این شماره کارت قبلاً ثبت شده است",
  "invalid (national code is not valid)": "کد ملی مدیرعامل معتبر نیست",
  "your card expired": "کارت شما منقضی شده است و اجازه دسترسی به رأی‌گیری را ندارید",
  "this poll is not draft to send to review": "فقط مجمع پیش‌نویس قابل ارسال برای بازبینی است",
  "this poll is not in reviewing or waiting to re-draft it": "این مجمع در وضعیت بازبینی یا انتظار نیست",
  "this poll is not in reviewing to approve it": "این مجمع در وضعیت بازبینی نیست",
  "this poll is not in waiting to start it": "این مجمع هنوز در وضعیت انتظار نیست",
  "this poll is not in voting to end it": "این مجمع در حال برگزاری نیست",
  "this poll contains incomplete surveys": "برخی دستورهای مجمع ناقص هستند",
  "cannot process this operation": "این عملیات برای وضعیت فعلی مجاز نیست",
  "member already voted this survey": "شما قبلاً در این دستور رأی داده‌اید",
  "votes count not allowed": "تعداد انتخاب‌ها مجاز نیست",
  "this member is not registered to this poll": "شما در این مجمع ثبت‌نام نشده‌اید و اجازه رأی ندارید",
  // CM surveys/list + vote: page is only available after voting has started.
  "please wait to start voting":
    "برای دسترسی به صفحه رأی‌گیری، مجمع باید شروع شده باشد",
  "you can only make changes to the draft poll": "فقط مجمع پیش‌نویس قابل ویرایش است",
  "this poll is not created by you, and you do not have access to make changes":
    "این مجمع توسط شما ساخته نشده و اجازه تغییر آن را ندارید",
  "this poll is not created by you, and you do not have access to read this surveys":
    "این مجمع توسط شما ساخته نشده و اجازه مشاهده دستورها را ندارید",
  "this poll status is `in vote, ended, etc.`, and you do not have access to make changes":
    "در وضعیت فعلی امکان ویرایش مجمع وجود ندارد",
  "this poll status is in vote, ended, etc., and you do not have access to make changes":
    "در وضعیت فعلی امکان ویرایش مجمع وجود ندارد",
  "association already has active poll": "این انجمن در حال حاضر یک مجمع فعال دارد",
  "association id not allowed here": "شناسه انجمن در این بخش مجاز نیست",
  "poll date must be at least today": "تاریخ مجمع نمی‌تواند قبل از امروز باشد",
  "this user is not member of association": "این شخص عضو انجمن نیست",
  "user is not member of this association": "این شخص عضو انجمن نیست",
  "cannot add member to association until have active poll":
    "تا زمان برگزاری مجمع فعال، افزودن عضو ممکن نیست",
  "cannot remove member from association until have active poll":
    "تا زمان برگزاری مجمع فعال، حذف عضو ممکن نیست",
  "cannot change association boss until have active poll":
    "تا زمان برگزاری مجمع فعال، تغییر رئیس انجمن ممکن نیست",
  "cannot edit association until have active poll":
    "تا زمان برگزاری مجمع فعال، ویرایش انجمن ممکن نیست",
  "votes items not exists": "گزینه‌های انتخاب‌شده معتبر نیستند",
  "survey not found in this poll": "این دستور در مجمع پیدا نشد",
  "member card type not allowed for vote this survey": "نوع کارت شما اجازه رأی در این دستور را ندارد",
  "item not matched with survey order item source": "نوع گزینه با منبع دستور هم‌خوانی ندارد",
  "active poll exist for member joined associations":
    "برای انجمن‌های این عضو مجمع فعالی در جریان است",
};

function translateCommerceMessage(message: string) {
  const key = message.trim().toLowerCase();
  if (messages[key]) return messages[key];
  // Backend wording for update/status restrictions varies slightly by punctuation.
  if (key.includes("poll status") && key.includes("do not have access")) {
    return "در وضعیت فعلی امکان ویرایش مجمع وجود ندارد";
  }
  if (key.includes("wait to start voting") || (key.includes("wait") && key.includes("start voting"))) {
    return "برای دسترسی به صفحه رأی‌گیری، مجمع باید شروع شده باشد";
  }
  if (key.includes("not created by you") && key.includes("read this surveys")) {
    return "این مجمع توسط شما ساخته نشده و اجازه مشاهده دستورها را ندارید";
  }
  if (key.includes("card expired")) {
    return "کارت شما منقضی شده است و اجازه دسترسی به رأی‌گیری را ندارید";
  }
  if (key.includes("not registered to this poll")) {
    return "شما در این مجمع ثبت‌نام نشده‌اید و اجازه رأی ندارید";
  }
  return message;
}

/** Authorization is the session token joined to the role the user is acting as. */
export const commerceHttp = createHttpClient({
  baseUrl: env.commerceApiUrl,
  authorization: (token, activeRoleId) => `${token}.${activeRoleId ?? ""}`,
  unwrapEnvelope: true,
  translateMessage: translateCommerceMessage,
});

type ListEnvelope<T> = {
  data: T[];
  meta?: { total_items: number; total_pages: number; current_page: number; per_page: number };
};

type ListParams = {
  page?: number;
  searchKeyword?: string;
  status?: number;
  associationId?: string;
};

/** Fetches one page of a list endpoint; the page size is fixed by the server. */
export async function commercePage<T, R>(
  path: string,
  { page = 1, searchKeyword, status, associationId }: ListParams,
  map: (item: T) => R,
): Promise<Paginated<R>> {
  const body = await commerceHttp<ListEnvelope<T> | T[]>(path, {
    params: {
      page,
      searchKeyword: searchKeyword?.trim() || undefined,
      status,
      associationId: associationId || undefined,
    },
    envelope: true,
  });

  // Some endpoints (e.g. a search with `searchKeyword`) answer with a bare array instead of
  // `{ success, data, meta }`; accept both shapes.
  const data = Array.isArray(body) ? body : body?.data;
  const meta = Array.isArray(body) ? undefined : body?.meta;
  const items = Array.isArray(data) ? data : [];

  return {
    items: items.map((item) => map(item)),
    page: meta?.current_page ?? page,
    pageSize: meta?.per_page ?? items.length,
    total: meta?.total_items ?? items.length,
    totalPages: Math.max(1, meta?.total_pages ?? 1),
  };
}

/** The service sends dates as epoch milliseconds, with 0 meaning "not set". */
export function fromEpoch(value: number) {
  return value ? new Date(value).toISOString() : null;
}

/** Local calendar day → epoch ms at local midnight, for create/update bodies. */
export function toEpoch(date: Date) {
  return date.getTime();
}

const LEGAL_CARD_TYPE = 2;

export type ApiCardDetails = {
  cardType: number;
  /** Member name on natural cards, company name on legal cards */
  name: string;
  ceoName?: string;
  ceoNationalCode?: string;
  cardNum: string;
  exprDate: number;
};

export function toMembershipCard(id: string, card: ApiCardDetails): MembershipCardData {
  const isLegal = card.cardType === LEGAL_CARD_TYPE;
  return {
    id,
    kind: isLegal ? "legal" : "natural",
    holderName: card.name,
    managerName: isLegal ? (card.ceoName ?? null) : null,
    managerNationalId: isLegal ? (card.ceoNationalCode ?? null) : null,
    cardNo: card.cardNum,
    // `exprDate: 0` means unset — avoid epoch → Jalali 1348/10/11.
    expiresAt: fromEpoch(card.exprDate) ?? "",
    expired: Boolean(card.exprDate) && card.exprDate < Date.now(),
  };
}
