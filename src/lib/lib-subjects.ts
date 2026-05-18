import { createClient } from "./supabase/client";
import { SubjectType } from "@/types";

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