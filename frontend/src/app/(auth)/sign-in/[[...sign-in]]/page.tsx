import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <Link href="/" className="inline-block mb-10">
            <Image
              src="/logo.png"
              alt="CalcnConvert"
              width={140}
              height={45}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-500 text-base">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Clerk Sign In */}
          <SignIn
            forceRedirectUrl="/dashboard"
            signUpUrl="/sign-up"
            appearance={{
              variables: {
                colorPrimary: "#ef4444",
                colorText: "#1f2937",
                colorTextSecondary: "#6b7280",
                colorBackground: "#ffffff",
                colorInputBackground: "#f3f4f6",
                colorInputText: "#1f2937",
                colorDanger: "#ef4444",
                borderRadius: "0.75rem",
              },
              elements: {
                rootBox: {
                  width: "100%",
                },
                card: {
                  boxShadow: "none",
                  backgroundColor: "transparent",
                  padding: "20px 24px",
                  width: "100%",
                  margin: 0,
                },
                header: {
                  display: "none",
                },
                socialButtonsBlockButton: {
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "12px 16px",
                  fontWeight: "600",
                  color: "#ffffff",
                  transition: "all 0.2s ease",
                  width: "100%",
                },
                socialButtonsBlockButtonText: {
                  fontWeight: "600",
                  color: "#ffffff",
                },
                dividerRow: {
                  margin: "16px 0",
                },
                dividerLine: {
                  backgroundColor: "#e5e7eb",
                },
                dividerText: {
                  color: "#9ca3af",
                  fontSize: "13px",
                  backgroundColor: "transparent",
                },
                form: {
                  gap: "0",
                },
                formFieldRow: {
                  marginBottom: "12px",
                },
                formFieldLabel: {
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "4px",
                },
                formFieldLabelRow: {
                  marginBottom: "4px",
                },
                formFieldInput: {
                  backgroundColor: "#f3f4f6",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "10px 14px",
                  fontSize: "14px",
                  color: "#1f2937",
                  transition: "all 0.2s ease",
                },
                formFieldHintText: {
                  color: "#9ca3af",
                  fontSize: "11px",
                  marginTop: "2px",
                },
                formButtonPrimary: {
                  backgroundColor: "#ef4444",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "12px 20px",
                  fontWeight: "600",
                  fontSize: "14px",
                  textTransform: "none",
                  boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.4)",
                  transition: "all 0.2s ease",
                  marginTop: "8px",
                  width: "100%",
                },
                formFieldAction: {
                  color: "#ef4444",
                  fontWeight: "500",
                  fontSize: "12px",
                },
                formFieldErrorText: {
                  color: "#ef4444",
                  fontSize: "12px",
                  marginTop: "4px",
                },
                formFieldSuccessText: {
                  color: "#10b981",
                  fontSize: "12px",
                  marginTop: "4px",
                },
                footerAction: {
                  display: "none",
                },
                footer: {
                  display: "none",
                },
                identityPreview: {
                  backgroundColor: "#f3f4f6",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "10px 14px",
                },
                identityPreviewText: {
                  color: "#1f2937",
                  fontWeight: "500",
                },
                identityPreviewEditButton: {
                  color: "#ef4444",
                  fontWeight: "600",
                },
                formResendCodeLink: {
                  color: "#ef4444",
                  fontWeight: "600",
                },
                otpCodeFieldInput: {
                  backgroundColor: "#f3f4f6",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "18px",
                  padding: "10px",
                },
                alert: {
                  borderRadius: "0.5rem",
                  padding: "10px 14px",
                },
                alertText: {
                  fontSize: "13px",
                },
                internal: {
                  display: "none",
                },
                badge: {
                  display: "none",
                },
                formFieldInputShowPasswordButton: {
                  color: "#6b7280",
                },
              },
            }}
          />

          {/* Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="text-red-500 hover:text-red-600 font-semibold transition-colors"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <Image
          src="/doodle.jpg"
          alt="Illustration"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10">
          <h2 className="text-4xl font-bold text-white mb-3">
            All Your Conversion Tools
          </h2>
          <p className="text-white/95 text-xl">
            Convert files, currencies, units, and more in one place
          </p>
        </div>
      </div>
    </div>
  );
}
