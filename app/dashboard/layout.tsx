import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "HomeTrack consumption dashboard",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <h1 className="text-lg font-semibold text-foreground">HomeTrack</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
