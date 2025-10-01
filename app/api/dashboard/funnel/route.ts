import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type FunnelPayload = {
  leadsNuevo: number;
  llamadasAgendadas: number;
  enrolados: number;
  eficienciaBot: number;     // llamadas/leads
  eficienciaAsesor: number;  // enrolados/llamadas
};

export async function GET() {
  try {
    // 1) Leads (contactos con estado = "nuevo")
    const leadsNuevo = await prisma.contacto.count({
      where: { estado: { equals: "Nuevo", mode: "insensitive" } },
    });

    // 2) Llamadas agendadas (contactos con estado = "llamada_agendada")
    //    Consideramos también el typo "lamada_agendada"
    const llamadasAgendadas = await prisma.contacto.count({
      where: {
        OR: [
          { estado: { equals: "llamada_agendada", mode: "insensitive" } },
          { estado: { equals: "lamada_agendada", mode: "insensitive" } }, // por si acaso
        ],
      },
    });

    // 3) Enrolados (leads cuya ÚLTIMA accion_comercial tiene estado = "enrolado")
    //    Cargamos la última acción por lead y filtramos en memoria.
    const leadsConUltimaAccion = await prisma.lead.findMany({
      select: {
        id_lead: true,
        accion_comercial: {
          select: { estado: true, fecha_accion: true },
          orderBy: { fecha_accion: "desc" },
          take: 1,
        },
      },
    });

    const enrolados = leadsConUltimaAccion.reduce((acc, l) => {
      const last = l.accion_comercial[0];
      if (last && last.estado && last.estado.toLowerCase() === "Enrolado") {
        return acc + 1;
      }
      return acc;
    }, 0);

    const eficienciaBot =
      leadsNuevo > 0 ? Math.round((llamadasAgendadas / leadsNuevo) * 100) : 0;

    const eficienciaAsesor =
      llamadasAgendadas > 0
        ? Math.round((enrolados / llamadasAgendadas) * 100)
        : 0;

    const payload: FunnelPayload = {
      leadsNuevo,
      llamadasAgendadas,
      enrolados,
      eficienciaBot,
      eficienciaAsesor,
    };

    // evita cachear en prod
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("Funnel API error:", err);
    return NextResponse.json(
      { error: "No se pudo calcular el embudo" },
      { status: 500 }
    );
  }
}
