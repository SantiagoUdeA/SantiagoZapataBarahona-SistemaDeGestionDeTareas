import { convertToModelMessages, streamText, stepCountIs, type ToolSet } from 'ai'
import { getSession } from '@/lib/auth/guard'
import { toolset } from '@/lib/ai/tools'
import { chatModel } from '@/lib/ai/provider'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return new Response('No autorizado', { status: 401 })
    }

    const body = await req.json()
    const messages = body.messages

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages debe ser un array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const modelMessages = await convertToModelMessages(messages)

    const result = streamText({
      model: chatModel,
      system: `Eres un asistente de gestion de tareas TaskFlow.
Usuario: ${session.fullName}, rol: ${session.role}, id: ${session.id}.

Reglas:
- Responde en espanol neutral, conciso.
- Tus respuestas no deben contener caracteres especiales ni emojis, solo texto plano, como una conversación por chat, puedes incluir listas, comillas. NO es formato MARKDOWN.
- Para acciones destructivas (delete, role change, remove from project), confirma con el usuario antes de ejecutar.
- Si el usuario pide algo fuera de su rol, explica que no tiene permiso.
- IDs: usa los que devuelven las queries. No inventes UUIDs.
- Tras ejecutar una mutacion, confirma el resultado con un mensaje breve en espanol.
- Solo respondes peticiones correspondientes a la gestion de tareas, proyectos y usuarios. Para cualquier otra consulta, responde "Lo siento, no puedo ayudarte con eso." `,
      messages: modelMessages,
      tools: toolset as ToolSet,
      stopWhen: stepCountIs(5),
      onError: ({ error }) => {
        console.error('[chat] streamText error:', error)
      },
      onStepFinish: ({ text, finishReason, toolCalls, toolResults, usage }) => {
        console.log('[chat] step finished:', {
          finishReason,
          textLength: text?.length ?? 0,
          textPreview: text?.slice(0, 120),
          toolCalls: toolCalls?.map((c) => c.toolName),
          toolResultsCount: toolResults?.length ?? 0,
          usage,
        })
      },
      onFinish: ({ text, finishReason, steps }) => {
        console.log('[chat] finished:', {
          finishReason,
          steps: steps.length,
          finalTextLength: text?.length ?? 0,
          finalTextPreview: text?.slice(0, 200),
        })
      },
    })

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error('[chat] stream response error:', error)
        return error instanceof Error ? error.message : String(error)
      },
    })
  } catch (error) {
    console.error('Error en /api/chat:', error)
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
