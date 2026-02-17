import pdf from 'pdf-parse'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Read raw body
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const body = Buffer.concat(chunks)

    // Parse multipart form data to extract the PDF file
    const boundary = req.headers['content-type']?.split('boundary=')[1]
    if (!boundary) {
      return res.status(400).json({ error: 'Missing multipart boundary' })
    }

    // Find the file content between boundaries
    const bodyStr = body.toString('latin1')
    const parts = bodyStr.split(`--${boundary}`)
    let pdfBuffer = null

    for (const part of parts) {
      if (part.includes('application/pdf') || part.includes('.pdf')) {
        const headerEnd = part.indexOf('\r\n\r\n')
        if (headerEnd !== -1) {
          const content = part.slice(headerEnd + 4)
          // Remove trailing \r\n--
          const cleanContent = content.replace(/\r\n--$/, '').replace(/\r\n$/, '')
          pdfBuffer = Buffer.from(cleanContent, 'latin1')
        }
      }
    }

    if (!pdfBuffer) {
      return res.status(400).json({ error: 'No PDF file found in upload' })
    }

    const result = await pdf(pdfBuffer)

    res.status(200).json({
      text: result.text,
      pages: result.numpages,
      info: result.info,
    })
  } catch (err) {
    res.status(500).json({ error: 'PDF parsing failed: ' + err.message })
  }
}
