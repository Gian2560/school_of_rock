// app/api/contactos/nuevas/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helpers para logs bonitos
const fmt = (d: Date) => isNaN(d.getTime()) ? "Invalid Date" : d.toISOString();

export async function GET(req: Request) {
  const t0 = Date.now();
  try {
    const url = new URL(req.url);

    // --- Parámetros
    const page     = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(url.searchParams.get("pageSize") || "20", 10), 1), 100);
    const search   = (url.searchParams.get("search") || "").trim();

    const fechaInicioStr = url.searchParams.get("fechaInicio");
    const fechaFinStr    = url.searchParams.get("fechaFin");

    // --- Fallback a últimos 7 días si no vienen fechas
    let start: Date;
    let end: Date;

    if (fechaInicioStr && fechaFinStr) {
      start = new Date(fechaInicioStr);
      end   = new Date(fechaFinStr);
    } else {
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() - 7);
    }

    // Normalizar a inicio/fin del día (opcional, útil si envías YYYY-MM-DD desde el front)
    const startNorm = new Date(start);
    startNorm.setHours(0, 0, 0, 0);

    const endNorm = new Date(end);
    endNorm.setHours(23, 59, 59, 999);

    // Si el rango está invertido, lo corregimos
    if (startNorm > endNorm) {
      const tmp = startNorm;
      (startNorm as any) = endNorm;
      (endNorm as any)   = tmp;
    }

    // --- LOGS de entrada
    console.log("[/api/contactos/nuevas] query", {
      page, pageSize, search,
      fechaInicioStr, fechaFinStr,
      parsedStart: fmt(start), parsedEnd: fmt(end),
      usedStart: fmt(startNorm), usedEnd: fmt(endNorm),
    });

    // Validación final
    if (isNaN(startNorm.getTime()) || isNaN(endNorm.getTime())) {
      console.warn("[/api/contactos/nuevas] rango de fechas inválido", { startNorm: fmt(startNorm), endNorm: fmt(endNorm) });
      return NextResponse.json(
        { message: "Rango de fechas inválido" },
        { status: 400 }
      );
    }

    // --- WHERE (usar Date, no strings)
    const where: any = {
      AND: [
        // Eliminado: fecha_creacion: { lt: startNorm } - ahora muestra todos los que interactuaron en el rango
        {
          fecha_ultima_interaccion: {
            not: null,
            gte: startNorm,                         // dentro del período
            lte: endNorm,
          },
        },
      ],
    };

    if (search) {
      where.AND.push({
        OR: [
          { nombres:   { contains: search, mode: "insensitive" } },
          { apellidos: { contains: search, mode: "insensitive" } },
          { telefono:  { contains: search, mode: "insensitive" } },
          { correo:    { contains: search, mode: "insensitive" } },
        ],
      });
    }

    console.log("[/api/contactos/nuevas] where", JSON.stringify(where, null, 2));

    // --- Query
    const total = await prisma.contacto.count({ where });

    const contactos = await prisma.contacto.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [
        { fecha_ultima_interaccion: "desc" },
        { fecha_creacion: "desc" },
      ],
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
        fecha_ultima_interaccion: true,
        accion_comercial: {
          orderBy: { fecha_accion: "desc" },
          take: 1,
          select: { estado: true },
        },
      },
    });

    const payload = contactos.map((c) => ({
      id_contacto: c.id_contacto,
      rol_contacto: c.rol_contacto,
      nombres: c.nombres ?? "",
      apellidos: c.apellidos ?? "",
      segmento: c.segmento ?? "",
      estado: c.estado,
      distrito: c.distrito ?? "",
      telefono: c.telefono ?? "",
      correo: c.correo ?? "",
      fecha_creacion: c.fecha_creacion,
      fecha_ultima_interaccion: c.fecha_ultima_interaccion,
      estado_accion_comercial: c.accion_comercial?.[0]?.estado ?? null,
    }));

    const t1 = Date.now();
    console.log("[/api/contactos/nuevas] done", { total, returned: payload.length, elapsedMs: t1 - t0 });

    return NextResponse.json({ contactos: payload, total, page, pageSize });
  } catch (error: any) {
    console.error("GET /api/contactos/nuevas error:", error?.message || error, error?.stack);
    return NextResponse.json({ error: "Failed to fetch nuevas conversaciones" }, { status: 500 });
  }
}
