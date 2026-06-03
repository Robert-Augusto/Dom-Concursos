import { createClient } from './supabase/client'
import type { StudyNotes } from '@/types'

export async function CreateStudyNote(
  profileId: string,
  subjectId: string,
  note: string,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('study_notes')
    .insert({
      profile_id: profileId,
      subject_id: subjectId,
      note: note.trim(),
    })
    .select('id')
    .single()

  return { data, error }
}

export async function UpdateStudyNote(noteId: string, note: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('study_notes')
    .update({
      note: note.trim(),
    })
    .eq('id', noteId)

  return { error }
}

export async function GetStudyNoteByProfileAndSubject(
  profileId: string,
  subjectId: string,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('study_notes')
    .select('*')
    .eq('profile_id', profileId)
    .eq('subject_id', subjectId)
    .maybeSingle()

  return { data: (data as StudyNotes | null) ?? null, error }
}
