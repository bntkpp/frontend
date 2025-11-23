interface EmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  // Esta función se puede integrar con servicios como:
  // - Resend (recomendado para Next.js)
  // - SendGrid
  // - Mailgun
  // - Amazon SES
  
  // Por ahora, solo loguea el email (para desarrollo)
  console.log("=== EMAIL ===")
  console.log("To:", to)
  console.log("Subject:", subject)
  console.log("HTML:", html)
  console.log("=============")
  
  // TODO: Implementar con servicio real
  // Ejemplo con Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({ from: 'noreply@paidek.com', to, subject, html })
  
  return { success: true }
}
