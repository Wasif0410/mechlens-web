import { HONEYPOT_FIELD, waitlistSchema } from "@/lib/waitlist";

/**
 * Waitlist sign-ups.
 *
 * Storage is not connected yet: this endpoint validates each request and accepts it without
 * saving it, and logs that it did (with no personal data) so the gap shows up in the server
 * logs. Before launch, persist the entry where marked below and keep the responses as they are;
 * the form already handles them.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send the form fields as JSON." }, { status: 400 });
  }

  // Filled in only by bots; accept without using it so they get no signal.
  if (typeof body === "object" && body !== null && (body as Record<string, unknown>)[HONEYPOT_FIELD]) {
    return Response.json({ ok: true }, { status: 201 });
  }

  const result = waitlistSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Check the form and try again.";
    return Response.json({ error: message }, { status: 422 });
  }

  // Persist result.data here once storage is connected.
  console.warn(`Waitlist sign-up accepted but not stored (role: ${result.data.role}). Storage is not connected yet.`);

  return Response.json({ ok: true }, { status: 201 });
}
