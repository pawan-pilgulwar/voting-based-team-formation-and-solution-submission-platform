export function Footer() {
  return (
    <footer className="w-full border-t bg-background/80 py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto flex flex-col items-center gap-2">
        <span>
          © {new Date().getFullYear()} Student-Led Collaboration Platform. All rights reserved.
        </span>
        <span>
          Connecting students worldwide to solve real-world challenges together.
        </span>
        <div className="flex gap-4 mt-2">
          <a
            href="https://github.com/your-org/student-led-collaboration"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
          <a
            href="/privacy"
            className="hover:underline"
          >
            Privacy Policy
          </a>
          <a
            href="/contact"
            className="hover:underline"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}