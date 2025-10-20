import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type AdvisorRow = {
  asesor_id: number;
  nombres: string;
  apellidos: string | null;
  llamadas: number;
  enrolados: number;
};

export async function GET() {
  try {
    // Obtener la última acción por contacto o por lead (considerando ambos)
    //
    // Atribuimos la última acción al asesor que la realizó y luego agrupamos por asesor
    const rows: AdvisorRow[] = await prisma.$queryRaw`
      WITH last_actions AS (
        SELECT DISTINCT ON (COALESCE(id_contacto::text, 'lead_'||id_lead::text))
          COALESCE(id_contacto, NULL) AS id_contacto,
          COALESCE(id_lead, NULL) AS id_lead,
          asesor_id,
          estado,
          fecha_accion
        FROM accion_comercial
        WHERE asesor_id IS NOT NULL
        ORDER BY COALESCE(id_contacto::text, 'lead_'||id_lead::text), fecha_accion DESC
      )
      SELECT p.id_persona as asesor_id, p.nombres, p.apellidos,
        COUNT(*) FILTER (WHERE la.estado ILIKE 'Enrolado') as enrolados,
        COUNT(*) FILTER (WHERE la.estado NOT ILIKE 'Enrolado') as llamadas
      FROM persona p
      JOIN usuario u ON u.id_usuario = p.id_usuario AND u.id_rol = 2
      LEFT JOIN last_actions la ON la.asesor_id = p.id_persona
      GROUP BY p.id_persona, p.nombres, p.apellidos
      ORDER BY llamadas DESC NULLS LAST;
    `;

    // Normalizar nombres y devolver
    const advisors = rows.map((r) => ({
      id: r.asesor_id,
      name: `${r.nombres}${r.apellidos ? " " + r.apellidos : ""}`,
      llamadas: Number(r.llamadas ?? 0),
      enrolados: Number(r.enrolados ?? 0),
    }));

    return NextResponse.json({ advisors }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Advisors API error:", err);
    return NextResponse.json({ error: "No se pudo obtener los asesores" }, { status: 500 });
  }
}
