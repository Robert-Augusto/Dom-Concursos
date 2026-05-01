'use client'

import { useRouter } from 'next/navigation'

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

const premiumCourses: CourseItem[] = [
  {
    emoji: '🏥',
    title: 'Legislacao do SUS - Completo',
    lessons: '20 aulas',
  },
  {
    emoji: '💻',
    title: 'Nocoes de Informatica - Todas as Bancas',
    lessons: '18 aulas',
  },
  {
    emoji: '📐',
    title: 'Matematica para Concursos - CESPE/FCC',
    lessons: '36 aulas',
  },
]

export default function GridModules() {
  const router = useRouter()

  function renderCard(course: CourseItem, accentGradient: string) {
    return (
      <div
        key={course.title}
        className="relative rounded-xl overflow-hidden cursor-pointer border border-border hover:border-primary/40 hover:scale-[1.03] transition-all duration-200 aspect-square"
        onClick={() => router.push('/courses/lesson/xxx')}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #1a0d38, #3a1878)' }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl">{course.emoji}</span>
        </div>

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
          }}
        />

        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: accentGradient }}
        />
      </div>
    )
  }

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
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory md:hidden">
            {freeCourses.map((course) => (
              <div key={course.title} className="flex-shrink-0 w-[140px] snap-start">
                {renderCard(
                  course,
                  'linear-gradient(90deg, #2ECC8A, #3D7FFF)'
                )}
                <p className="text-[11px] text-muted-foreground text-center mt-1 line-clamp-1 w-[140px]">
                  {course.lessons}
                </p>
              </div>
            ))}
          </div>

          <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4">
            {freeCourses.map((course) => (
              <div key={course.title}>
                {renderCard(course, 'linear-gradient(90deg, #2ECC8A, #3D7FFF)')}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">
              Modulo 2: Conteudo Exclusivo | Continue seus estudos ↓ ↓
            </h2>
          </div>
        </div>

        <div>
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory md:hidden">
            {premiumCourses.map((course) => (
              <div key={course.title} className="flex-shrink-0 w-[140px] snap-start">
                {renderCard(
                  course,
                  'linear-gradient(90deg, #C9A84C, #DDA83A)'
                )}
                <p className="text-[11px] text-muted-foreground text-center mt-1 line-clamp-1 w-[140px]">
                  {course.lessons}
                </p>
              </div>
            ))}
          </div>

          <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4">
            {premiumCourses.map((course) => (
              <div key={course.title}>
                {renderCard(course, 'linear-gradient(90deg, #C9A84C, #DDA83A)')}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
