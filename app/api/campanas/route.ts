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

// GET: Obtener todas las campañas
export async function GET() {
  try {
    console.log("📋 Consultando campañas...")
    
    const campanas = await prisma.$queryRaw`
      SELECT 
        c.id_campanha,
        c.nombre_campanha,
        c.descripcion,
        c.fecha_creacion,
        c.estado_campanha,
        c.mensaje_cliente,
        c.fecha_inicio,
        c.fecha_fin,
        c.num_clientes,
        c.tipo,
        c.id_template,
        t.nombre as template_nombre,
        t.mensaje as template_mensaje
      FROM campanha c
      LEFT JOIN template t ON c.id_template = t.id_template
      ORDER BY c.fecha_creacion DESC
    ` as any[]

    // Contar clientes por campaña
    const campanasConStats = await Promise.all(
      campanas.map(async (campana: any) => {
        const stats = await prisma.$queryRaw`
          SELECT 
            COUNT(*) as total_destinatarios,
            COUNT(CASE WHEN estado_mensaje = 'enviado' THEN 1 END) as enviados,
            COUNT(CASE WHEN estado_mensaje = 'entregado' THEN 1 END) as entregados,
            COUNT(CASE WHEN estado_mensaje = 'leido' THEN 1 END) as leidos
          FROM cliente_campanha 
          WHERE id_campanha = ${campana.id_campanha}
        ` as any[]

        return {
          id: campana.id_campanha,
          name: campana.nombre_campanha,
          description: campana.descripcion,
          message: campana.mensaje_cliente || campana.template_mensaje,
          status: campana.estado_campanha,
          sentDate: campana.fecha_inicio ? new Date(campana.fecha_inicio).toISOString().split('T')[0] : null,
          recipients: parseInt(stats[0]?.total_destinatarios || '0'),
          responses: parseInt(stats[0]?.leidos || '0'),
          conversions: Math.floor(parseInt(stats[0]?.leidos || '0') * 0.3), // Estimación
          template: campana.id_template ? {
            id: campana.id_template,
            name: campana.template_nombre,
            message: campana.template_mensaje
          } : null,
          originalData: campana
        }
      })
    )

    console.log(`✅ Campañas formateadas: ${campanasConStats.length}`)
    return NextResponse.json(serializeBigInt(campanasConStats))

  } catch (error) {
    console.error("❌ Error al obtener campañas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST: Crear nueva campaña
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      nombre_campanha, 
      descripcion, 
      id_template,
      estado_campanha = 'activa',
      variable_mappings
    } = body

    // Validaciones
    if (!nombre_campanha) {
      return NextResponse.json(
        { error: "nombre_campanha es requerido" },
        { status: 400 }
      )
    }

    if (!id_template) {
      return NextResponse.json(
        { error: "id_template es requerido" },
        { status: 400 }
      )
    }

    console.log("📝 Creando campaña:", { nombre_campanha, descripcion, id_template, variable_mappings })

    // Crear la campaña usando Prisma para manejar JSON correctamente
    const nuevaCampana = await prisma.campanha.create({
      data: {
        nombre_campanha,
        descripcion: descripcion || null,
        id_template: parseInt(id_template),
        estado_campanha,
        variable_mappings: variable_mappings || {},
        fecha_creacion: new Date(),
        fecha_inicio: new Date(),
        tipo: 'out'
      },
      include: {
        template: true
      }
    })

    console.log("✅ Campaña creada:", nuevaCampana)

    return NextResponse.json(serializeBigInt({
      success: true,
      campana: nuevaCampana
    }))

  } catch (error) {
    console.error("❌ Error al crear campaña:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}