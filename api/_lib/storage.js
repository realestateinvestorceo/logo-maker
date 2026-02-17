import { supabase } from './supabase.js'

/**
 * Upload a base64 image to Supabase Storage
 */
export async function uploadImage(bucket, path, base64Data, contentType = 'image/png') {
  const buffer = Buffer.from(base64Data, 'base64')

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  return data.path
}

/**
 * Get a public URL for a stored file
 */
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get a signed URL for a stored file (time-limited)
 */
export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) throw new Error(`Signed URL failed: ${error.message}`)
  return data.signedUrl
}

/**
 * Download a file from storage as base64
 */
export async function downloadAsBase64(bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path)

  if (error) throw new Error(`Storage download failed: ${error.message}`)

  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer).toString('base64')
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw new Error(`Storage delete failed: ${error.message}`)
}
