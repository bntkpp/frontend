"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface RevenuePoint {
  period: string
  revenue: number
}

interface CoursePoint {
  course: string
  enrollments: number
}

interface AdminDashboardChartsProps {
  revenueSeries: RevenuePoint[]
  topCourses: CoursePoint[]
}

export function AdminDashboardCharts({
  revenueSeries,
  topCourses,
}: AdminDashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <Card className="border-2 hover:border-primary/20 transition-colors">
        <CardHeader className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600"></div>
            Ingresos por Mes
          </CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueSeries}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="period" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '2px solid rgb(245, 158, 11)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                }}
                formatter={(value: number) => [`$${value.toLocaleString('es-CL')}`, 'Ingresos']}
                cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
              />
              <Bar 
                dataKey="revenue" 
                fill="url(#revenueGradient)" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Courses Chart */}
      <Card className="border-2 hover:border-primary/20 transition-colors">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
            Cursos Más Populares
          </CardTitle>
          <CardDescription>Por número de inscripciones</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCourses} layout="vertical">
              <defs>
                <linearGradient id="coursesGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#9333ea" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <XAxis 
                type="number"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                dataKey="course" 
                type="category" 
                width={150}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '2px solid rgb(168, 85, 247)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)'
                }}
                formatter={(value: number) => [value, 'Inscripciones']}
                cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
              />
              <Bar 
                dataKey="enrollments" 
                fill="url(#coursesGradient)" 
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}