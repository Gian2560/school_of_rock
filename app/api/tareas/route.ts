import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Función helper para serializar BigInt
const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeBigInt(obj[key]);
    }
    return result;
  }
  return obj;
};

export async function GET() {
  try {
    console.log("🔍 Consultando tareas pendientes...")
    
    // Usar consulta SQL directa como alternativa
    const tareas = await prisma.$queryRaw`
      SELECT 
        t.id_tarea,
        t.id_contacto,
        t.estado_bot,
        t.fecha_creacion,
        t.fecha_actualizacion,
        t.estado_tarea,
        c.nombres,
        c.apellidos,
        c.telefono,
        c.correo,
        c.distrito,
        c.estado,
        c.segmento,
        c.prioridad,
        c.fecha_creacion as contacto_fecha_creacion,
        ac.estado as ultimo_estado_comercial,
        ac.fecha_accion as ultima_fecha_comercial
      FROM tarea t
      LEFT JOIN contacto c ON t.id_contacto = c.id_contacto
      LEFT JOIN (
        SELECT DISTINCT ON (id_tarea) 
          id_tarea, estado, fecha_accion
        FROM accion_comercial 
        WHERE id_tarea IS NOT NULL
        ORDER BY id_tarea, fecha_accion DESC
      ) ac ON t.id_tarea = ac.id_tarea
      WHERE t.estado_tarea = 'pendiente' OR t.estado_tarea IS NULL
      ORDER BY c.prioridad ASC NULLS LAST, t.fecha_creacion DESC
    ` as any[]

    console.log(`🔍 Tareas brutas desde DB: ${tareas.length}`)

    // Eliminar duplicados por contacto (mantener solo la tarea más reciente)
    const tareasUnicas = tareas.filter((tarea, index, array) => {
      return array.findIndex(t => t.id_contacto === tarea.id_contacto) === index;
    });

    console.log(`✂️ Después de eliminar duplicados: ${tareasUnicas.length}`)

    // Procesar y mapear los datos para el frontend
    const tareasFormateadas = tareasUnicas.map((tarea: any) => ({
      id: parseInt(tarea.id_tarea),
      id_contacto: parseInt(tarea.id_contacto),
      title: `Contactar a ${tarea.nombres} ${tarea.apellidos || ''}`.trim(),
      description: `Seguimiento de contacto - ${tarea.distrito || 'Sin distrito'}`,
      priority: getPriorityFromNumber(parseInt(tarea.prioridad)),
      leadName: `${tarea.nombres} ${tarea.apellidos || ''}`.trim(),
      segment: tarea.segmento || '',
      phone: tarea.telefono || '',
      district: tarea.distrito || '',
      email: tarea.correo || '',
      status_asesor: tarea.ultimo_estado_comercial || 'Sin contactar',
      dueDate: tarea.fecha_creacion ? new Date(tarea.fecha_creacion).toISOString().split('T')[0] : null,
      status: tarea.estado_tarea === 'pendiente' ? 'pending' : (tarea.estado_tarea === 'completado' ? 'completed' : 'pending'),
      type: 'call',
      lastContact: tarea.fecha_creacion ? new Date(tarea.fecha_creacion).toLocaleDateString('es-ES') : null,
      // Datos originales para referencia
      originalData: tarea
    }))

    console.log(`✅ Tareas formateadas: ${tareasFormateadas.length}`)
    console.log(tareasFormateadas)

    return NextResponse.json(serializeBigInt(tareasFormateadas))
  } catch (error) {
    console.error("❌ Error al obtener tareas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Función helper para convertir prioridad numérica a romana
function getPriorityFromNumber(prioridad: number | null): string {
  switch (prioridad) {
    case 1:
      return 'I'
    case 2:
      return 'II'
    case 3:
      return 'III'
    case 4:
      return 'IV'
    default:
      return 'IV' // Por defecto prioridad baja
  }
}