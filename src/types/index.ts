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
}

// study_materials
export interface StudyMaterials {
    id: string
    created_at: Date
    subjects_id: string
    file_url: string
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
export type NotificationType = 'questions_created' | 'questions_error'
export type NotificationRole = 'all' | 'admin'
export interface Notifications {
    id: string
    created_at: Date
    title: string
    message: string
    type: NotificationType
    role: NotificationRole
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