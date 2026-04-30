import { GraduationCap, Play } from 'lucide-react'

interface WelcomeBannerProps {
  userName?: string
}

export function HeroBannerCourses({ userName }: WelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 min-h-[180px] flex flex-col justify-center gap-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0a1a35 100%)',
        }}
      />

      <div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(61,127,255,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div
        className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(61,127,255,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div
        className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase relative z-10"
        style={{
          background: 'rgba(61,127,255,0.15)',
          border: '1px solid rgba(61,127,255,0.3)',
          color: '#6FA3FF',
        }}
      >
        <GraduationCap className="h-3 w-3" />
        <span>Area Exclusiva do Aluno</span>
      </div>

      <h1 className="font-heading font-black text-2xl md:text-3xl text-foreground leading-tight max-w-md relative z-10">
        Bem-vindo{userName ? `, ${userName}` : ''} a sua
        <br />
        escola de concursos!
      </h1>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-lg relative z-10">
        Aqui ficam todos os seus cursos, apostilas, aulas e materiais
        organizados. Estude no seu ritmo e conquiste sua aprovacao.
      </p>

      <button
        type="button"
        className="inline-flex items-center gap-3 self-start cursor-pointer rounded-xl border border-border/50 px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors backdrop-blur-sm max-w-xs relative z-10"
      >
        <span
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #3D7FFF, #5A9FFF)',
            boxShadow: '0 4px 14px rgba(61,127,255,0.4)',
          }}
        >
          <Play className="h-4 w-4 text-white fill-white ml-0.5" />
        </span>

        <span className="flex flex-col gap-0.5 text-left">
          <span className="text-sm font-bold text-foreground">
            Como funciona a Area do Aluno?
          </span>
          <span className="text-xs text-muted-foreground">
            Assista ao video explicativo - 2 min
          </span>
        </span>
      </button>
    </div>
  )
}
