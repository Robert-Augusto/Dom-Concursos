import {
    FileText,
    Flame,
    HelpCircle,
    Lightbulb,
    Star,
  } from 'lucide-react'

// lessons
export type VideoType = 'youtube' | 'panda'
export type AccessLevel = 'free' | 'plus' | 'premium'
export interface Lessons {
    id: string
    created_at: Date
    title: string
    description: string
    video_type: VideoType
    video_url: string
    duration_seconds: string
    access_level: AccessLevel
    order: number
    is_published: boolean
    is_searchable: boolean
    subject_id: string
    thumbnail?: string | null
}

export interface LessonMaterials {
    id: string
    created_at: Date
    lessons_id: string
    title: string
    file_url: string
    file_type: string
}

// live_classes
export type LiveClassesStatus = 'scheduled' | 'ended'

export interface LiveClasses {
    id: string
    created_at: string
    title: string | null
    scheduled_at: string | null
    thumbnail_url: string | null
    video_url: string | null
    status: LiveClassesStatus | null
}

// subjects
export type SubjectType = 'basic' | 'specific'
export interface Subjects {
    id: string
    created_at: Date
    name: string
    subject_id: string | null
    type: SubjectType 
}

// profile
export type ProfileRole = 'admin' | 'teacher' | 'student'
export interface Profile {
    id: string
    created_at: Date
    name: string
    email: string
    role: ProfileRole
    access_level: AccessLevel
    avatar_url: string
    whatsapp: string
    headline: string | null
}

// study_materials
export type StudyMaterialFileType = 'image' | 'text' | 'audio'

export interface StudyMaterials {
    id: string
    created_at: Date
    subjects_id: string
    file_url: string
    file_type: StudyMaterialFileType
}

// study_materials_agent
export type StudyAgentHtmlVariant =
    | 'full'
    | 'summary'
    | 'notes'
    | 'rating'

export interface StudyMaterialsAgent {
    id: string
    created_at: Date
    subject_id: string
    html_full: string | null
    html_summary: string | null
}

// study_notes
export interface StudyNotes {
    id: string
    created_at: Date
    profile_id: string
    subject_id: string
    note: string
}

// study_flashcards
export interface StudyFlashcards { 
    id: string
    created_at: Date
    subjects_id: string
    front: string
    back: string
}

// notifications
export type NotificationType =
    | 'questions_created'
    | 'questions_error'
    | 'study_nps'
    | 'comment_post'
export type NotificationRole = 'all' | 'admin'
export interface Notifications {
    id: string
    created_at: Date
    title: string
    message: string
    type: NotificationType
    role: NotificationRole
    profile_id?: string | null
}

// notifications read
export interface NotificationsRead {
    id: string
    created_at: Date
    profile_id: string
    notifications_id: string
    read_at: Date
}

// questions
export type QuestionsDifficulty = 'Fácil' | 'Médio' | 'Difícil'
export const DIFFICULTY_SELECT: QuestionsDifficulty[] = [
    'Fácil',
    'Médio',
    'Difícil',
]
export const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E'] as const
export const Anos = Array.from({ length: 2026 - 1994 + 1 }, (_, i) => String(1994 + i))
export type OptionKey = (typeof OPTION_KEYS)[number]
export interface QuestionOptions {
    A: string
    B: string
    C: string
    D: string
    E: string
}
export interface Questions {
    id: string
    created_at: Date
    subjects_id: string
    question: string
    options: QuestionOptions
    correct_option: string
    explanation: string
    difficulty: QuestionsDifficulty
    banca: string
    banca_name?: string
    ano: string
    instituicao: string
}

// banca
export interface Banca {
    id: string
    created_at: Date
    name: string
}

// study session
export interface StudySession {
    id: string
    created_at: Date
    profile_id: string
    subject_id: string
    started_at: Date
    end_at: Date
}

// study session answears
export interface StudySessionAnswears {
    id: string
    created_at: Date
    study_session_id: string
    subject_question_id: string
    selected_option: string
    is_correct: boolean
}

// subject question review
export interface StudyQuestionReview {
    id: string
    created_at: Date
    subjects_questions_id: string
    profile_id: string
}

// community post tags
export type FilterKey = 'Dicas' | 'Editais' | 'Dúvidas' | 'Aprovação'
export type CommunityPostType = FilterKey

export const filters: Array<{ label: FilterKey; icon: React.ComponentType<{ className?: string }> }> = [
    { label: 'Aprovação', icon: Flame },
    { label: 'Dicas', icon: Lightbulb },
    { label: 'Editais', icon: FileText },
    { label: 'Dúvidas', icon: HelpCircle },
]

export interface CommunityPost {
    id: number
    created_at: string
    profile_id: string | null
    content: string | null
    image_url: string | null
    video_url: string | null
    type: CommunityPostType | null
}

export interface CommunityPostProfile {
    id: string
    name: string | null
    role: ProfileRole | null
    avatar_url: string | null
    headline: string | null
}

export interface CommunityLike {
    id: number
    profile_id: string | null
}

export interface CommunityPostWithRelations extends CommunityPost {
    profile: CommunityPostProfile | null
    community_likes: CommunityLike[]
    community_comments: { id: number }[]
}

export interface CommunityComment {
    id: number
    created_at: string
    profile_id: string | null
    content: string | null
    post_id: number | null
}

export interface CommunityCommentWithProfile extends CommunityComment {
    profile: CommunityPostProfile | null
}

// faqs
export interface Faq {
    id: string
    created_at: string
    question: string | null
    answer: string | null
}