import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

export const opencodeZen = createOpenAICompatible({
  name: 'opencode-zen',
  baseURL: 'https://opencode.ai/zen/v1',
  apiKey: process.env.OPENCODE_ZEN_API_KEY,
})

export const chatModel = opencodeZen('deepseek-v4-flash-free')
