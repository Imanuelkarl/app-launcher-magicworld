import nodemailer from "nodemailer";

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] || character,
  );

export async function sendInvitationEmail(
  email: string,
  role: string,
  rawToken: string,
) {
  const clientUrl =
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";
  const inviteUrl = `${clientUrl}/accept-invite?token=${encodeURIComponent(rawToken)}`;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !from
  ) {
    throw new Error("SMTP email settings are not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: "You have been invited to Magic Worlds",
    text: `You have been invited to Magic Worlds as a ${role}. Accept your invitation within 7 days: ${inviteUrl}`,
    html: `<p>You have been invited to Magic Worlds as a <strong>${escapeHtml(role)}</strong>.</p><p><a href="${inviteUrl}">Accept your invitation</a></p><p>This invitation expires in 7 days.</p>`,
  });
}
