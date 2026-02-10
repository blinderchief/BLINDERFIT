import { SignIn } from '@clerk/clerk-react';

const Login = () => {
  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center py-12 px-4">
      <SignIn
        fallbackRedirectUrl="/pulsehub"
        signUpUrl="/register"
        appearance={{
          elements: {
            rootBox: 'mx-auto w-full max-w-md',
            card: 'bg-[#0A0A0A] border border-gray-800 shadow-2xl rounded-lg',
            headerTitle: 'text-white tracking-wider',
            headerSubtitle: 'text-gray-400',
            socialButtonsBlockButton:
              'bg-[#111] border-gray-700 text-white hover:bg-[#1a1a1a] transition-colors',
            socialButtonsBlockButtonText: 'text-gray-300 font-normal',
            dividerLine: 'bg-gray-800',
            dividerText: 'text-gray-500',
            formFieldLabel: 'text-gray-300',
            formFieldInput:
              'bg-[#111] border-gray-700 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30',
            formButtonPrimary:
              'bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-medium tracking-wider',
            footerActionLink: 'text-[#D4AF37] hover:text-[#D4AF37]/80',
            identityPreviewEditButton: 'text-[#D4AF37]',
            formFieldAction: 'text-[#D4AF37]',
            otpCodeFieldInput: 'bg-[#111] border-gray-700 text-white',
          },
        }}
      />
    </div>
  );
};

export default Login;





















