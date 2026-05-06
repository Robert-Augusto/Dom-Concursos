// LESSONS
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

// SUBJECTS
export type SubjectType = 'basic' | 'specific'

export interface Subjects {
    id: string
    created_at: Date
    name: string
    subject_id: string | null
    type: SubjectType 
}

// PROFILE
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