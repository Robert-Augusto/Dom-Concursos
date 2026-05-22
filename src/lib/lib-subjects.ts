import { createClient } from '@/lib/supabase/client'
import type { SubjectType, Subjects } from '@/types'

// select — root subjects only (no related / child rows)
export async function GetRootSubjects() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .is('subject_id', null)
    .order('name', { ascending: true })

  return { data: (data as Subjects[] | null) ?? [], error }
}

// create
export async function CreateSubject(
  name: string,
  type: SubjectType,
  subjectId: string | null
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('subjects')
    .insert({
      name: name,
      type: type,
      subject_id: subjectId,
    })
    .select('id')
    .single()
  return { error, data: data as { id: string } | null }
}

// delete
export async function DeleteSubject(subjectId: string) {
  const supabase = createClient()
  const {error} = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId)
  return {error}
  }