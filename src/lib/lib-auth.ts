import { createBrowserClient } from "@supabase/ssr";
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

// update password (authenticated user)
export async function UpdatePassword(password: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { error: error.message }
    }

    return { error: null }
}

// send reset password email
export async function SendPasswordEmail(email: string) {
    const supabase = createClient()
    const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:3000/auth/reset-password"
    })

    if(error) return {error: error.message}
    
    return {error: null}
}

// reset password
export async function ResetPassword(newPassword: string) {
    const supabase = createClient()
    const {error} = await supabase.auth.updateUser({
        password: newPassword
    })
    
    if (error) return {error: error.message}
    return {error: null}
}