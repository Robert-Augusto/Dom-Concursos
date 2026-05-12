 'use client'

import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { SearchVideo } from '@/components/shared/SearchVideo'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lessons, Subjects } from '@/types'
import { BookText, Image as ImageIcon, Layers, Pencil, Search, Trash2 } from 'lucide-react'
import EstudoInteligente from '@/components/shared/EstudoInteligente'

const ADMIN_SECTIONS = [
  { id: 'register-lesson', label: 'Aulas' },
  { id: 'smart-study', label: 'Estudo Inteligente' },
] as const

const SMART_ACTION_CARDS = [
  {
    id: 'theory',
    title: 'Texto Teórico',
    description: 'Crie e organize um conteúdo teórico resumido para a matéria selecionada.',
    buttonLabel: 'Abrir editor',
    icon: BookText,
  },
  {
    id: 'support-image',
    title: 'Imagem de Apoio',
    description: 'Adicione uma imagem para reforçar visualmente o estudo do assunto.',
    buttonLabel: 'Selecionar imagem',
    icon: ImageIcon,
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Cadastre perguntas e respostas rápidas para revisão ativa da matéria.',
    buttonLabel: 'Criar flashcard',
    icon: Layers,
  },
] as const

const FLASHCARDS_MOCK = [
  {
    id: 'fc-1',
    subjectId: 'placeholder',
    front: 'Qual é o objetivo principal do controle de constitucionalidade?',
    back: 'Garantir a supremacia da Constituição sobre as demais normas.',
  },
  {
    id: 'fc-2',
    subjectId: 'placeholder',
    front: 'No Windows, qual comando abre o Gerenciador de Tarefas?',
    back: 'Ctrl + Shift + Esc.',
  },
  {
    id: 'fc-3',
    subjectId: 'placeholder',
    front: 'O que significa RLS no Supabase?',
    back: 'Row Level Security, regras de acesso por linha.',
  },
] as const

type AdminSectionId = (typeof ADMIN_SECTIONS)[number]['id']

export default function AdminPage() {
  const [selectedSection, setSelectedSection] =
    useState<AdminSectionId>('register-lesson')
  const [lessons, setLessons] = useState<Lessons[] | null>(null)
  const [subjects, setSubjects] = useState<Subjects[] | null>(null)
  const [subjectSearch, setSubjectSearch] = useState('')
  const [selectedSmartSubjectId, setSelectedSmartSubjectId] = useState<string | null>(null)

  useEffect(() => {
    
    const supabase = createClient()

    async function fetchLessons() {
      const { data: lessonsData } = await supabase.from('lessons').select('*')
      if (lessonsData) setLessons(lessonsData)
    }

    async function fetchSubjects() {
      const { data: subjectsData } = await supabase.from('subjects').select('*')
      if (subjectsData) setSubjects(subjectsData)
    }

    void Promise.all([fetchLessons(), fetchSubjects()])

    const channel = supabase
      .channel('admin_lessons_subjects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        () => {
          fetchLessons()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subjects' },
        () => {
          fetchSubjects()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [])

  const filteredSubjects = useMemo(() => {
    if (!subjects) return []
    const query = subjectSearch.trim().toLowerCase()
    if (!query) return subjects
    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(query)
    )
  }, [subjects, subjectSearch])

  const selectedSmartSubject = useMemo(() => {
    if (!selectedSmartSubjectId || !subjects) return null
    return subjects.find((subject) => subject.id === selectedSmartSubjectId) ?? null
  }, [selectedSmartSubjectId, subjects])

  const flashcardsBySubject = useMemo(() => {
    if (!selectedSmartSubjectId) return []
    return FLASHCARDS_MOCK.map((flashcard, index) => ({
      ...flashcard,
      id: `${selectedSmartSubjectId}-${index}`,
      subjectId: selectedSmartSubjectId,
    }))
  }, [selectedSmartSubjectId])
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <Header />
        <main className="mx-auto max-w-[1210px] p-6">
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-3">
              <h1 className="text-xl font-black text-foreground font-heading">
                Painel Administrativo
              </h1>
              <div className="flex flex-wrap gap-2">
                {ADMIN_SECTIONS.map((section) => {
                  const isSelected = selectedSection === section.id

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setSelectedSection(section.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {section.label}
                    </button>
                  )
                })}
              </div>
            </section>

            {selectedSection === 'register-lesson' ? <SearchVideo
              lessonsData={lessons}
              subjectsData={subjects}
            /> : null}

            {selectedSection === 'smart-study' ? <EstudoInteligente
              subjectsData={subjects}
            /> : null}

          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
