import { BookOpen, Users, Award, Clock, FileCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
	{
		icon: BookOpen,
		title: "Material Completo",
		description:
			"Accede a contenido actualizado, videos explicativos y ejercicios prácticos para cada materia.",
	},
	{
		icon: Users,
		title: "Asistente Virtual IA",
		description:
			"Chatbot inteligente disponible 24/7 para resolver tus dudas sobre cualquier tema del curso.",
	},
	{
		icon: Clock,
		title: "Aprende a tu Ritmo",
		description: "Estudia cuando quieras, desde donde quieras. Acceso 24/7 a todos los materiales.",
	},
	{
		icon: FileCheck,
		title: "Evaluaciones Prácticas",
		description:
			"Pruebas personalizadas y ejercicios interactivos para reforzar tu aprendizaje.",
	},
]

export function Features() {
	return (
		<section id="about" className="py-20 bg-muted/30">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
						¿Por qué elegir Paidek?
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
						Ofrecemos una experiencia de aprendizaje completa diseñada para tu éxito
						académico
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{features.map((feature, index) => (
						<Card key={index} className="border-border">
							<CardContent className="pt-6">
								<div className="flex flex-col items-center text-center gap-4">
									<div className="rounded-full bg-primary/10 p-3">
										<feature.icon className="h-6 w-6 text-primary" />
									</div>
									<h3 className="text-xl font-semibold">{feature.title}</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{feature.description}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	)
}
