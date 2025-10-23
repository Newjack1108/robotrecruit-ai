import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg"
            }
          }}
          fallbackRedirectUrl="/chat"
          signInUrl="/sign-in"
        />
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
          <p className="text-xs">
            <Link href="/disclaimer" className="text-gray-500 hover:text-gray-700 hover:underline">Disclaimer</Link>
            {' • '}
            <Link href="/cookies" className="text-gray-500 hover:text-gray-700 hover:underline">Cookie Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
