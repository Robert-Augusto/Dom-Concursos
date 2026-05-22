import { createClient } from "./supabase/client";
import type { StudyFlashcards } from "@/types";

//create
export async function CreateFlashcard(subjects_id: string, front: string, back: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('study_flashcards')
        .insert({
            subjects_id: subjects_id,
            front: front,
            back: back,
        })
    return {error}
}

// read by subject
export async function GetFlashcardsBySubject(subjectId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("study_flashcards")
      .select("*")
      .eq("subjects_id", subjectId)
      .order("created_at", { ascending: false });
    return { data: (data as StudyFlashcards[] | null) ?? [], error };
}

// read up to N flashcards for study session (default 3)
export async function GetStudyFlashcardsBySubject(
  subjectId: string,
  limit = 3,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('study_flashcards')
    .select('*')
    .eq('subjects_id', subjectId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data: (data as StudyFlashcards[] | null) ?? [], error }
}

// update
export async function UpdateFlashcard(flashcardId: string, front: string, back: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('study_flashcards')
        .update({
            front: front,
            back: back
        })
        .eq('id', flashcardId)
    return {error}
}

// delete
export async function DeleteFLashcard(id: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('study_flashcards')
        .delete()
        .eq('id', id)
    return {error}
}