import type { VideoType } from '@/types'

export function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
      if (parsed.pathname.includes('/shorts/')) {
        const shortId = parsed.pathname.split('/shorts/')[1]
        return shortId ? `https://www.youtube.com/embed/${shortId}` : null
      }
    }
    return null
  } catch {
    return null
  }
}

export function getPandaEmbedUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed)
    if (
      parsed.hostname.includes('pandavideo') ||
      parsed.hostname.includes('panda')
    ) {
      return trimmed
    }
    return trimmed.startsWith('http') ? trimmed : null
  } catch {
    return null
  }
}

export function getLessonVideoEmbedUrl(
  videoType: VideoType | null,
  videoUrl: string | null,
): string | null {
  if (!videoType || !videoUrl?.trim()) return null
  return videoType === 'youtube'
    ? getYoutubeEmbedUrl(videoUrl)
    : getPandaEmbedUrl(videoUrl)
}
