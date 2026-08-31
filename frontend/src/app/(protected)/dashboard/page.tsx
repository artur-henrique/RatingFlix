"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Olá, {user?.username}</h1>
      <div className="flex items-center gap-3">
        <Button render={<Link href="/feed">Feed</Link>} nativeButton={false} />
        {user && (
          <Button
            variant="outline"
            render={<Link href={`/profiles/${user.username}`}>Meu perfil</Link>}
            nativeButton={false}
          />
        )}
        <Button variant="ghost" onClick={logout}>
          Sair
        </Button>
      </div>
    </main>
  );
}
