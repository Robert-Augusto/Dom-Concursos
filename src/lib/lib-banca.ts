import { createClient } from '@/lib/supabase/client'
import type { Banca } from '@/types'

// select
export async function GetBancas() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('banca')
    .select('*')
    .order('name', { ascending: true })

  return { data: (data as Banca[] | null) ?? [], error }
}

// create
export async function CreateBanca(name: string) {
  const supabase = createClient()
  const { error } = await supabase.from('banca').insert({ name })
  return { error }
}

// delete
export async function DeleteBanca(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('banca').delete().eq('id', id)
  return { error }
}
