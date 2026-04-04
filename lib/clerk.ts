export function isClerkConfigured(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!publishableKey || !secretKey) {
    return false;
  }

  if (!publishableKey.startsWith('pk_') || !secretKey.startsWith('sk_')) {
    return false;
  }

  if (publishableKey.includes('replace-me') || secretKey.includes('replace-me')) {
    return false;
  }

  return true;
}