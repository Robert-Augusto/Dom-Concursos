'use client'

import { Download, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

type CourseItem = {
  emoji: string
  title: string
}

const modules: CourseItem[] = [
  {
    emoji: '⚖️',
    title: 'Direito Constitucional - Fundamentos',
  },
  {
    emoji: '📖',
    title: 'Portugues para Concursos - Do Zero',
  },
  {
    emoji: '🧩',
    title: 'Raciocinio Logico - Iniciante',
  },
]

export default function GridModules() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-10">
        <div>
            <h2 className="font-heading font-semibold text-3xl text-foreground">
                Direito Constitucional - Fundamentos
            </h2>
            <p className="text-base text-muted-foreground mt-0.5">
                Analisando todos os direitos constitucionais e suas implicações sociais
            </p>
        </div>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">
                Modulo 1: Primeiro passo | Toque abaixo em tutorial ↓ ↓
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((course) => (
            <div
              key={course.title}
              className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => router.push('/courses/lesson/xxx')}
            >
              <div className="relative h-36 w-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #0d2a40, #1a4060)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  {course.emoji}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-foreground font-heading line-clamp-2 leading-snug">
                  {course.title}
                </h3>
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Progresso</span>
                    <span>0%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-0 rounded-full bg-chart-2" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
