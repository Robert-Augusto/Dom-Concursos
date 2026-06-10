import { createClient } from './supabase/client'
import type { Faq } from '@/types'

export async function CreateFaq(question: string, answer: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('faqs')
    .insert({
      question: question.trim(),
      answer: answer.trim(),
    })
    .select('id')
    .single()

  return { data, error }
}

export async function GetFaqs() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: (data as Faq[] | null) ?? null, error }
}

export async function UpdateFaq(id: string, question: string, answer: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('faqs')
    .update({
      question: question.trim(),
      answer: answer.trim(),
    })
    .eq('id', id)

  return { error }
}

export async function DeleteFaq(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('faqs').delete().eq('id', id)

  return { error }
}
