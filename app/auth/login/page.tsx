import { LoginForm } from "@/components/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your EZKEY gaming marketplace account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-cyber-dark relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-neon-purple/8 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-20 w-[250px] h-[250px] bg-neon-blue/8 rounded-full blur-[80px]" />

      <div className="w-full max-w-md relative z-10 pt-16">
        <LoginForm />
      </div>
    </div>
  );
}
