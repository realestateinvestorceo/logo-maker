import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Call Claude with a structured tool_use response
 */
export async function callClaudeWithTool({ system, messages, tool, maxTokens = 4096 }) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: maxTokens,
    system,
    messages,
    tools: [tool],
    tool_choice: { type: 'tool', name: tool.name },
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse) {
    throw new Error('Claude did not return a tool_use response')
  }

  return toolUse.input
}

/**
 * Call Claude with a text response (for prompt engineering, rationales, etc.)
 */
export async function callClaude({ system, messages, maxTokens = 4096 }) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: maxTokens,
    system,
    messages,
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock?.text || ''
}

/**
 * Call Claude with vision (image analysis)
 */
export async function callClaudeWithVision({ system, textPrompt, imageBase64, mediaType = 'image/png', tool, maxTokens = 4096 }) {
  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: imageBase64 },
        },
        { type: 'text', text: textPrompt },
      ],
    },
  ]

  if (tool) {
    return callClaudeWithTool({ system, messages, tool, maxTokens })
  }

  return callClaude({ system, messages, maxTokens })
}
