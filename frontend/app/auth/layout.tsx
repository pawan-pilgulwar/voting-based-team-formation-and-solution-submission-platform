import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Auth | Student-Led Collaboration Platform",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
