"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    login("worker");
    router.replace("/worker/dashboard");
  }, [login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient">
      <div className="w-10 h-10 rounded-full border-4 border-[#6c5ce7] border-t-transparent animate-spin" />
    </div>
  );
}
