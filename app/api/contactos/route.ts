import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función helper para convertir BigInt a string
// function serializeBigInt(obj: any): any {
//   return JSON.parse(JSON.stringify(obj, (key, value) =>
//     typeof value === 'bigint' ? value.toString() : value
//   ));
// }

// GET: obtener todos los leads
export async function GET() {
  try {
    const contactos = await prisma.contacto.findMany({
      select: {
        id_contacto: true,
        rol_contacto: true, 
        nombres: true,
        apellidos: true,
        telefono: true,
        correo: true,
        segmento: true, 
        distrito: true,
        estado: true,
        fecha_creacion: true,
        accion_comercial: {
          orderBy: { fecha_accion: 'desc' },
          take: 1,
          select: { estado: true }
        }
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });

    // Transformar los datos al formato esperado por el frontend
    const transformedContactos = contactos.map((contacto: any) => ({
      id_contacto: contacto.id_contacto,
      rol_contacto: contacto.rol_contacto,
      nombres: contacto.nombres || '',
      apellidos: contacto.apellidos || '',
      segmento: contacto.segmento || '',
      estado: contacto.estado,
      distrito: contacto.distrito || '',
      telefono: contacto.telefono || '',
      correo: contacto.correo || '',
      fecha_creacion: contacto.fecha_creacion,
      estado_accion_comercial: contacto.accion_comercial?.[0]?.estado ?? null,
    }));

    const serializedContactos = transformedContactos;
    console.log('Fetched contactos:', serializedContactos);
    return NextResponse.json(serializedContactos);
  } catch (error) {
    console.error('Error fetching contactos:', error);
    return NextResponse.json({ error: 'Failed to fetch contactos' }, { status: 500 });
  }
}

// POST: crear un nuevo lead
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Convertir strings a BigInt para campos que lo requieren
    // if (data.id_sede) data.id_sede = BigInt(data.id_sede);
    // if (data.id_contacto) data.id_contacto = BigInt(data.id_contacto);
    
    const contacto = await prisma.contacto.create({ data });
    const serializedContacto = contacto;
    return NextResponse.json(serializedContacto);
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}