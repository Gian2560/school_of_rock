// app/api/conversacion/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { adminAuth, adminDB } from "@/lib/firebaseAdmin";

type Params = { params: { id: string } };

// GET /api/conversacion/:id
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = params;

    // id puede ser id_contacto (número) o un celular +51...
    let celularFormatted = "";
    let contactoNombre = "";
    let contactoId: number | null = null;

    if (/^\d+$/.test(id)) {
      // Buscar por id_contacto
      const contacto = await prisma.contacto.findUnique({
        where: { id_contacto: parseInt(id, 10) },
        select: {
          id_contacto: true,
          nombres: true,
          apellidos: true,
          telefono: true,
        },
      });

      if (!contacto) {
        return NextResponse.json({ message: "Contacto no encontrado" }, { status: 404 });
      }

      contactoId = contacto.id_contacto;
      contactoNombre = `${contacto.nombres ?? ""} ${contacto.apellidos ?? ""}`.trim();
      celularFormatted = (contacto.telefono ?? "").trim();
      if (celularFormatted && !celularFormatted.startsWith("+51")) {
        celularFormatted = `+51${celularFormatted}`;
      }
    } else if (/^\+51\d+$/.test(id)) {
      // Buscar por celular directo
      celularFormatted = id;
      contactoNombre = "Contacto";
      contactoId = null;
    } else {
      return NextResponse.json({ message: "Formato de ID inválido" }, { status: 400 });
    }

    // Firestore: colección “fidelizacion”
    const telefonoSinMas = celularFormatted.startsWith("+")
      ? celularFormatted.slice(1)
      : celularFormatted;

    const celularesParaBuscar = [celularFormatted, telefonoSinMas];

    // NOTA: los filtros "in" requieren que el campo exista y haya índices
    const mensajesSnap = await adminDB
      .collection("sor")
      .where("celular", "in", celularesParaBuscar)
      .where("id_bot", "in", ["sorbot", "sor"])
      .get();

    const mensajes = mensajesSnap.docs.map((doc) => {
      const data = doc.data() as any;
      const fecha =
        data.fecha?._seconds != null
          ? new Date(data.fecha._seconds * 1000)
          : data.fecha instanceof Date
          ? data.fecha
          : null;

      return {
        id: doc.id,
        text: data.text ?? data.mensaje ?? "",
        sender: data.sender === true || data.sender === "true", // true = cliente? o bot?
        fecha,
      };
    });

    const conversaciones = mensajes
      .filter((m) => m.fecha !== null)
      .sort((a, b) => (a.fecha! > b.fecha! ? 1 : -1))
      .map((m) => ({
        id: m.id,
        text: m.text,
        // normalizamos: sender = true => “usuario”, false => “bot”
        from: m.sender ? "usuario" : "bot",
        fechaTexto: m.fecha!.toLocaleString("es-PE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

    return NextResponse.json({
      contacto: {
        id_contacto: contactoId,
        nombreCompleto: contactoNombre,
        celular: celularFormatted,
      },
      conversaciones,
    });
  } catch (err) {
    console.error("Error en GET /api/conversacion/:id", err);
    return NextResponse.json(
      { message: "Error interno al obtener conversaciones" },
      { status: 500 }
    );
  }
}
