'use client'

import MuxPlayer from '@mux/mux-player-react'

export function isValidMuxPlaybackId(
  value: string | null | undefined,
): value is string {
  if (!value) return false
  const trimmed = value.trim()
  return trimmed.length >= 8 && /^[A-Za-z0-9]+$/.test(trimmed)
}

type LiveMuxPlayerProps = {
  playbackId: string
}

export default function LiveMuxPlayer({ playbackId }: LiveMuxPlayerProps) {
  if (!isValidMuxPlaybackId(playbackId)) return null

  return (
    <MuxPlayer
      key={playbackId}
      playbackId={playbackId}
      streamType="live"
      className="aspect-video w-full"
      accentColor="#C9A84C"
    />
  )
}
