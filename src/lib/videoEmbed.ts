/**
 * Erkennt Video-URLs (YouTube, Vimeo) und gibt die Embed-URL zurueck.
 * Bei unbekannten URLs → null (dann stattdessen Link anzeigen).
 */
export function getVideoEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()

  // YouTube: youtube.com/watch?v=XXX, youtu.be/XXX, youtube.com/embed/XXX
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/)
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
  }

  // Vimeo: vimeo.com/XXX, player.vimeo.com/video/XXX
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return null
}

/**
 * Thumbnail-URL fuer YouTube-Videos (um als Poster vor dem Embed zu dienen).
 */
export function getVideoThumbnail(url: string | null | undefined): string | null {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/)
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
  return null
}
