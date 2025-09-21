import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin | Student-Led Collaboration Platform",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="space-y-6">
      {children}
    </section>
  )
}
