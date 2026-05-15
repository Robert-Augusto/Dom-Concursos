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
    content: string
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

// bancas
export const BANCA_OPTIONS = ['CESPE/CEBRASPE', 'FCC', 'FGV', 'VUNESP'] as const

// notifications
export type NotificationType = 'questions_created'
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
export type QuestionsBanca = typeof BANCA_OPTIONS[number]
export interface QuestionOptions {
    A: string
    B: string
    C: string
    D: string
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
    banca: QuestionsBanca
}
