'use client'

import { Download, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

type CourseItem = {
  emoji: string
  title: string
  subject: string
  lessons: string
}

type MaterialItem = {
  title: string
  size: string
  access: 'free' | 'premium'
}

const freeCourses: CourseItem[] = [
  {
    emoji: '⚖️',
    title: 'Direito Constitucional - Fundamentos',
    subject: 'Direito Constitucional',
    lessons: '32 aulas',
  },
  {
    emoji: '📖',
    title: 'Portugues para Concursos - Do Zero',
    subject: 'Lingua Portuguesa',
    lessons: '28 aulas',
  },
  {
    emoji: '🧩',
    title: 'Raciocinio Logico - Iniciante',
    subject: 'Raciocinio Logico',
    lessons: '20 aulas',
  },
]

const premiumCourses: CourseItem[] = [
  {
    emoji: '🏥',
    title: 'Legislacao do SUS - Completo',
    subject: 'Legislacao SUS',
    lessons: '20 aulas',
  },
  {
    emoji: '💻',
    title: 'Nocoes de Informatica - Todas as Bancas',
    subject: 'Informatica',
    lessons: '18 aulas',
  },
  {
    emoji: '📐',
    title: 'Matematica para Concursos - CESPE/FCC',
    subject: 'Matematica',
    lessons: '36 aulas',
  },
]

const materials: MaterialItem[] = [
  {
    title: 'Apostila Legislacao do SUS 2025',
    size: 'PDF - 3.2 MB',
    access: 'free',
  },
  {
    title: '1000 Questoes CESPE Comentadas',
    size: 'PDF - 8.7 MB',
    access: 'premium',
  },
  {
    title: 'Resumo Direito Constitucional',
    size: 'PDF - 1.8 MB',
    access: 'free',
  },
]

export default function GridCourses() {
    const router = useRouter()

  return (
    <div className="flex flex-col gap-10">
      {/* Section 1 - Cursos Gratuitos */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-black text-lg text-foreground">
              Cursos Gratuitos
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Acesso livre para todos os alunos
            </p>
          </div>
          <button className="text-xs text-accent font-semibold hover:underline">
            Ver todos -&gt;
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {freeCourses.map((course) => (
            <div
              key={course.title}
              className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => router.push('/modules/xxx')}
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
                <span className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase bg-chart-2/20 text-chart-2">
                  Gratuito
                </span>
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] rounded px-2 py-0.5">
                  {course.lessons}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-black text-foreground font-heading line-clamp-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {course.subject}
                </p>

                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Progresso</span>
                    <span>0%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-0 rounded-full bg-chart-2" />
                  </div>
                </div>

                <button className="w-full mt-2 py-2 rounded-xl text-xs font-bold bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  Acessar curso
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 - Cursos Exclusivos */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-black text-lg text-foreground">
              Cursos Exclusivos
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Conteudo exclusivo para assinantes
            </p>
          </div>
          <button className="text-xs text-accent font-semibold hover:underline">
            Ver todos -&gt;
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {premiumCourses.map((course) => (
            <div
              key={course.title}
              className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="relative h-36 w-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #1a0d38, #3a1878)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  {course.emoji}
                </div>
                <span className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase bg-primary/20 text-primary">
                  Exclusivo
                </span>
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] rounded px-2 py-0.5">
                  {course.lessons}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-black text-foreground font-heading line-clamp-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {course.subject}
                </p>

                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Progresso</span>
                    <span>0%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-0 rounded-full bg-chart-2" />
                  </div>
                </div>

                <button
                  className="w-full mt-2 py-2 rounded-xl text-xs font-black text-primary-foreground transition-opacity hover:opacity-90"
                  style={{
                    background: 'linear-gradient(90deg, #C9A84C, #DDA83A)',
                  }}
                >
                  Acessar curso
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 - Apostilas & PDFs */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-black text-lg text-foreground">
              Apostilas &amp; PDFs
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Materiais para baixar e estudar offline
            </p>
          </div>
          <button className="text-xs text-accent font-semibold hover:underline">
            Ver todos -&gt;
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <div
              key={material.title}
              className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border hover:border-accent/30 transition-colors cursor-pointer"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #0d3020, #1a5a38)',
                }}
              >
                <FileText className="h-6 w-6 text-chart-2" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground line-clamp-1">
                  {material.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {material.size}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={
                      material.access === 'free'
                        ? 'rounded-full px-2 py-0.5 text-[9px] font-black bg-chart-2/20 text-chart-2'
                        : 'rounded-full px-2 py-0.5 text-[9px] font-black bg-primary/20 text-primary'
                    }
                  >
                    {material.access === 'free' ? 'Gratis' : 'Premium'}
                  </span>
                </div>
              </div>

              <button className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted hover:bg-accent hover:text-accent-foreground transition-colors">
                <Download className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
