import type { Metadata } from "next";
import { MotionSection } from "@/components/site/MotionSection";
import { SectionHeading } from "@/components/site/SectionHeading";
import { LinkButton } from "@/components/site/Button";
import { givingInfo, siteConfig } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Partnership & Giving",
  description: "Adullam Kingdom Stewards (AKS) and how to partner with the ministry through giving.",
};

export default function PartnershipPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <MotionSection>
        <SectionHeading
          align="left"
          eyebrow="Partnership & Giving"
          title="Adullam Kingdom Stewards"
          description={`AKS is the partnership arm of ${siteConfig.ministry} — a company of stewards who give proactively toward the mandate and toward benevolence in the community.`}
        />
      </MotionSection>

      <MotionSection delay={0.05} className="mt-8">
        <div className="rounded-2xl border border-gold/30 bg-white p-8 text-center shadow-sm">
          <h3 className="font-display text-xl font-semibold text-ink">Become an Adullam Kingdom Steward</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/70">
            Tell us how you&apos;d like to partner — in giving, service, or prayer — and a member of the
            team will follow up with you.
          </p>
          <div className="mt-5">
            <LinkButton href={siteConfig.partnerFormUrl} external>
              Fill the Partner Form
            </LinkButton>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="mt-8 rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
        <h3 className="font-display text-xl font-semibold text-ink">Project Update: The Bread Forge</h3>
        <p className="mt-3 leading-relaxed text-ink/70">{givingInfo.projectUpdate}</p>
      </MotionSection>

      <MotionSection delay={0.1} className="mt-8 rounded-2xl border border-gold/30 bg-ink p-8 text-parchment shadow-sm">
        <h3 className="font-display text-xl font-semibold text-gold-light">Giving Account Details</h3>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-parchment/60">Bank</dt>
            <dd className="font-semibold">{givingInfo.bankName}</dd>
          </div>
          {givingInfo.accounts.map((account) => (
            <div key={account.currency} className="flex justify-between border-b border-white/10 pb-2">
              <dt className="text-parchment/60">Account ({account.currency})</dt>
              <dd className="font-semibold">{account.number}</dd>
            </div>
          ))}
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-parchment/60">Sort Code</dt>
            <dd className="font-semibold">{givingInfo.sortCode}</dd>
          </div>
          <div className="flex justify-between pb-2">
            <dt className="text-parchment/60">Swift Code</dt>
            <dd className="font-semibold">{givingInfo.swiftCode}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-parchment/60">{givingInfo.givingNote}</p>
        <p className="mt-4 text-xs text-parchment/50">
          Online giving is not yet available in-app — please give directly using the account details
          above.
        </p>
        <p className="mt-4 text-sm italic text-gold-light">{givingInfo.blessing}</p>
      </MotionSection>
    </div>
  );
}
