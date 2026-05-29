import { createClient } from '@/lib/supabase/client'
import type { SubjectType, Subjects } from '@/types'

// select — all subjects (roots + related)
export async function GetAllSubjects() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name', { ascending: true })

  return { data: (data as Subjects[] | null) ?? [], error }
}

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

// update
export async function UpdateSubject(
  subjectId: string,
  name: string,
  type?: SubjectType,
) {
  const supabase = createClient()
  const payload: { name: string; type?: SubjectType } = { name }
  if (type) payload.type = type

  const { data, error } = await supabase
    .from('subjects')
    .update(payload)
    .eq('id', subjectId)
    .select('*')
    .single()

  return { error, data: data as Subjects | null }
}

// delete
export async function DeleteSubject(subjectId: string) {
  const supabase = createClient()
  const {error} = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId)
  return { error }
}