// src/router/ProtectedRoute.tsx

import { useAuthStore } from "@/app/store/auth";
import Link from "next/link";
import React, { ReactNode } from "react";
import { useRouter } from "next/router";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push("/login");
  }

  return children;
}
