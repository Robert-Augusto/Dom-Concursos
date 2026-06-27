import { CheckSquare } from "lucide-react";

export default function AuthLayout({
    children,
}:{
    children: React.ReactNode
}) {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
          {/* Background decorations */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-20 -right-20 h-72 w-72 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklab, var(--color-primary) 18%, transparent) 0%, transparent 70%)',
              }}
            />
            <div
              className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklab, var(--color-accent) 15%, transparent) 0%, transparent 70%)',
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                background:
                  'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.5) 30px, rgba(255,255,255,0.5) 31px)',
              }}
            />
          </div>
          {/* Shared auth shell */}
          <div className="relative z-10 flex flex-1 flex-col px-7 pt-4">
            {/* Logo */}
            <div className="mb-4 mt-10 flex flex-col items-center">
              <div
                className="mb-2 flex h-13 w-13 items-center justify-center rounded-2xl shadow-lg"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 100%, white 0%), color-mix(in oklab, var(--color-primary) 82%, white 18%))',
                  boxShadow:
                    '0 8px 24px color-mix(in oklab, var(--color-primary) 40%, transparent)',
                }}
              >
                <CheckSquare className="h-8 w-8 text-primary-foreground" />
              </div>
              <p className="font-heading text-2xl font-black tracking-tight text-foreground">DOM</p>
              <p className="mt-0.5 text-xs tracking-widest text-muted-foreground">CONCURSOS</p>
            </div>

            {/* Page-specific content */}
            {children}
            
          </div>
        </div>
      )
}