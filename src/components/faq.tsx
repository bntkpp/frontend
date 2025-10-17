import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "¿Cómo funcionan los cursos?",
    answer:
      "Los cursos están organizados en módulos con videos, material de lectura y ejercicios prácticos. Puedes avanzar a tu propio ritmo y acceder al contenido 24/7.",
  },
  {
    question: "¿Necesito conocimientos previos?",
    answer:
      "No, nuestros cursos están diseñados para todos los niveles. Comenzamos desde lo básico y avanzamos gradualmente.",
  },
  {
    question: "¿Cuánto tiempo tengo acceso al curso?",
    answer:
      "Una vez que te inscribes en un curso, tienes acceso ilimitado de por vida al contenido y todas las actualizaciones futuras.",
  },
  {
    question: "¿Puedo hacer preguntas sobre el contenido?",
    answer:
      "Sí, cada curso incluye un asistente virtual inteligente disponible 24/7 que puede responder tus dudas y ayudarte con cualquier tema del curso.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos todos los métodos de pago a través de Mercado Pago: tarjetas de crédito, débito y transferencias.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Preguntas Frecuentes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Encuentra respuestas a las preguntas más comunes
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
