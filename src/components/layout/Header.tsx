import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { AuthButton } from "@/components/auth/AuthButton";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold text-sm">
            TF
          </div>
          <span className="hidden text-lg font-bold text-foreground sm:block">
            TrackerFolio
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-3 sm:py-2"
          >
            {t("home")}
          </Link>
          <Link
            href="/portfolio"
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-3 sm:py-2"
          >
            {t("portfolio")}
          </Link>
          <LocaleSwitcher />
          <ThemeToggle />
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
