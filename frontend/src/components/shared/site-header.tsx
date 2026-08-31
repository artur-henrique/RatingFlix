"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, status, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 p-4">
        <Link href="/" className="text-lg font-semibold">
          RatingFlix
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/search">Buscar</Link>}
            nativeButton={false}
          />
          {status === "authenticated" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/feed">Feed</Link>}
                nativeButton={false}
              />
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/profiles/${user?.username}`}>Perfil</Link>}
                nativeButton={false}
              />
              <Button variant="outline" size="sm" onClick={logout}>
                Sair
              </Button>
            </>
          )}
          {status === "unauthenticated" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/login">Entrar</Link>}
                nativeButton={false}
              />
              <Button size="sm" render={<Link href="/register">Criar conta</Link>} nativeButton={false} />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
