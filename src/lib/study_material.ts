import { createClient } from "./supabase/client";
import type {
    StudyAgentHtmlVariant,
    StudyMaterials,
    StudyMaterialsAgent,
    StudyMaterialFileType,
} from "@/types";

export type { StudyAgentHtmlVariant }

export function hasStudyAgentContent(data: StudyMaterialsAgent | null): boolean {
    return Boolean(data?.html_full?.trim() || data?.html_summary?.trim())
}

export function getStudyAgentHtml(
    data: StudyMaterialsAgent | null,
    variant: StudyAgentHtmlVariant,
): string | null {
    if (!data || variant === 'notes' || variant === 'rating') return null
    const raw = variant === 'full' ? data.html_full : data.html_summary
    return raw?.trim() ? raw : null
}

export function getDefaultStudyAgentVariant(
    data: StudyMaterialsAgent | null,
): StudyAgentHtmlVariant | null {
    if (data?.html_full?.trim()) return 'full'
    if (data?.html_summary?.trim()) return 'summary'
    return null
}

const STUDY_MATERIALS_BUCKET = 'study_materials_images'

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp'])

export function getStudyMaterialFileType(file: File): StudyMaterialFileType {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (IMAGE_EXTENSIONS.has(ext) || file.type.startsWith('image/')) {
    return 'image'
  }
  return 'text'
}

export function getStudyMaterialStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const marker = `/object/public/${STUDY_MATERIALS_BUCKET}/`
    const idx = url.pathname.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.pathname.slice(idx + marker.length))
  } catch {
    return null
  }
}

// create 
export async function CreateStudyMaterial(
    subject_id: string,
    file_url: string,
    file_type: StudyMaterialFileType,
) {
    const supabase = createClient()
    const {error} = await supabase
        .from('study_materials')
        .insert({
            subjects_id: subject_id,
            file_url: file_url,
            file_type: file_type,
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
      .order('created_at', { ascending: true })
    return { data: (data as StudyMaterials[] | null) ?? [], error };
}

// update
export async function UpdateStudyMaterial(fileUrl: string, studyId: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('study_materials')
        .update({
            file_url: fileUrl
        })
        .eq('id', studyId)
    return {error}
}

// delete
export async function DeleteStudyMaterial(id: string, fileUrl: string) {
    const supabase = createClient()
    const path = getStudyMaterialStoragePath(fileUrl)

    if (path) {
        const { error: storageError } = await supabase.storage
            .from(STUDY_MATERIALS_BUCKET)
            .remove([path])
        if (storageError) return { error: storageError }
    }

    const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id)

    return { error }
}

const IFRAME_BASE_STYLES = `<style>
html,body{margin:0;padding:0}
body{font-size:16px;line-height:1.5;-webkit-text-size-adjust:100%}
</style>`

const IFRAME_STUDY_MOBILE_STYLES = `<style>
html,body{margin:0;padding:0}
body{padding:0.5rem 0.625rem;font-size:16px;line-height:1.5;-webkit-text-size-adjust:100%}
@media(min-width:640px){body{padding:1rem}}
</style>`

/** Wraps agent HTML in a full document so it renders inside an isolated iframe. */
export function wrapAgentHtmlForIframe(
    html: string,
    options?: { compactMobile?: boolean },
): string {
    const trimmed = html.trim()
    const headExtras = options?.compactMobile
        ? IFRAME_STUDY_MOBILE_STYLES
        : IFRAME_BASE_STYLES

    if (/^\s*<!doctype/i.test(trimmed) || /^\s*<html/i.test(trimmed)) {
        if (!options?.compactMobile) return trimmed
        if (/<head[^>]*>/i.test(trimmed)) {
            return trimmed.replace(/<head([^>]*)>/i, `<head$1>${headExtras}`)
        }
        return trimmed.replace(
            /<html([^>]*)>/i,
            `<html$1><head>${headExtras}</head>`,
        )
    }
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base target="_blank" rel="noopener noreferrer">
${headExtras}
</head>
<body>
${trimmed}
</body>
</html>`
}

// study_materials_agent
export async function GetStudyMaterialsAgentBySubject(subjectId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('study_materials_agent')
        .select('*')
        .eq('subject_id', subjectId)
        .maybeSingle()

    return { data: (data as StudyMaterialsAgent | null) ?? null, error }
}
