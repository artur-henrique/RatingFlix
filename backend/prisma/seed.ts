import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Nomes e regras espelham BADGE_RULES em
// src/domain/use-cases/recalculate-user-gamification.ts — o recálculo de
// gamificação só consegue atribuir um badge que já exista aqui como registro.
// iconUrl é um placeholder: nada no frontend usa esse campo ainda (só o nome
// aparece no perfil), então qualquer URL válida serve até termos assets reais.
const BADGES = [
  { name: "Rookie", description: "Publicou sua primeira crítica." },
  { name: "Prestige", description: "Já soma 3 críticas no RatingFlix." },
  { name: "Forrest", description: "5 críticas publicadas — está pegando ritmo." },
  { name: "Matrix", description: "8 críticas e reputação em alta." },
  { name: "Morpheus", description: "12 críticas, incluindo atividade recente." },
  { name: "Neo", description: "20 críticas e pelo menos 10 votos recebidos." },
  { name: "Gladiator", description: "30 críticas e reputação consolidada." },
  { name: "Terminator", description: "45 críticas — presença constante." },
  { name: "Rocky", description: "60 críticas e a comunidade reconhece." },
  { name: "Godfather", description: "80 críticas — referência entre os críticos." },
  { name: "Vader", description: "100 críticas e 200+ votos recebidos." },
  { name: "Spielberg", description: "150 críticas — o auge da reputação no RatingFlix." },
] as const;

const PLACEHOLDER_ICON_URL = "https://placehold.co/64x64?text=%F0%9F%8F%85";

async function main() {
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: { description: badge.description },
      create: {
        name: badge.name,
        description: badge.description,
        iconUrl: PLACEHOLDER_ICON_URL,
      },
    });
  }

  console.log(`Seed concluído: ${BADGES.length} badges.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
