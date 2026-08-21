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
import { Mail } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function SignUpSuccessPage() {
  const { t } = useI18n()
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t("Check your email")}
          </CardTitle>
          <CardDescription>
            {t("We sent you a confirmation link. Please check your email to verify your account.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">{t("Back to sign in")}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
