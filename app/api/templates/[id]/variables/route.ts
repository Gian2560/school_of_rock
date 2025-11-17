import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.template.findUnique({
      where: { id_template: parseInt(params.id) },
      select: { mensaje: true }
    })

    if (!template) {
      return NextResponse.json({ error: "Template no encontrado" }, { status: 404 })
    }

    // Extraer variables del formato {{1}}, {{2}}, etc.
    const regex = /\{\{(\d+)\}\}/g
    const matches = [...template.mensaje.matchAll(regex)]
    const variables = matches.map(m => parseInt(m[1])).sort((a, b) => a - b)

    return NextResponse.json({ 
      success: true,
      variables,
      count: variables.length
    })
  } catch (error) {
    console.error("Error obteniendo variables:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
