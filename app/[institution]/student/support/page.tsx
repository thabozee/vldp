"use client";

/**
 * Student Support page — FAQ + contact form
 * Requirements: 8.7
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";

const FAQS = [
  {
    q: "How do data bundles work?",
    a: "Data bundles are allocated to your registered phone number (MSISDN) directly through Vodacom Lesotho. Once provisioned, you'll receive a notification and the data will be available on your SIM.",
  },
  {
    q: "How do I receive a data allocation from my school?",
    a: "Your institution's SPOC uploads a student list and processes a payment. Once the payment is confirmed, your bundle is automatically provisioned to your MSISDN. Make sure you've given consent and opted in to receive allocations.",
  },
  {
    q: "I paid via M-Pesa but didn't receive my data. What should I do?",
    a: "Payments are processed in real time. If you paid but didn't receive data, check your M-Pesa transaction history to confirm the payment was successful. If it was, contact support using the form below and provide your receipt number.",
  },
  {
    q: "Can I buy more data on top of my school allocation?",
    a: "Yes! Head to the 'Buy Data' section in the app to purchase additional bundles independently using M-Pesa.",
  },
];

export default function StudentSupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Support</h1>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FAQS.map((item, i) => (
            <details
              key={i}
              className="group border border-zinc-200 rounded-lg"
            >
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-zinc-800 select-none list-none">
                {item.q}
                <span className="ml-3 text-zinc-400 group-open:rotate-180 transition-transform shrink-0">
                  ▼
                </span>
              </summary>
              <div className="px-4 pb-4 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                {item.a}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>

      {/* Contact form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Support</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex items-center gap-2 text-green-600 text-sm py-4">
              <CheckCircle className="w-5 h-5" />
              Your message was sent! We'll get back to you within 24 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="support-name">Name</Label>
                <Input
                  id="support-name"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="support-email">Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="support-message">Message</Label>
                <textarea
                  id="support-message"
                  required
                  rows={4}
                  placeholder="Describe your issue or question…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none disabled:opacity-60"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !name || !email || !message}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
