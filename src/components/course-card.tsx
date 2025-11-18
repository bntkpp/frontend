"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

interface CourseCardProps {
  id: string
  title: string
  description: string
  image_url: string | null
  payment_type: string | null
  one_time_price: number | null
  price_1_month: number | null
  price_4_months: number | null
  price_8_months: number | null
  duration_hours: number | null
  level: string | null
}

const levelLabels: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
}

export function CourseCard({
  id,
  title,
  description,
  image_url,
  payment_type,
  one_time_price,
  price_1_month,
  price_4_months,
  price_8_months,
  duration_hours,
  level,
}: CourseCardProps) {
  // Detectar si es pago único
  const isOneTimePayment = payment_type === "one_time" || !!one_time_price
  
  // Valores por defecto para precios nulos
  const monthlyPrice = price_1_month ?? 0
  const fourMonthsPrice = price_4_months ?? 0
  const eightMonthsPrice = price_8_months ?? 0

  const calculateSavings = (monthlyPrice: number, totalPrice: number, months: number) => {
    const regularTotal = monthlyPrice * months
    const savings = regularTotal - totalPrice
    const savingsPercent = Math.round((savings / regularTotal) * 100)
    return { savings, savingsPercent }
  }

  const savings4Months = calculateSavings(monthlyPrice, fourMonthsPrice, 4)
  const savings8Months = calculateSavings(monthlyPrice, eightMonthsPrice, 8)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow">
        <motion.div 
          className="relative h-48 w-full overflow-hidden bg-muted"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {image_url ? (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          {level && (
            <Badge className="absolute top-2 right-2 capitalize">
              {levelLabels[level] || level}
            </Badge>
          )}
        </motion.div>

      <CardHeader>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {duration_hours && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4" />
            <span>{duration_hours} horas de contenido</span>
          </div>
        )}

        {isOneTimePayment ? (
          // Mostrar precio único
          <div className="mt-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold">
                ${one_time_price?.toLocaleString("es-CL")}
              </span>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Pago único
            </p>
          </div>
        ) : (
          // Mostrar tabs con múltiples opciones de suscripción
          <Tabs defaultValue="1_month" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="1_month" className="text-xs" disabled={!price_1_month}>1 Mes</TabsTrigger>
              <TabsTrigger value="4_months" className="text-xs" disabled={!price_4_months}>4 Meses</TabsTrigger>
              <TabsTrigger value="8_months" className="text-xs" disabled={!price_8_months}>8 Meses</TabsTrigger>
            </TabsList>
            
            {price_1_month && (
              <TabsContent value="1_month" className="space-y-2 mt-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">
                    ${monthlyPrice.toLocaleString("es-CL")}
                  </span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Renovación mensual
                </p>
              </TabsContent>
            )}
            
            {price_4_months && (
              <TabsContent value="4_months" className="space-y-2 mt-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      ${fourMonthsPrice.toLocaleString("es-CL")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      ${(fourMonthsPrice / 4).toLocaleString("es-CL")}/mes
                    </span>
                    {savings4Months.savingsPercent > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Ahorra {savings4Months.savingsPercent}%
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Pago único por 4 meses
                </p>
              </TabsContent>
            )}
            
            {price_8_months && (
              <TabsContent value="8_months" className="space-y-2 mt-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      ${eightMonthsPrice.toLocaleString("es-CL")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      ${(eightMonthsPrice / 8).toLocaleString("es-CL")}/mes
                    </span>
                    {savings8Months.savingsPercent > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Ahorra {savings8Months.savingsPercent}%
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Pago único por 8 meses
                </p>
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link href={`/courses/${id}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
    </motion.div>
  )
}
