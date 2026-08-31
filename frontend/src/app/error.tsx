"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">Algo deu errado</h1>
      <p className="max-w-md text-muted-foreground">
        Não conseguimos carregar esta página. Tente de novo em alguns instantes.
      </p>
      <Button onClick={reset}>Tentar de novo</Button>
    </main>
  );
}
