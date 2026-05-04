import { create } from "domain";
import { createClient } from "./supabase/client";

// login
export async function Login (email:string, password: string) {
    const supabase = createClient()
    const {error} = await supabase.auth.signInWithPassword({email, password})
    
    if (error?.message === "Invalid login credentials") {
        return {error: "Email ou Senha inválidos"}
    }

    return {error: error?.message}
}

// signup
export async function Signup(name: string, password: string, email: string, whatsapp: string) {
    const supabase = createClient()
    const {error} = await supabase.auth.signUp({
        email,
        password,
        options:{
            data: {
                name,
                email,
                whatsapp
            }
        }
    })
    return {error}
}

// logout
export async function Logout(){
    const supabase = createClient()
    const {error} = await supabase.auth.signOut()
    return {error}
}