import { GoogleAuth } from 'google-auth-library'

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
const region = process.env.GOOGLE_CLOUD_REGION || 'us-central1'
const model = process.env.IMAGEN_MODEL || 'imagen-3.0-generate-002'

let authClient = null

async function getAuthClient() {
  if (authClient) return authClient

  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}')
  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })
  authClient = await auth.getClient()
  return authClient
}

/**
 * Generate an image from a text prompt using Imagen 3
 */
export async function generateImage(prompt, options = {}) {
  const {
    sampleCount = 1,
    aspectRatio = '1:1',
    negativePrompt = '',
  } = options

  const client = await getAuthClient()
  const endpoint = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${model}:predict`

  const requestBody = {
    instances: [{ prompt }],
    parameters: {
      sampleCount,
      aspectRatio,
      ...(negativePrompt && { negativePrompt }),
    },
  }

  const response = await client.request({
    url: endpoint,
    method: 'POST',
    data: requestBody,
  })

  const predictions = response.data.predictions || []
  return predictions.map((p) => ({
    base64: p.bytesBase64Encoded,
    mimeType: p.mimeType || 'image/png',
  }))
}

/**
 * Edit an image using a reference image + prompt (Imagen 3 editing)
 */
export async function editImage(referenceImageBase64, prompt, options = {}) {
  const {
    sampleCount = 1,
    editMode = 'EDIT_MODE_INPAINT_INSERTION',
  } = options

  const client = await getAuthClient()
  const editModel = process.env.IMAGEN_EDIT_MODEL || 'imagen-3.0-capability-001'
  const endpoint = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${editModel}:predict`

  const requestBody = {
    instances: [
      {
        prompt,
        referenceImages: [
          {
            referenceType: 'REFERENCE_TYPE_STYLE',
            referenceImage: {
              bytesBase64Encoded: referenceImageBase64,
            },
          },
        ],
      },
    ],
    parameters: {
      sampleCount,
      editMode,
    },
  }

  const response = await client.request({
    url: endpoint,
    method: 'POST',
    data: requestBody,
  })

  const predictions = response.data.predictions || []
  return predictions.map((p) => ({
    base64: p.bytesBase64Encoded,
    mimeType: p.mimeType || 'image/png',
  }))
}
