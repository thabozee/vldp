import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header
        className="w-full py-8 px-6 text-white text-center"
        style={{ backgroundColor: "#E60000" }}
      >
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm opacity-80 mt-1">
          VLAP — Vodacom Lesotho Allocation Portal
        </p>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            1. Data We Collect
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            We collect student names, MSISDN (phone numbers), institution
            affiliation, payment records, and provisioning history to deliver
            data bundle services.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            2. How We Use Your Data
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Your personal data is used solely for the purpose of provisioning
            Vodacom Lesotho data bundles to eligible students. We do not sell
            your data to third parties.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            3. Consent
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Data provisioning requires your explicit consent. You may withdraw
            consent at any time via your student profile. Withdrawal will stop
            future allocations but will not affect previously provisioned data.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            4. Your Rights
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            You have the right to access, correct, or delete your personal data.
            Contact your institution's SPOC or Vodacom Lesotho support to
            exercise these rights.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            5. Contact
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            For privacy concerns, contact Vodacom Lesotho at
            privacy@vodacom.co.ls or visit your nearest Vodacom Lesotho store.
          </p>
        </section>
        <Link
          href="/"
          className="inline-flex text-sm text-zinc-500 hover:underline"
        >
          ← Back to Home
        </Link>
      </main>
    </div>
  );
}
