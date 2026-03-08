"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const next = locale === "es" ? "en" : "es";
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2 text-xs font-medium text-foreground transition-colors hover:bg-card-hover sm:h-9 sm:gap-1.5 sm:px-3 sm:text-sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-1.503.204A6.5 6.5 0 117.95 3.83L6.927 5.62A1.453 1.453 0 008.2 7.565h.261c.631 0 1.144.573 1.144 1.28v.14c0 .708-.513 1.28-1.144 1.28h-.261a1.453 1.453 0 00-1.453 1.453v.036c0 .803.651 1.453 1.453 1.453h.261c.631 0 1.144.573 1.144 1.28v1.36a6.47 6.47 0 002.835-.184l-.027-.075a1.453 1.453 0 01.19-1.362l.075-.108a1.453 1.453 0 011.196-.634h.261c.284 0 .514-.256.514-.573v-.14c0-.316-.23-.573-.514-.573h-.261a1.453 1.453 0 01-1.453-1.453v-.036c0-.803.651-1.453 1.453-1.453h.261c.632 0 1.144-.573 1.144-1.28v-.14z"
          clipRule="evenodd"
        />
      </svg>
      {locale === "es" ? "EN" : "ES"}
    </button>
  );
}
