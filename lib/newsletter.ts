import { AUTHOR_NAME } from '@/lib/site';
import { prisma } from '@/lib/prisma';

interface PublishedPostForEmail {
  title: string;
  description: string;
  slug: string;
}

function resolveAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

function canSendNewsletterEmails(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL);
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL;

  if (!apiKey || !from) {
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${details}`);
  }
}

export async function sendWelcomeSubscriberEmail(email: string, unsubscribeToken: string): Promise<void> {
  if (!canSendNewsletterEmails()) {
    return;
  }

  const appUrl = resolveAppUrl();
  const unsubscribeUrl = `${appUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">Bienvenue sur ${AUTHOR_NAME}</h2>
      <p>Merci pour votre abonnement. Vous recevrez les derniers articles directement par email.</p>
      <p>Vous pouvez vous desinscrire a tout moment en cliquant ici:</p>
      <p><a href="${unsubscribeUrl}">Se desinscrire</a></p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Bienvenue sur ${AUTHOR_NAME}`,
    html,
  });
}

export async function notifySubscribersOfNewPost(post: PublishedPostForEmail): Promise<void> {
  if (!canSendNewsletterEmails()) {
    return;
  }

  const subscribers = await prisma.subscriber.findMany({
    where: { isActive: true },
    select: {
      email: true,
      unsubscribeToken: true,
    },
  });

  if (subscribers.length === 0) {
    return;
  }

  const appUrl = resolveAppUrl();
  const articleUrl = `${appUrl}/blog/${post.slug}`;

  await Promise.allSettled(
    subscribers.map((subscriber) => {
      const unsubscribeUrl = `${appUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`;

      return sendEmail({
        to: subscriber.email,
        subject: `Nouvel article: ${post.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
            <h2 style="margin-bottom: 10px;">Nouvel article publie</h2>
            <h3 style="margin: 0 0 10px 0;">${post.title}</h3>
            <p>${post.description}</p>
            <p><a href="${articleUrl}">Lire l'article</a></p>
            <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280;">
              Si vous ne souhaitez plus recevoir ces emails, <a href="${unsubscribeUrl}">desabonnez-vous ici</a>.
            </p>
          </div>
        `,
      });
    }),
  );
}
