"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function AuthErrorPage() {
  const { t } = useI18n()
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t("Authentication error")}
          </CardTitle>
          <CardDescription>
            {t("Something went wrong during authentication. Please try again.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/auth/login">{t("Back to sign in")}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
