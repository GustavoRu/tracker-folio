import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { AuthButton } from "@/components/auth/AuthButton";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold text-sm">
            TF
          </div>
          <span className="text-lg font-bold text-foreground">
            TrackerFolio
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("home")}
          </Link>
          <Link
            href="/portfolio"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
