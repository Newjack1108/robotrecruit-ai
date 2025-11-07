import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg"
            }
          }}
          fallbackRedirectUrl="/chat"
          signUpUrl="/sign-up"
        />
        <div className="mt-6 text-center text-xs text-gray-500 space-x-2">
          <Link href="/privacy" className="hover:text-gray-700 hover:underline">Privacy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-gray-700 hover:underline">Terms</Link>
          <span>•</span>
          <Link href="/disclaimer" className="hover:text-gray-700 hover:underline">Disclaimer</Link>
          <span>•</span>
          <Link href="/cookies" className="hover:text-gray-700 hover:underline">Cookies</Link>
        </div>
      </div>
    </div>
  );
}
