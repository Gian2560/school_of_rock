// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function GET(
//   _req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const id = Number(params.id);

//   // Trae los leads asociados via tabla puente lead_contacto
//   const rows = await prisma.lead_contacto.findMany({
//     where: { id_contacto: id },
//     include: {
//       lead: {
//         select: {
//           id_lead: true,
//           nombre: true,
//           apellidos: true,
//           etapa: true,
//           ultima_interaccion: true,
//         }
//       }
//     },
//     orderBy: { id_lead: 'desc' }
//   });

//   const hijos = rows.map(r => ({
//     id_lead: r.lead.id_lead,
//     nombre: r.lead.nombre ?? '',
//     apellidos: r.lead.apellidos ?? '',
//     etapa: r.lead.etapa,
//     ultima_interaccion: r.lead.ultima_interaccion,
//     relacion: r.relacion ?? null,
//   }));

//   return NextResponse.json(hijos);
// }

// export async function POST(
//   req: Request,
//   { params }: { params: { id_contacto: string } }
// ) {
//   const id = Number(params.id_contacto);
//   const body = await req.json(); // { nombre, apellidos, etapa? }
//   const { nombre, apellidos } = body;

//   // 1) Crear lead (el “hijo”)
//   const lead = await prisma.lead.create({
//     data: {
//       id_contacto: null,        // el contacto no es el propio alumno
//       etapa: "nuevo",
//       nombre,
//       apellidos,
//     }
//   });

//   // 2) Vincular en tabla puente
//   await prisma.lead_contacto.create({
//     data: {
//       id_lead: lead.id_lead,
//       id_contacto: id,
//       relacion: "hijo",        // opcional (puede ser “alumno / hijo / familiar”)
//     }
//   });

//   return NextResponse.json({ ok: true, id_lead: lead.id_lead });
// }

// app/api/contactos/[id]/hijos/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  const rows = await prisma.lead_contacto.findMany({
    where: { id_contacto: id },
    include: {
      lead: {
        select: {
          id_lead: true,
          nombre: true,
          apellidos: true,
          etapa: true,
          interes: true,
          ultima_interaccion: true,
          accion_comercial: {
            orderBy: { fecha_accion: "desc" },
            take: 1,
            select: { estado: true },
          },
        },
      },
    },
    orderBy: { id_lead: "desc" },
  });

  const hijos = rows.map((r) => ({
    id_lead: r.lead.id_lead,
    nombre: r.lead.nombre ?? "",
    apellidos: r.lead.apellidos ?? "",
    etapa: r.lead.etapa,                         // estado del lead
    interes: r.lead.interes ?? "",               // <- nuevo
    ultima_interaccion: r.lead.ultima_interaccion,
    estado_accion_comercial: r.lead.accion_comercial?.[0]?.estado ?? null, // <- nuevo
    relacion: r.relacion ?? null,
  }));

  return NextResponse.json(hijos);
}

// (el POST que crea hijo puede quedarse igual)
