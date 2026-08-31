"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Espelha as regras de registerUserSchema no backend
// (backend/src/domain/use-cases/register-user.ts).
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Use pelo menos 3 caracteres.")
    .max(50, "Use no máximo 50 caracteres.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e underscore."),
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(6, "Use pelo menos 6 caracteres."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAccount } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      await registerAccount(values);
      router.push("/dashboard");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Não foi possível criar sua conta. Tente novamente."
      );
    }
  }

  return (
    <>
      <h1 className="sr-only">Criar conta</h1>
      <Card>
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Comece a avaliar filmes e séries no RatingFlix.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Usuário</Label>
              <Input id="username" {...register("username")} />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar conta"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
