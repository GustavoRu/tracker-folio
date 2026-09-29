import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const COINGECKO_URL =
  "https://www.coingecko.com/?utm_source=trackerfolio&utm_medium=referral";

// Required by the CoinGecko Demo plan wherever its crypto prices are shown
export function CoinGeckoAttribution({ className }: { className?: string }) {
  const t = useTranslations("attribution");

  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      {t.rich("cryptoPrices", {
        link: (chunks) => (
          <a
            href={COINGECKO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground/80 underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            {chunks}
          </a>
        ),
      })}
    </p>
  );
}
