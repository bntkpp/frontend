import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const maxDuration = 30

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { messages, courseId, courseName } = await req.json()

    // Verificar autenticación
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignorar errores
            }
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar inscripción si hay courseId
    if (courseId) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("status", "active")
        .single()

      if (!enrollment) {
        return Response.json(
          { error: "No estás inscrito en este curso" },
          { status: 403 }
        )
      }
    }

    const systemPrompt = courseId
      ? `Eres un profesor virtual experto en el curso "${courseName}". Tu objetivo es ayudar a los estudiantes a comprender mejor los conceptos, resolver dudas y guiarlos en su aprendizaje. Sé claro, paciente y educativo. Proporciona ejemplos cuando sea apropiado. Responde siempre en español.`
      : `Eres un asistente virtual educativo de Paidek. Ayuda a los estudiantes con información general sobre la plataforma, cursos disponibles y cómo pueden mejorar su aprendizaje. Sé amigable y profesional. Responde siempre en español.`

    // CAMBIO: usar gemini-2.5-flash (modelo disponible)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    })

    // Convertir mensajes al formato de Google
    const chatHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessageStream(lastMessage.content)

    // Crear stream de respuesta
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            controller.enqueue(encoder.encode(text))
          }
          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error: any) {
    console.error("Chat API error:", error)
    return Response.json(
      { error: error.message || "Error inesperado" },
      { status: 500 }
    )
  }
}