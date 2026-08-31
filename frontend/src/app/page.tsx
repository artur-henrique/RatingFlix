import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">RatingFlix</h1>
      <p className="max-w-md text-muted-foreground">
        Avalie, descubra e discuta filmes e séries com outros críticos.
      </p>
      <Button>Placeholder — Etapa 1</Button>
    </main>
  );
}
