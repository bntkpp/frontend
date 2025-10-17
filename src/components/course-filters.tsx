"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface CourseFiltersProps {
  onLevelChange: (level: string) => void
  onSearchChange: (search: string) => void
}

export function CourseFilters({ onLevelChange, onSearchChange }: CourseFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="flex-1">
        <Label htmlFor="search" className="sr-only">
          Buscar cursos
        </Label>
        <Input
          id="search"
          placeholder="Buscar cursos..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="w-full md:w-48">
        <Label htmlFor="level" className="sr-only">
          Filtrar por nivel
        </Label>
        <Select onValueChange={onLevelChange}>
          <SelectTrigger id="level">
            <SelectValue placeholder="Todos los niveles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            <SelectItem value="beginner">Principiante</SelectItem>
            <SelectItem value="intermediate">Intermedio</SelectItem>
            <SelectItem value="advanced">Avanzado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
