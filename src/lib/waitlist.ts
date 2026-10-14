import * as z from "zod/mini";

export const waitlistRoles = [
  { value: "technician", label: "Technician or apprentice" },
  { value: "shop", label: "Shop or dealership" },
  { value: "school", label: "Technician school" },
  { value: "other", label: "Something else" },
] as const;

export type WaitlistRole = (typeof waitlistRoles)[number]["value"];

const roleValues = waitlistRoles.map((role) => role.value) as [WaitlistRole, ...WaitlistRole[]];

export function isWaitlistRole(value: unknown): value is WaitlistRole {
  return typeof value === "string" && (roleValues as readonly string[]).includes(value);
}

/** Props for a link that opens the waitlist with a role already chosen. */
export function preselectRole(role: WaitlistRole) {
  return { "data-waitlist-role": role } as const;
}

/**
 * A field people never see. Bots that fill in every input fill this one too, and the endpoint
 * quietly accepts those requests without using them.
 */
export const HONEYPOT_FIELD = "company_website";

export const waitlistSchema = z.object({
  email: z.email({ error: "Enter an email address like name@shop.com." }).check(z.maxLength(254)),
  role: z.enum(roleValues, { error: "Choose the option that describes you." }),
});
