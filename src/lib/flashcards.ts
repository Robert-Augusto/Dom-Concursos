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