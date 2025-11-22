"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WorkspaceMainPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/workspace/news");
  }, [router]);

  return null;
}
