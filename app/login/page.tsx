"use client";

import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { loginSchema, type LoginFormValues } from "../../schemas/loginSchema";

export default function LoginPage() {
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setServerError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Username atau password salah");
      } else if (result?.ok) {
        window.location.href = "/home";
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-lg dark:bg-gray-900/80">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="w-20 h-20 mx-auto bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-200">
            POS Dashboard
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
            Masuk ke akun Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {serverError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Username
              </Label>
              <Input
                id="username"
                {...form.register("username")}
                type="text"
                placeholder="Masukkan username"
                className="h-12 text-lg border-2 focus:border-blue-500 focus-visible:ring-blue-500"
                disabled={isPending}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </Label>
              <Input
                id="password"
                {...form.register("password")}
                type="password"
                placeholder="Masukkan password"
                className="h-12 text-lg border-2 focus:border-blue-500 focus-visible:ring-blue-500"
                disabled={isPending}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl disabled:opacity-50"
              disabled={isPending || form.formState.isSubmitting}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-4 border-t">
            © 2024 POS Dashboard. All rights reserved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
