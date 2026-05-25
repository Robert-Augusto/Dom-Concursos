import { createClient } from "./supabase/client";

// create
export async function CreateSuport(profile_id: string, title: string, message: string, status: string, type: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('suport')
        .insert({
            profile_id: profile_id,
            title: title,
            message: message,
            status: status,
            type: type,
        })
    return {error}
}
