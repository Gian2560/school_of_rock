import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET: Obtener estadísticas de tareas completadas por prioridad
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const range = (searchParams.get("range") ?? "today").toLowerCase()
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    // Construir filtro de fecha similar al endpoint principal
    let whereDate = ""
    if (range === "today") {
      whereDate = ` AND t.fecha_creacion >= CURRENT_DATE AND t.fecha_creacion < (CURRENT_DATE + INTERVAL '1 day')`
    } else if (range === "week") {
      whereDate = ` AND t.fecha_creacion >= date_trunc('week', CURRENT_DATE) AND t.fecha_creacion < (date_trunc('week', CURRENT_DATE) + INTERVAL '1 week')`
    } else if (range === "month") {
      whereDate = ` AND t.fecha_creacion >= date_trunc('month', CURRENT_DATE) AND t.fecha_creacion < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')`
    } else if (range === "custom" && start && end) {
      whereDate = ` AND t.fecha_creacion >= '${start}'::date AND t.fecha_creacion < ('${end}'::date + INTERVAL '1 day')`
    }

    const sql = `
      SELECT 
        c.prioridad,
        COUNT(DISTINCT CASE WHEN t.estado_tarea = 'completado' THEN t.id_tarea END) as completadas,
        COUNT(DISTINCT CASE WHEN (t.estado_tarea = 'pendiente' OR t.estado_tarea IS NULL) THEN t.id_tarea END) as pendientes
      FROM tarea t
      INNER JOIN contacto c ON t.id_contacto = c.id_contacto
      WHERE 1=1 ${whereDate}
      GROUP BY c.prioridad
      ORDER BY c.prioridad ASC
    `

    const stats = await prisma.$queryRawUnsafe(sql) as any[]

    // Convertir BigInt a number
    const formattedStats = stats.map(stat => ({
      prioridad: stat.prioridad,
      completadas: Number(stat.completadas),
      pendientes: Number(stat.pendientes),
      total: Number(stat.completadas) + Number(stat.pendientes)
    }))

    // Asegurar que todas las prioridades existan
    const allPriorities = [1, 2, 3, 4]
    const result = allPriorities.map(priority => {
      const found = formattedStats.find(s => s.prioridad === priority)
      return found || {
        prioridad: priority,
        completadas: 0,
        pendientes: 0,
        total: 0
      }
    })

    return NextResponse.json({
      success: true,
      stats: result
    })

  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
