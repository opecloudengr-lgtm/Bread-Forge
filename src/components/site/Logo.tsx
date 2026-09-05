import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-content";

export function Logo({ size = 40, showName = true, className = "" }: { size?: number; showName?: boolean; className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/brand/accn-logo.png"
        alt={`${siteConfig.shortMinistry} crest`}
        width={316}
        height={420}
        style={{ height: size, width: "auto" }}
        priority
      />
      {showName && (
        <span className="font-display text-xl font-bold tracking-wide text-gold-light">
          {siteConfig.name}
        </span>
      )}
    </Link>
  );
}
