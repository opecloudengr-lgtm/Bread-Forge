import type { Metadata } from "next";
import { MotionSection } from "@/components/site/MotionSection";
import { SectionHeading } from "@/components/site/SectionHeading";
import { givingInfo, siteConfig } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Partnership & Giving",
  description: "Adullam Kingdom Stewards (AKS) and how to partner with the ministry through giving.",
};

export default function PartnershipPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <SectionHeading
        align="left"
        eyebrow="Partnership & Giving"
        title="Adullam Kingdom Stewards"
        description={`AKS is the partnership arm of ${siteConfig.ministry} — a company of stewards who give proactively toward the mandate and toward benevolence in the community.`}
      />

      <MotionSection className="mt-12 rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
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
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-parchment/60">Account Name</dt>
            <dd className="font-semibold">{givingInfo.accountName}</dd>
          </div>
          <div className="flex justify-between pb-2">
            <dt className="text-parchment/60">Account Number</dt>
            <dd className="font-semibold">{givingInfo.accountNumber}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-parchment/50">
          Online giving is not yet available in-app — please give directly using the account details
          above. Thank you for sowing into the Kingdom.
        </p>
      </MotionSection>
    </div>
  );
}
