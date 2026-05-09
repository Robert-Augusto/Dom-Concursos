import { createClient } from "./supabase/client";
import type { StudyMaterials } from "@/types";

//create 
export async function CreateStudyMaterial(subject_id: string, content: string, file_url: string) {
    const supabase = createClient()
    const {error} = await supabase
        .from('study_materials')
        .insert({
            subjects_id: subject_id,
            content: content,
            file_url: file_url
        })
    return {error}
}

// read by subject
export async function GetStudyMaterialsBySubject(subjectId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("subjects_id", subjectId)
      .single()
    return { data: (data as StudyMaterials | null) ?? null, error };
}