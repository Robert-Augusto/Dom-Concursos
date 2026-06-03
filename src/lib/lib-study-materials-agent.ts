import { createClient } from "./supabase/client";

// create
export async function CreateStudyMaterialsAgent(subjectId: string){
    const supabase = createClient()
    const {data, error} = await supabase
        .from('study_materials_agent')
        .insert({
            subject_id: subjectId
        })
        .select('id')
        .single()
    return {data, error}
}