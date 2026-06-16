/**
 * Analytics mock — in-memory event store.
 * No data is sent to any external service.
 * Requirements: 12.9
 */

export interface AnalyticsEvent {
  id: string
  event: string
  properties?: Record<string, unknown>
  timestamp: string
}

const store: AnalyticsEvent[] = []

/** Record any named event with optional properties. */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  store.push({
    id: crypto.randomUUID(),
    event,
    properties,
    timestamp: new Date().toISOString(),
  })
}

/** Convenience wrapper for page view tracking. */
export function trackPageView(path: string): void {
  trackEvent("page_view", { path })
}

/** Convenience wrapper for upload events. */
export function trackUpload(action: "started" | "validated" | "confirmed" | "cancelled", uploadId?: string): void {
  trackEvent(`upload_${action}`, { uploadId })
}

/** Convenience wrapper for payment events. */
export function trackPayment(action: "initiated" | "success" | "failed" | "timeout", paymentId?: string, amount?: number): void {
  trackEvent(`payment_${action}`, { paymentId, amount })
}

/** Convenience wrapper for provisioning events. */
export function trackProvisioning(action: "started" | "complete" | "partial" | "retry", uploadId?: string, counts?: { succeeded: number; failed: number }): void {
  trackEvent(`provisioning_${action}`, { uploadId, ...counts })
}

/** Retrieve all recorded events (for debugging). */
export function getEvents(): AnalyticsEvent[] {
  return [...store]
}
