import { Flame, ShoppingCart, Star } from 'lucide-react'

interface FeaturedCourse {
  id: string
  emoji: string
  thumbnailName: string
  thumbnailGradient: string
  badge?: { label: string; color: string }
  rating: number
  ratingCount: string
  title: string
  professor: string
  category: string
  categoryColor: string
  description: string
  tags: { label: string; type: 'lessons' | 'banca' | 'year' | 'material' }[]
  originalPrice: string
  salePrice: string
  buttonColor: string
}

const featuredCourses: FeaturedCourse[] = [
  {
    id: '1',
    emoji: '🏥',
    thumbnailName: 'Concurso SESA-PR 2025',
    thumbnailGradient:
      'linear-gradient(135deg, #0d3020 0%, #1a5a38 50%, #0a2218 100%)',
    badge: { label: 'Mais Vendido', color: 'bg-chart-2' },
    rating: 4.9,
    ratingCount: '312 alunos',
    title: 'Preparatorio SESA-PR - Tecnico em Enfermagem',
    professor: 'Prof. Dra. Ana Rodrigues',
    category: 'Enfermagem',
    categoryColor: 'text-chart-2',
    description:
      'Curso completo para Tecnico em Enfermagem da SESA-PR. Abrange todas as materias do edital: Legislacao do SUS, Enfermagem Clinica, Etica, Biosseguranca e Portugues.',
    tags: [
      { label: '58 aulas', type: 'lessons' },
      { label: 'Banca FAFIPA', type: 'banca' },
      { label: 'Edital 2025', type: 'year' },
      { label: 'PDF incluso', type: 'material' },
    ],
    originalPrice: 'R$ 297,00',
    salePrice: 'R$ 197,00',
    buttonColor: 'bg-chart-2',
  },
  {
    id: '2',
    emoji: '⚖️',
    thumbnailName: 'Direito para Concursos',
    thumbnailGradient:
      'linear-gradient(135deg, #1a0d38 0%, #3a1878 50%, #140a28 100%)',
    badge: { label: 'Novo', color: 'bg-chart-5' },
    rating: 4.8,
    ratingCount: '87 alunos',
    title: 'Dir. Constitucional + Administrativo do Zero',
    professor: 'Prof. Dr. Fernando Ramos',
    category: 'Direito Publico',
    categoryColor: 'text-chart-5',
    description:
      'Curso completo de Direito Constitucional e Administrativo para concursos de qualquer area. Do basico ao avancado, com foco em bancas CESPE e FCC.',
    tags: [
      { label: '72 aulas', type: 'lessons' },
      { label: 'CESPE + FCC', type: 'banca' },
      { label: 'Apostila PDF', type: 'material' },
    ],
    originalPrice: 'R$ 197,00',
    salePrice: 'R$ 147,00',
    buttonColor: 'bg-chart-5',
  },
]

export default function GridPricePlans() {
  function getTagClasses(type: FeaturedCourse['tags'][0]['type']) {
    switch (type) {
      case 'lessons':
        return 'bg-secondary text-secondary-foreground'
      case 'banca':
        return 'bg-accent/15 text-accent'
      case 'year':
        return 'bg-destructive/15 text-destructive'
      case 'material':
        return 'bg-chart-2/15 text-chart-2'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const isOddTotal = featuredCourses.length % 2 !== 0

  return (
    <section>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-5 w-5 text-orange-400" />
            <h2 className="font-heading font-black text-xl text-foreground">
              Cursos em Destaque
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Cursos completos disponiveis para compra avulsa
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {featuredCourses.map((course, index) => {
          const isLastOddCard = isOddTotal && index === featuredCourses.length - 1

          return (
            <article
              key={course.id}
              className={`relative bg-card rounded-2xl overflow-hidden border border-border hover:border-border/80 transition-colors flex flex-col ${
                isLastOddCard ? 'md:col-span-2' : ''
              }`}
            >
              <div className="relative h-52 w-full overflow-hidden flex flex-col items-center justify-center gap-3 p-6">
                <div
                  className="absolute inset-0"
                  style={{ background: course.thumbnailGradient }}
                />
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {course.badge ? (
                  <span
                    className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white ${course.badge.color}`}
                  >
                    {course.badge.label}
                  </span>
                ) : null}

                <div className="relative z-10 text-5xl">{course.emoji}</div>
                <h3
                  className="relative z-10 font-heading font-black text-white text-lg text-center"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                >
                  {course.thumbnailName}
                </h3>
              </div>

              <div className="flex-1 flex flex-col p-5 gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={`${course.id}-star-${starIndex}`}
                        className="h-3.5 w-3.5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {course.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({course.ratingCount})
                  </span>
                </div>

                <h4 className="font-heading font-black text-base text-foreground leading-snug">
                  {course.title}
                </h4>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-accent">
                    {course.professor}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className={`text-xs font-semibold ${course.categoryColor}`}>
                    {course.category}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span
                      key={`${course.id}-${tag.label}`}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getTagClasses(tag.type)}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>

                <div className="flex items-end justify-between mt-auto pt-2">
                  <div>
                    <span className="text-xs text-muted-foreground line-through">
                      {course.originalPrice}
                    </span>
                    <p className="font-heading font-black text-xl text-primary">
                      {course.salePrice}
                    </p>
                  </div>

                  <button
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 ${
                      course.buttonColor === 'bg-primary'
                        ? 'bg-primary text-primary-foreground'
                        : `${course.buttonColor} text-white`
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Comprar
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
