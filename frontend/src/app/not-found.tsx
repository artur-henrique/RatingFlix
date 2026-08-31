import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">Página não encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        O que você procurava não existe, ou pode ter sido removido.
      </p>
      <Button render={<Link href="/">Voltar para o início</Link>} nativeButton={false} />
    </main>
  );
}
