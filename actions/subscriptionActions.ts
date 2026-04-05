'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { sendWelcomeSubscriberEmail } from '@/lib/newsletter';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletterAction(emailInput: string): Promise<{ ok: boolean; message: string }> {
  const email = emailInput.trim().toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    return {
      ok: false,
      message: 'Adresse email invalide.',
    };
  }

  let subscriber = await prisma.subscriber.findUnique({
    where: { email },
  });

  if (subscriber) {
    subscriber = await prisma.subscriber.update({
      where: { email },
      data: {
        isActive: true,
        unsubscribedAt: null,
      },
    });
  } else {
    subscriber = await prisma.subscriber.create({
      data: {
        email,
      },
    });
  }

  try {
    await sendWelcomeSubscriberEmail(subscriber.email, subscriber.unsubscribeToken);
  } catch (error) {
    console.error('Unable to send welcome newsletter email', error);
  }

  revalidatePath('/');

  return {
    ok: true,
    message: 'Abonnement confirme. Vous recevrez les prochains articles par email.',
  };
}
