"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { adminCollectionInventory } from "@/data/admin-collections"

export function AdminCollectionInventory() {
  const collections = useMemo(() => adminCollectionInventory, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventario de Colecciones</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Las siguientes tablas de Supabase se utilizan en las vistas administrativas actuales.
        </p>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tabla</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Páginas</TableHead>
                <TableHead className="text-right">Operaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.table}>
                  <TableCell className="font-medium">{collection.table}</TableCell>
                  <TableCell className="max-w-lg text-sm text-muted-foreground">
                    {collection.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {collection.adminPages.map((page) => (
                        <Badge key={page} variant="outline" className="text-xs">
                          {page}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {collection.operations.map((operation) => (
                        <Badge key={operation} variant="secondary" className="text-xs capitalize">
                          {operation}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}