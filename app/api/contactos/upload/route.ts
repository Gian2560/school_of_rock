import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import * as XLSX from 'xlsx'

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

// POST: Procesar archivo Excel y generar vista previa
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó archivo" },
        { status: 400 }
      )
    }

    // Verificar que sea un archivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: "El archivo debe ser de formato Excel (.xlsx o .xls)" },
        { status: 400 }
      )
    }

    console.log("📊 Procesando archivo Excel:", file.name)

    // Convertir archivo a buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Parsear Excel usando xlsx
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      console.log(`📋 Se encontraron ${jsonData.length} filas en el Excel`)

      // Mapear campos del Excel a campos de la base de datos
      const contactosPreview = jsonData.map((row: any, index: number) => {
        // Mapeo flexible de columnas (acepta diferentes variaciones)
        const mapField = (possibleNames: string[]) => {
          for (const name of possibleNames) {
            const value = row[name] || row[name.toLowerCase()] || row[name.toUpperCase()]
            if (value) return value
          }
          return null
        }

        return {
          fila: index + 2, // +2 porque Excel empieza en 1 y la primera es header
          nombres: mapField(['nombres', 'nombre', 'name', 'first_name']),
          apellidos: mapField(['apellidos', 'apellido', 'last_name', 'surname']),
          telefono: mapField(['telefono', 'celular', 'phone', 'movil']),
          correo: mapField(['correo', 'email', 'mail', 'e-mail']),
          distrito: mapField(['distrito', 'district', 'ubicacion', 'location']),
          segmento: mapField(['segmento', 'segment', 'categoria', 'category']),
          estado: mapField(['estado', 'status']) || 'activo',
          errors: [] as string[],
          warnings: [] as string[]
        }
      }).filter((contacto: any) => {
        // Filtrar filas vacías
        return contacto.nombres || contacto.telefono || contacto.correo
      })

      // Validar cada contacto
      const contactosValidados = contactosPreview.map((contacto: any) => {
        const errors: string[] = []
        const warnings: string[] = []

        // Validaciones obligatorias
        if (!contacto.nombres || contacto.nombres.trim() === '') {
          errors.push('Nombres es obligatorio')
        }

        if (!contacto.telefono || contacto.telefono.trim() === '') {
          errors.push('Teléfono es obligatorio')
        } else {
          // Validar formato de teléfono (básico)
          const telefono = contacto.telefono.toString().replace(/\D/g, '')
          if (telefono.length < 9) {
            errors.push('Teléfono debe tener al menos 9 dígitos')
          }
        }

        // Validaciones opcionales con warnings
        if (!contacto.correo || contacto.correo.trim() === '') {
          warnings.push('Email no proporcionado')
        } else {
          // Validar formato de email básico
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(contacto.correo)) {
            errors.push('Formato de email inválido')
          }
        }

        if (!contacto.distrito || contacto.distrito.trim() === '') {
          warnings.push('Distrito no proporcionado')
        }

        return {
          ...contacto,
          errors,
          warnings,
          valid: errors.length === 0
        }
      })

      // Verificar duplicados en el archivo
      const telefonos = new Set()
      const correos = new Set()
      
      contactosValidados.forEach((contacto: any) => {
        if (contacto.telefono) {
          const telefono = contacto.telefono.toString().replace(/\D/g, '')
          if (telefonos.has(telefono)) {
            contacto.warnings.push('Teléfono duplicado en el archivo')
          }
          telefonos.add(telefono)
        }

        if (contacto.correo) {
          if (correos.has(contacto.correo.toLowerCase())) {
            contacto.warnings.push('Email duplicado en el archivo')
          }
          correos.add(contacto.correo.toLowerCase())
        }
      })

      // Verificar duplicados en la base de datos
      const telefonosExistentes = await prisma.$queryRaw`
        SELECT telefono FROM contacto 
        WHERE telefono = ANY(${Array.from(telefonos).filter(t => t)})
      ` as any[]

      const correosExistentes = await prisma.$queryRaw`
        SELECT correo FROM contacto 
        WHERE correo = ANY(${Array.from(correos).filter(c => c)})
      ` as any[]

      const telefonosDB = new Set(telefonosExistentes.map(t => t.telefono))
      const correosDB = new Set(correosExistentes.map(c => c.correo))

      // Marcar duplicados con la base de datos
      contactosValidados.forEach((contacto: any) => {
        if (contacto.telefono) {
          const telefono = contacto.telefono.toString().replace(/\D/g, '')
          if (telefonosDB.has(telefono)) {
            contacto.warnings.push('Teléfono ya existe en la base de datos (se omitirá)')
            contacto.exists = true
          }
        }

        if (contacto.correo && correosDB.has(contacto.correo.toLowerCase())) {
          contacto.warnings.push('Email ya existe en la base de datos (se omitirá)')
          contacto.exists = true
        }
      })

      const resumen = {
        totalFilas: contactosValidados.length,
        validos: contactosValidados.filter(c => c.valid && !c.exists).length,
        conErrores: contactosValidados.filter(c => !c.valid).length,
        duplicados: contactosValidados.filter(c => c.exists).length,
        conWarnings: contactosValidados.filter(c => c.warnings.length > 0 && c.valid).length
      }

      console.log("📊 Resumen de procesamiento:", resumen)

      return NextResponse.json(serializeBigInt({
        success: true,
        contactos: contactosValidados,
        resumen,
        fileName: file.name
      }))

    } catch (parseError) {
      console.error("❌ Error al parsear Excel:", parseError)
      return NextResponse.json(
        { error: "Error al procesar el archivo Excel. Verifique el formato." },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("❌ Error al procesar archivo:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}