import Link from "next/link";
import { siteConfig } from "@/lib/site-content";
import { Logo } from "@/components/site/Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/20 bg-ink text-parchment/80">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo size={56} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              {siteConfig.mandateVerse}
              <br />
              <span className="text-xs text-parchment/50">{siteConfig.mandateReferences}</span>
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Explore</p>
            <ul className="mt-4 space-y-2 text-sm">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-gold-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Connect</p>
            <p className="mt-4 text-sm">{siteConfig.address}</p>
            <p className="text-sm">{siteConfig.phone}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {siteConfig.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-gold/30 px-3 py-1 hover:border-gold hover:text-gold-light"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-parchment/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.ministry}. All rights reserved.
          </p>
          <Link href="/admin/login" className="hover:text-gold-light">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
