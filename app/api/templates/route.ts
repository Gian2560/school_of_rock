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

// GET: Obtener todos los templates
export async function GET() {
  try {
    console.log("📋 Consultando templates...")
    
    const templates = await prisma.$queryRaw`
      SELECT 
        id_template,
        nombre,
        mensaje,
        nombre_meta,
        meta_id,
        estado_meta,
        categoria,
        idioma,
        header,
        footer,
        created_at,
        updated_at
      FROM template
      ORDER BY created_at DESC
    ` as any[]

    const templatesFormateados = templates.map((template: any) => ({
      id: template.id_template,
      name: template.nombre,
      message: template.mensaje,
      metaName: template.nombre_meta,
      metaId: template.meta_id,
      metaStatus: template.estado_meta,
      category: template.categoria,
      language: template.idioma,
      header: template.header,
      footer: template.footer,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      originalData: template
    }))

    console.log(`✅ Templates formateados: ${templatesFormateados.length}`)
    return NextResponse.json(serializeBigInt(templatesFormateados))

  } catch (error) {
    console.error("❌ Error al obtener templates:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo template
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      nombre, 
      mensaje, 
      nombre_meta = null,
      meta_id = null,
      estado_meta = 'PENDING',
      categoria = 'MARKETING',
      idioma = 'es',
      header = null,
      footer = null
    } = body

    // Validaciones
    if (!nombre) {
      return NextResponse.json(
        { error: "nombre es requerido" },
        { status: 400 }
      )
    }

    if (!mensaje) {
      return NextResponse.json(
        { error: "mensaje es requerido" },
        { status: 400 }
      )
    }

    console.log("📝 Creando template:", { nombre, mensaje })

    // Crear el template
    const nuevoTemplate = await prisma.$queryRaw`
      INSERT INTO template (
        nombre, 
        mensaje, 
        nombre_meta,
        meta_id,
        estado_meta,
        categoria,
        idioma,
        header,
        footer,
        created_at,
        updated_at
      )
      VALUES (
        ${nombre}, 
        ${mensaje}, 
        ${nombre_meta},
        ${meta_id},
        ${estado_meta},
        ${categoria},
        ${idioma},
        ${header},
        ${footer},
        NOW(),
        NOW()
      )
      RETURNING *
    ` as any[]

    console.log("✅ Template creado:", nuevoTemplate[0])

    return NextResponse.json(serializeBigInt({
      success: true,
      template: nuevoTemplate[0]
    }))

  } catch (error) {
    console.error("❌ Error al crear template:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}