import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// // Función helper para convertir BigInt a string
// function serializeBigInt(obj: any): any {
//   return JSON.parse(JSON.stringify(obj, (key, value) =>
//     typeof value === 'bigint' ? value.toString() : value
//   ));
// }

// GET: obtener todos los leads
export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      select: {
        id_lead: true,
        nombre: true,
        apellidos: true,
        estado: true,
        fecha_creacion: true,
        etapa: true,
        fuente: true,
        ultima_interaccion: true,
        notas: true,
        interes: true,
        cluster: true,
        colegio: true,
        precio_confirmado: true,
        canal_primero: true,
        canal_ultimo: true,
        contacto: {
          select: {
            segmento: true,
            distrito: true,
            telefono: true,
            correo: true
          }
        },
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
    const transformedLeads = leads.map((lead: any) => ({
      id: lead.id_lead,
      nombre: lead.nombre || '',
      apellidos: lead.apellidos || '',
      segmento: lead.contacto?.segmento || '',
      estado: lead.estado,
      distrito: lead.contacto?.distrito || '',
      telefono: lead.contacto?.telefono || '',
      correo: lead.contacto?.correo || '',
      etapa: lead.etapa,
      fuente: lead.fuente,
      ultima_interaccion: lead.ultima_interaccion,
      fecha_creacion: lead.fecha_creacion,
      notas: lead.notas,
      interes: lead.interes,
      cluster: lead.cluster,
      colegio: lead.colegio,
      precio_confirmado: lead.precio_confirmado,
      canal_primero: lead.canal_primero,
      canal_ultimo: lead.canal_ultimo,
      estado_accion_comercial: lead.accion_comercial?.[0]?.estado ?? null,
    }));

    const serializedLeads = transformedLeads;
    console.log('Fetched leads:', serializedLeads);
    return NextResponse.json(serializedLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST: crear un nuevo lead
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Convertir strings a BigInt para campos que lo requieren
    // if (data.id_sede) data.id_sede = BigInt(data.id_sede);
    // if (data.id_contacto) data.id_contacto = BigInt(data.id_contacto);
    
    const lead = await prisma.lead.create({ data });
    const serializedLead = lead;
    return NextResponse.json(serializedLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}