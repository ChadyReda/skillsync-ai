import { resend } from "./resend";

import WelcomeEmail from "@/lib/email/templates/welcome-email";

export async function sendWelcomeEmail(email: string) {
  await resend.emails.send({
    from: "SkillSync <onboarding@resend.dev>",

    to: email,

    subject: "Welcome to SkillSync",

    react: WelcomeEmail({
      email,
    }),
  });
}
