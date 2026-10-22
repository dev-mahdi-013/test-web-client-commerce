export type Province = {
  id: string;
  name: string;
  city: string;
  aliases: string[];
};

export const provinces: Province[] = [
  { id: "east-azerbaijan", name: "آذربایجان شرقی", city: "تبریز", aliases: ["01", "IR-01"] },
  { id: "west-azerbaijan", name: "آذربایجان غربی", city: "ارومیه", aliases: ["02", "IR-02"] },
  { id: "ardabil", name: "اردبیل", city: "اردبیل", aliases: ["03", "IR-03"] },
  { id: "isfahan", name: "اصفهان", city: "اصفهان", aliases: ["04", "IR-04"] },
  { id: "alborz", name: "البرز", city: "کرج", aliases: ["32", "IR-32"] },
  { id: "ilam", name: "ایلام", city: "ایلام", aliases: ["05", "IR-05"] },
  { id: "bushehr", name: "بوشهر", city: "بوشهر", aliases: ["06", "IR-06", "بندر بوشهر"] },
  { id: "tehran", name: "تهران", city: "تهران", aliases: ["07", "IR-07"] },
  { id: "chaharmahal", name: "چهارمحال و بختیاری", city: "شهرکرد", aliases: ["08", "IR-08", "چهار محال و بختیاری", "شهر کرد"] },
  { id: "south-khorasan", name: "خراسان جنوبی", city: "بیرجند", aliases: ["29", "IR-29"] },
  { id: "razavi-khorasan", name: "خراسان رضوی", city: "مشهد", aliases: ["30", "IR-30"] },
  { id: "north-khorasan", name: "خراسان شمالی", city: "بجنورد", aliases: ["31", "IR-31"] },
  { id: "khuzestan", name: "خوزستان", city: "اهواز", aliases: ["10", "IR-10"] },
  { id: "zanjan", name: "زنجان", city: "زنجان", aliases: ["11", "IR-11"] },
  { id: "semnan", name: "سمنان", city: "سمنان", aliases: ["12", "IR-12"] },
  { id: "sistan", name: "سیستان و بلوچستان", city: "زاهدان", aliases: ["13", "IR-13", "سیستان وبلوچستان"] },
  { id: "fars", name: "فارس", city: "شیراز", aliases: ["14", "IR-14"] },
  { id: "qazvin", name: "قزوین", city: "قزوین", aliases: ["28", "IR-28"] },
  { id: "qom", name: "قم", city: "قم", aliases: ["26", "IR-26"] },
  { id: "kurdistan", name: "کردستان", city: "سنندج", aliases: ["16", "IR-16"] },
  { id: "kerman", name: "کرمان", city: "کرمان", aliases: ["15", "IR-15"] },
  { id: "kermanshah", name: "کرمانشاه", city: "کرمانشاه", aliases: ["17", "IR-17"] },
  { id: "kohgiluyeh", name: "کهگیلویه و بویراحمد", city: "یاسوج", aliases: ["18", "IR-18", "کهگیلویه و بویر احمد"] },
  { id: "golestan", name: "گلستان", city: "گرگان", aliases: ["27", "IR-27"] },
  { id: "gilan", name: "گیلان", city: "رشت", aliases: ["19", "IR-19"] },
  { id: "lorestan", name: "لرستان", city: "خرم‌آباد", aliases: ["20", "IR-20", "خرم آباد"] },
  { id: "mazandaran", name: "مازندران", city: "ساری", aliases: ["21", "IR-21"] },
  { id: "markazi", name: "مرکزی", city: "اراک", aliases: ["22", "IR-22"] },
  { id: "hormozgan", name: "هرمزگان", city: "بندرعباس", aliases: ["23", "IR-23", "بندر عباس"] },
  { id: "hamadan", name: "همدان", city: "همدان", aliases: ["24", "IR-24"] },
  { id: "yazd", name: "یزد", city: "یزد", aliases: ["25", "IR-25"] },
];

export function provinceLabel(province: Province) {
  return `استان ${province.name}`;
}

function normalizePlace(value: string) {
  return value
    .trim()
    .replace(/^استان\s+/u, "")
    .replace(/[\u200c\s]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/آ/g, "ا")
    .toLowerCase();
}

export function findProvince(value: string | number | null | undefined) {
  if (value == null || value === "") return undefined;
  const text = String(value).trim();
  if (!text) return undefined;

  const needles = new Set([normalizePlace(text)]);
  if (/^\d+$/.test(text)) needles.add(text.padStart(2, "0"));

  return provinces.find((province) =>
    [province.id, province.name, province.city, provinceLabel(province), ...province.aliases].some((alias) =>
      needles.has(normalizePlace(alias)),
    ),
  );
}
