import { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { AdminSubnav } from "@/components/admin-subnav"

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
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Admin</h1>
          <AdminSubnav />
        </div>
        <Separator />
      </div>
      {children}
    </section>
  )
}

