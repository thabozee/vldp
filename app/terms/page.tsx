import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header
        className="w-full py-8 px-6 text-white text-center"
        style={{ backgroundColor: "#E60000" }}
      >
        <h1 className="text-3xl font-bold">Terms and Conditions</h1>
        <p className="text-sm opacity-80 mt-1">
          VLAP — Vodacom Lesotho Allocation Portal
        </p>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            1. Acceptance of Terms
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            By accessing the VLAP portal you agree to these terms. If you do not
            agree, discontinue use immediately.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            2. Allocation
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Vodacom Lesotho reserves the right to approve or reject data
            provisioning requests. Provisioning is subject to valid payment
            confirmation via M-Pesa and student consent.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            3. Payment Terms
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Payments are processed via M-Pesa. Once a payment is confirmed, it
            is non-refundable unless provisioning fails entirely. Partial
            provisioning failures may be retried at no additional cost.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            4. User Obligations
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Users must provide accurate information. SPOCs are responsible for
            the accuracy of uploaded student lists. Students must provide valid
            Lesotho MSISDNs for provisioning.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            5. Liability Limitation
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Vodacom Lesotho shall not be liable for losses arising from network
            outages, incorrect MSISDNs, or third-party payment processing
            failures.
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
