'use client'

import { useRouter } from 'next/navigation'
import {ChevronsRight} from 'lucide-react'

type CourseItem = {
  emoji: string
  title: string
  lessons: string
}

const freeCourses: CourseItem[] = [
  {
    emoji: '⚖️',
    title: 'Direito Constitucional - Fundamentos',
    lessons: '32 aulas',
  },
  {
    emoji: '📖',
    title: 'Portugues para Concursos - Do Zero',
    lessons: '28 aulas',
  },
  {
    emoji: '🧩',
    title: 'Raciocinio Logico - Iniciante',
    lessons: '20 aulas',
  },
]

export default function GridModules() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">
              Modulo 1: Primeiro passo | Toque abaixo em tutorial ↓ ↓
            </h2>
          </div>
        </div>

        <div>
          <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory px-2 py-2">
            {freeCourses.map((course) => (
              <div
                key={course.title}
                className="group bg-chart-5 rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-colors cursor-pointer flex items-center justify-center"
                style={{ width: '220px', height: '280px', minWidth: '220px' }}
                onClick={() => router.push('/courses/lesson/xxx')}
              >
              <div className="text-4xl">
                {course.emoji}
              </div>
            </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 pt-1">
          <div className="flex items-center justify-center gap-1.5">
            <div className="h-1 w-6 rounded-full bg-primary" />
            <div className="h-1 w-3 rounded-full bg-muted" />
            <div className="h-1 w-3 rounded-full bg-muted" />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ChevronsRight className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span>Deslize para ver mais cursos</span>
          </div>
        </div>

      </section>
    </div>
  )
}
