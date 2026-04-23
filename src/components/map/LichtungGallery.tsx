import { useState, useEffect, useRef } from 'react'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import * as api from '../../api/client'

interface GalleryImage {
  id: string
  filename: string
  caption: string
  created_at: string
  user_name: string
}

interface LichtungGalleryProps {
  lichtungId: string
  canUpload: boolean
}

export function LichtungGallery({ lichtungId, canUpload }: LichtungGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [caption, setCaption] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.getLichtungGallery(lichtungId).then(setImages).catch(() => {}).finally(() => setLoading(false))
  }, [lichtungId])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await api.uploadLichtungImage(lichtungId, file, caption)
      const updated = await api.getLichtungGallery(lichtungId)
      setImages(updated)
      setCaption('')
      setShowUpload(false)
    } catch {}
    setUploading(false)
  }

  const handleDelete = async (imageId: string) => {
    try {
      await api.deleteLichtungImage(lichtungId, imageId)
      setImages(prev => prev.filter(i => i.id !== imageId))
      setLightbox(null)
    } catch {}
  }

  if (loading) return <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(10,10,10,0.3)', textAlign: 'center', padding: '16px 0' }}>Laden...</p>

  return (
    <div>
      {/* Upload-Bereich */}
      {canUpload && (
        <div className="mb-4">
          {!showUpload ? (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 w-full justify-center py-3 rounded-lg"
              style={{ background: '#FAFAF8', border: '1px dashed rgba(10,10,10,0.12)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(10,10,10,0.4)' }}
            >
              <Plus size={16} />
              Bild hochladen
            </button>
          ) : (
            <div className="p-4 rounded-lg space-y-3" style={{ background: '#FAFAF8', border: '1px solid rgba(10,10,10,0.06)' }}>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Bildbeschreibung (optional)"
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={{ border: '1px solid rgba(10,10,10,0.1)', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem' }}
              />
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 py-2 rounded-lg"
                  style={{ background: '#1A1A1A', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 500, cursor: uploading ? 'wait' : 'pointer', border: 'none' }}
                >
                  {uploading ? 'Hochladen...' : 'Bild waehlen'}
                </button>
                <button
                  onClick={() => setShowUpload(false)}
                  className="px-3 py-2 rounded-lg"
                  style={{ background: 'transparent', border: '1px solid rgba(10,10,10,0.1)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(10,10,10,0.4)' }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Galerie-Grid */}
      {images.length === 0 ? (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(10,10,10,0.3)', textAlign: 'center', padding: '12px 0' }}>
          Noch keine Bilder.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setLightbox(i)}
              className="aspect-square rounded-lg overflow-hidden"
              style={{ border: '1px solid rgba(10,10,10,0.06)', cursor: 'pointer', padding: 0, background: '#FAFAF8' }}
            >
              <img
                src={`/api/uploads/${img.filename}`}
                alt={img.caption || ''}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && images[lightbox] && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={e => { e.stopPropagation(); setLightbox(null) }}
            className="absolute top-4 right-4"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}
          >
            <X size={28} />
          </button>

          {/* Prev */}
          {lightbox > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1) }}
              className="absolute left-4"
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: '8px', color: '#fff' }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Next */}
          {lightbox < images.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1) }}
              className="absolute right-4"
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: '8px', color: '#fff' }}
            >
              <ChevronRight size={24} />
            </button>
          )}

          <div className="max-w-3xl max-h-[85vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img
              src={`/api/uploads/${images[lightbox].filename}`}
              alt={images[lightbox].caption || ''}
              className="max-w-full max-h-[70vh] rounded-lg object-contain"
            />
            {images[lightbox].caption && (
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginTop: '12px', textAlign: 'center' }}>
                {images[lightbox].caption}
              </p>
            )}
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
              {images[lightbox].user_name} &middot; {new Date(images[lightbox].created_at).toLocaleDateString('de-DE')}
            </p>

            {/* Loeschen */}
            {canUpload && (
              <button
                onClick={() => handleDelete(images[lightbox].id)}
                className="mt-4"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Bild loeschen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
