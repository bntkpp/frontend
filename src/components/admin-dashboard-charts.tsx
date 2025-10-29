"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Funnel, FunnelChart, LabelList, XAxis, YAxis } from "recharts"

interface RevenuePoint {
  period: string
  revenue: number
}

interface CoursePoint {
  course: string
  enrollments: number
}

interface FunnelPoint {
  stage: string
  value: number
}

interface AdminDashboardChartsProps {
  revenueSeries: RevenuePoint[]
  topCourses: CoursePoint[]
  funnelSeries: FunnelPoint[]
}

const revenueChartConfig = {
  revenue: {
    label: "Ingresos",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const courseChartConfig = {
  enrollments: {
    label: "Inscripciones",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const funnelChartConfig = {
  value: {
    label: "Participantes",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function AdminDashboardCharts({ revenueSeries, topCourses, funnelSeries }: AdminDashboardChartsProps) {
  const orderedCourses = useMemo(() => topCourses.slice(0, 8), [topCourses])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Ingresos por Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="h-64">
            <AreaChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={60} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.2} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Cursos más Inscritos</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={courseChartConfig} className="h-64">
            <BarChart data={orderedCourses}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="course" tickLine={false} axisLine={false} interval={0} angle={-10} textAnchor="end" height={80} />
              <YAxis tickLine={false} axisLine={false} width={50} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="enrollments" fill="var(--color-enrollments)">
                <LabelList dataKey="enrollments" position="top" className="text-xs" />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Embudo de Conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={funnelChartConfig} className="h-72">
            <FunnelChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="stage" />} />
              <Funnel dataKey="value" data={funnelSeries} isAnimationActive fill="var(--color-value)" nameKey="stage">
                <LabelList dataKey="stage" position="left" className="text-sm font-medium" />
                <LabelList dataKey="value" position="right" className="text-sm font-medium" />
              </Funnel>
            </FunnelChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}