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
        created_at,
        template_content_sid,
        parametro
      FROM template
      ORDER BY created_at DESC
    ` as any[]

    const templatesFormateados = templates.map((template: any) => ({
      id: template.id_template,
      name: template.nombre,
      message: template.mensaje,
      createdAt: template.created_at,
      hasParameters: template.parametro,
      contentSid: template.template_content_sid,
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
      template_content_sid = '',
      parametro = false
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
        template_content_sid,
        parametro,
        created_at
      )
      VALUES (
        ${nombre}, 
        ${mensaje}, 
        ${template_content_sid},
        ${parametro},
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