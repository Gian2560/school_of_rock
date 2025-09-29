// // components/new-conversations.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Search, ChevronLeft, ChevronRight } from "lucide-react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// type Preset = "hoy" | "semana" | "mes" | "custom";

// function startOfToday() {
//   const d = new Date(); d.setHours(0,0,0,0); return d;
// }
// function endOfToday() {
//   const d = new Date(); d.setHours(23,59,59,999); return d;
// }
// function startOfWeek() {
//   const d = new Date(); // semana LUN-DOM (cambia si prefieres DOM-SAB)
//   const day = d.getDay(); // 0 dom, 1 lun, ...
//   const diff = (day === 0 ? 6 : day - 1); // mover a lunes
//   d.setDate(d.getDate() - diff);
//   d.setHours(0,0,0,0);
//   return d;
// }
// function endOfWeek() {
//   const s = startOfWeek();
//   const e = new Date(s); e.setDate(e.getDate() + 6); e.setHours(23,59,59,999); return e;
// }
// function startOfMonth() {
//   const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
//   d.setHours(0,0,0,0); return d;
// }
// function endOfMonth() {
//   const d = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0);
//   d.setHours(23,59,59,999); return d;
// }
// function toYMD(d: Date) {
//   // YYYY-MM-DD para inputs
//   const y = d.getFullYear();
//   const m = String(d.getMonth()+1).padStart(2,"0");
//   const day = String(d.getDate()).padStart(2,"0");
//   return `${y}-${m}-${day}`;
// }

// function useNuevasConversaciones(params: {
//   page: number;
//   pageSize: number;
//   search?: string;
//   fromISO?: string; // ISO completo 00:00:00.000
//   toISO?: string;   // ISO completo 23:59:59.999
// }) {
//   const [rows, setRows] = useState<any[]>([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const fetchRows = async () => {
//     setLoading(true);
//     try {
//       const qs = new URLSearchParams();
//       qs.set("page", String(params.page));
//       qs.set("pageSize", String(params.pageSize));
//       if (params.search) qs.set("search", params.search);
//       if (params.fromISO && params.toISO) {
//         qs.set("fechaInicio", params.fromISO);
//         qs.set("fechaFin", params.toISO);
//       }

//       const res = await fetch(`/api/contactos/nuevas?${qs.toString()}`, { cache: "no-store" });
//       const json = await res.json();

//       const mapped = (json.contactos || []).map((c: any) => {
//         const last = c.fecha_ultima_interaccion ?? c.fecha_creacion ?? null;
//         return {
//           id_contacto: c.id_contacto,
//           name: `${c.nombres ?? ""} ${c.apellidos ?? ""}`.trim(),
//           phone: c.telefono ?? "",
//           correo: c.correo ?? "",
//           segment: c.segmento ?? "",
//           status: c.estado ?? "",
//           district: c.distrito ?? "",
//           lastContact: last ? new Date(last).toLocaleString("es-PE") : "—",
//           estado_accion_comercial: c.estado_accion_comercial ?? "",
//         };
//       });

//       setRows(mapped);
//       setTotal(json.total ?? 0);
//     } catch {
//       setRows([]);
//       setTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchRows(); }, [
//     params.page,
//     params.pageSize,
//     params.search,
//     params.fromISO,
//     params.toISO
//   ]);

//   return { rows, total, loading, reload: fetchRows };
// }

// const getSegmentColor = (segment: string) => {
//   switch (segment) {
//     case "C1": return "bg-accent text-accent-foreground";
//     case "C2": return "bg-primary text-primary-foreground";
//     case "C3": return "bg-muted text-muted-foreground";
//     default:   return "bg-muted text-muted-foreground";
//   }
// };

// export default function NewConversations() {
//   const [search, setSearch] = useState("");
//   const [preset, setPreset] = useState<Preset>("hoy");

//   // inputs visibles solo en "custom"
//   const [from, setFrom] = useState<string>(""); // YYYY-MM-DD
//   const [to, setTo]     = useState<string>(""); // YYYY-MM-DD

//   // página
//   const [page, setPage]    = useState(1);
//   const [pageSize]         = useState(10);

//   // calcular rango según preset
//   const { fromISO, toISO } = useMemo(() => {
//     let s: Date, e: Date;

//     if (preset === "hoy") {
//       s = startOfToday(); e = endOfToday();
//     } else if (preset === "semana") {
//       s = startOfWeek(); e = endOfWeek();
//     } else if (preset === "mes") {
//       s = startOfMonth(); e = endOfMonth();
//     } else {
//       // custom: si no hay valores, no mandamos fechas y backend usará fallback (últimos 7 días)
//       if (!from || !to) return { fromISO: undefined, toISO: undefined };
//       s = new Date(`${from}T00:00:00`);
//       e = new Date(`${to}T23:59:59.999`);
//     }
//     return { fromISO: s.toISOString(), toISO: e.toISOString() };
//   }, [preset, from, to]);

//   // si el usuario cambia de preset a custom, precargo con hoy por UX
//   useEffect(() => {
//     if (preset === "custom" && !from && !to) {
//       const s = startOfToday(); const e = endOfToday();
//       setFrom(toYMD(s)); setTo(toYMD(e));
//     }
//   }, [preset]); // eslint-disable-line

//   const { rows, total, loading, reload } = useNuevasConversaciones({
//     page, pageSize, search, fromISO, toISO,
//   });

//   const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Nuevas conversaciones</h1>
//           <p className="text-muted-foreground">
//             Contactos con <strong>fecha_ultima_interaccion</strong> dentro del rango y creados antes del período.
//           </p>
//         </div>
//         <Badge variant="outline" className="text-sm">{total} contactos</Badge>
//       </div>

//       {/* Filtros */}
//       <div className="flex flex-wrap gap-4 items-end">
//         {/* search */}
//         <div className="relative flex-1 min-w-[220px] max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
//           <Input
//             placeholder="Buscar (nombre/correo/teléfono)…"
//             value={search}
//             onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//             className="pl-10"
//           />
//         </div>

//         {/* preset selector */}
//         <div className="min-w-[220px]">
//           <Label>Rango</Label>
//           <Select value={preset} onValueChange={(v) => { setPreset(v as Preset); setPage(1); }}>
//             <SelectTrigger>
//               <SelectValue placeholder="Rango" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="hoy">Hoy</SelectItem>
//               <SelectItem value="semana">Semana actual</SelectItem>
//               <SelectItem value="mes">Mes actual</SelectItem>
//               <SelectItem value="custom">Personalizado</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* fechas solo si custom */}
//         {preset === "custom" && (
//           <div className="flex items-end gap-2">
//             <div>
//               <Label htmlFor="from">Desde</Label>
//               <Input id="from" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
//             </div>
//             <div>
//               <Label htmlFor="to">Hasta</Label>
//               <Input id="to" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
//             </div>
//           </div>
//         )}

//         <Button
//           variant="outline"
//           onClick={() => {
//             setSearch("");
//             setPreset("hoy");
//             setFrom(""); setTo("");
//             setPage(1);
//             reload();
//           }}
//         >
//           Limpiar
//         </Button>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Resultados</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Nombre</TableHead>
//                 <TableHead>Segmento</TableHead>
//                 <TableHead>Estado</TableHead>
//                 <TableHead>Teléfono</TableHead>
//                 <TableHead>Distrito</TableHead>
//                 <TableHead>Último contacto</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {!loading && rows.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center text-muted-foreground">
//                     Sin resultados
//                   </TableCell>
//                 </TableRow>
//               )}
//               {rows.map((r) => (
//                 <TableRow key={r.id_contacto}>
//                   <TableCell className="font-medium">{r.name}</TableCell>
//                   <TableCell><Badge className={getSegmentColor(r.segment)}>{r.segment || "—"}</Badge></TableCell>
//                   <TableCell><Badge variant="outline">{r.status || "—"}</Badge></TableCell>
//                   <TableCell>{r.phone || "—"}</TableCell>
//                   <TableCell>{r.district || "—"}</TableCell>
//                   <TableCell>{r.lastContact}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           {/* Paginación */}
//           <div className="flex items-center justify-between mt-4">
//             <div className="text-sm text-muted-foreground">
//               Página {page} de {totalPages}
//             </div>
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={page === 1}
//               >
//                 <ChevronLeft className="w-4 h-4" /> Anterior
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages}
//               >
//                 Siguiente <ChevronRight className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



// components/new-conversations.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Search, ChevronLeft, ChevronRight, Filter, MessageCircle, Phone, Calendar, Users, Plus
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Preset = "hoy" | "semana" | "mes" | "custom";

function mapEtapaToStatus(etapa: string) {
  switch (etapa) {
    case "nuevo": return "Nuevo";
    case "contactado": return "Contactado";
    case "llamada_agendada": return "Visita agendada";
    case "clase_prueba": return "Clase de prueba";
    case "seguimiento": return "En seguimiento";
    case "enrolado": return "Enrolado";
    case "no_interesado": return "No interesado";
    default: return "Nuevo";
  }
}

function startOfToday(){ const d=new Date(); d.setHours(0,0,0,0); return d; }
function endOfToday(){ const d=new Date(); d.setHours(23,59,59,999); return d; }
function startOfWeek(){
  const d = new Date(); const day = d.getDay(); const diff = (day===0?6:day-1);
  d.setDate(d.getDate()-diff); d.setHours(0,0,0,0); return d;
}
function endOfWeek(){ const s = startOfWeek(); const e = new Date(s); e.setDate(e.getDate()+6); e.setHours(23,59,59,999); return e; }
function startOfMonth(){ const d=new Date(new Date().getFullYear(), new Date().getMonth(),1); d.setHours(0,0,0,0); return d; }
function endOfMonth(){ const d=new Date(new Date().getFullYear(), new Date().getMonth()+1,0); d.setHours(23,59,59,999); return d; }
function toYMD(d: Date){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

function useNuevasConversaciones(params: {
  page: number; pageSize: number; search?: string; fromISO?: string; toISO?: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(params.page));
      qs.set("pageSize", String(params.pageSize));
      if (params.search) qs.set("search", params.search);
      if (params.fromISO && params.toISO) {
        qs.set("fechaInicio", params.fromISO);
        qs.set("fechaFin", params.toISO);
      }

      const res = await fetch(`/api/contactos/nuevas?${qs.toString()}`, { cache: "no-store" });
      const json = await res.json();

      const mapped = (json.contactos || []).map((c: any) => {
        const last = c.fecha_ultima_interaccion ?? c.fecha_creacion ?? null;
        return {
          id_contacto: c.id_contacto,
          rol_contacto: c.rol_contacto,
          name: `${c.nombres ?? ""} ${c.apellidos ?? ""}`.trim(),
          phone: c.telefono ?? "",
          correo: c.correo ?? "",
          segment: c.segmento ?? "",
          status: c.estado ?? "",
          district: c.distrito ?? "",
          lastContact: last ? new Date(last).toLocaleString("es-PE") : "—",
          estado_accion_comercial: c.estado_accion_comercial ?? "",
          // para refrescar kids modal sin perder info original
          _raw: c,
        };
      });

      setRows(mapped);
      setTotal(json.total ?? 0);
    } catch {
      setRows([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, [params.page, params.pageSize, params.search, params.fromISO, params.toISO]);

  return { rows, total, loading, reload: fetchRows };
}

const getSegmentColor = (segment: string) => {
  switch (segment) {
    case "C1": return "bg-accent text-accent-foreground";
    case "C2": return "bg-primary text-primary-foreground";
    case "C3": return "bg-muted text-muted-foreground";
    default:   return "bg-muted text-muted-foreground";
  }
};
const getStatusColor = (status: string) => {
  switch (status) {
    case "Nuevo": return "bg-blue-100 text-blue-800";
    case "Llamada agendada": return "bg-yellow-100 text-yellow-800";
    case "Visita agendada": return "bg-green-100 text-green-800";
    case "Clase de prueba": return "bg-purple-100 text-purple-800";
    case "En seguimiento": return "bg-orange-100 text-orange-800";
    case "Enrolado": return "bg-emerald-100 text-emerald-800";
    case "No interesado": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};
const getStatusAsesorColor = (estado: string) => {
  switch (estado) {
    case "No contesta": return "bg-blue-100 text-blue-800";
    case "Volver a contactar": return "bg-yellow-100 text-yellow-800";
    case "Visita agendada": return "bg-green-100 text-green-800";
    case "Linea ocupada": return "bg-purple-100 text-purple-800";
    case "En seguimiento": return "bg-orange-100 text-orange-800";
    case "Enrolado": return "bg-emerald-100 text-emerald-800";
    case "No interesado": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function NewConversations() {
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState<Preset>("hoy");
  const [from, setFrom] = useState<string>(""); // YYYY-MM-DD (custom)
  const [to, setTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const { toast } = useToast();

  // acciones/modales (mismo patrón que contactos.tsx)
  const [convOpen, setConvOpen] = useState(false);
  const [convLoading, setConvLoading] = useState(false);
  const [convError, setConvError] = useState<string | null>(null);
  const [convMsgs, setConvMsgs] = useState<{ id: string; text: string; from: "bot" | "usuario"; fechaTexto: string }[]>([]);
  const [kidsOpen, setKidsOpen] = useState(false);
  const [kidsLoading, setKidsLoading] = useState(false);
  const [kids, setKids] = useState<any[]>([]);
  const [kidActionOpenFor, setKidActionOpenFor] = useState<number | null>(null);
  const [kidActionResult, setKidActionResult] = useState("");
  const [kidActionNotes, setKidActionNotes] = useState("");

  const [callModalOpen, setCallModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [callResult, setCallResult] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [selected, setSelected] = useState<any>(null);

  // rango de fechas según preset
  const { fromISO, toISO } = useMemo(() => {
    let s: Date, e: Date;
    if (preset === "hoy") { s = startOfToday(); e = endOfToday(); }
    else if (preset === "semana") { s = startOfWeek(); e = endOfWeek(); }
    else if (preset === "mes") { s = startOfMonth(); e = endOfMonth(); }
    else {
      if (!from || !to) return { fromISO: undefined, toISO: undefined };
      s = new Date(`${from}T00:00:00`); e = new Date(`${to}T23:59:59.999`);
    }
    return { fromISO: s.toISOString(), toISO: e.toISOString() };
  }, [preset, from, to]);

  useEffect(() => {
    if (preset === "custom" && !from && !to) {
      const s = startOfToday(), e = endOfToday();
      setFrom(toYMD(s)); setTo(toYMD(e));
    }
  }, [preset]); // init valores custom

  const { rows, total, loading, reload } = useNuevasConversaciones({ page, pageSize, search, fromISO, toISO });
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  // --- acciones (mismo flujo que contactos.tsx) ---
  const openConversation = async (row: any) => {
    setSelected(row);
    setConvOpen(true); setConvLoading(true); setConvError(null); setConvMsgs([]);
    try {
      const res = await fetch(`/api/conversacion/${row.id_contacto}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setConvMsgs(data.conversaciones ?? []);
    } catch {
      setConvError("No se pudo cargar la conversación");
    } finally {
      setConvLoading(false);
    }
  };

  const openKids = async (row: any) => {
    setSelected(row); setKidsOpen(true); setKidsLoading(true); setKids([]);
    try {
      const res = await fetch(`/api/contactos/${row.id_contacto}/hijos`, { cache: "no-store" });
      const data = await res.json();
      setKids(Array.isArray(data) ? data : []);
    } catch { setKids([]); } finally { setKidsLoading(false); }
  };

  const saveKidAction = async (id_lead: number) => {
    if (!kidActionResult) return;
    const res = await fetch("/api/leads/accion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_lead, estado: kidActionResult, nota: kidActionNotes || "" }),
    });
    if (res.ok) {
      toast({ title: "Acción comercial registrada" });
      if (selected) await openKids(selected);
      setKidActionOpenFor(null); setKidActionResult(""); setKidActionNotes("");
    } else {
      toast({ title: "No se pudo registrar la acción", variant: "destructive" });
    }
  };

  const handleCall = (row: any) => {
    setSelected(row); setCallModalOpen(true); setCallNotes(""); setCallResult("");
  };

  const handleVisit = (row: any) => {
    setSelected(row); setVisitModalOpen(true); setVisitDate(""); setVisitTime(""); setVisitNotes("");
  };

  const saveCall = async () => {
    if (!selected) return;
    if (["No contesta", "Volver a contactar", "Linea ocupada", "No interesado"].includes(callResult)) {
      try {
        const res = await fetch("/api/contactos/accion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_contacto: selected.id_contacto, estado: callResult, nota: callNotes }),
        });
        if (res.ok) {
          toast({ title: "Acción comercial registrada", description: `La llamada (${callResult}) fue registrada.` });
          reload();
        } else {
          toast({ title: "Error al registrar llamada", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error de red", variant: "destructive" });
      }
    }
    setCallModalOpen(false); setSelected(null);
  };

  const saveVisit = async () => {
    if (!selected) return;
    const fechaHora = `${visitDate}T${visitTime}:00-05:00`;
    try {
      const res = await fetch("/api/contactos/cita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_contacto: selected.id_contacto, fechaHora, notas: visitNotes }),
      });
      if (res.ok) {
        toast({ title: "Cita agendada con éxito" });
        reload();
      } else {
        toast({ title: "Error al agendar cita", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error de red", variant: "destructive" });
    }
    setVisitModalOpen(false); setSelected(null);
  };

  const getStatusAsesorHijoColor = (estado: string) => {
    switch (estado) {
      case "Clase de prueba": return "bg-blue-500 text-white";
      case "Enrolado": return "bg-orange-500 text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nuevas conversaciones</h1>
          <p className="text-muted-foreground">
            Contactos con <strong>fecha última de interaccion</strong> dentro del rango y creados antes del período.
          </p>
        </div>
        <Badge variant="outline" className="text-sm">{total} contactos</Badge>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar (nombre/correo/teléfono)…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>

        <div className="min-w-[220px]">
          <Label>Rango</Label>
          <Select value={preset} onValueChange={(v) => { setPreset(v as Preset); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Rango" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Semana actual</SelectItem>
              <SelectItem value="mes">Mes actual</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {preset === "custom" && (
          <div className="flex items-end gap-2">
            <div>
              <Label htmlFor="from">Desde</Label>
              <Input id="from" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </div>
            <div>
              <Label htmlFor="to">Hasta</Label>
              <Input id="to" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </div>
          </div>
        )}

        <Button variant="outline" onClick={() => {
          setSearch(""); setPreset("hoy"); setFrom(""); setTo(""); setPage(1); reload();
        }}>
          Limpiar
        </Button>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader><CardTitle>Resultados</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Distrito</TableHead>
                <TableHead>Estado asesor</TableHead>
                <TableHead>Último contacto</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">Sin resultados</TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id_contacto}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell><Badge className={getSegmentColor(r.segment)}>{r.segment || "—"}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={getStatusColor(r.status)}>{r.status || "—"}</Badge></TableCell>
                  <TableCell>{r.phone || "—"}</TableCell>
                  <TableCell>{r.district || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusAsesorColor(r.estado_accion_comercial)}>
                      {r.estado_accion_comercial || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.lastContact}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* Conversación */}
                      <Dialog open={convOpen} onOpenChange={setConvOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => openConversation(r)}>
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader><DialogTitle>Conversación con {selected?.name}</DialogTitle></DialogHeader>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {convLoading && <p className="text-sm text-muted-foreground">Cargando…</p>}
                            {convError && <p className="text-sm text-red-600">{convError}</p>}
                            {!convLoading && !convError && convMsgs.map(m => {
                              const isUser = m.from === "usuario";
                              return (
                                <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                  <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                                    <p className="text-sm whitespace-pre-wrap">
                                      <strong className="mr-1">{isUser ? "Contacto" : "Bot"}:</strong>{m.text}
                                    </p>
                                    <span className={`block mt-1 text-[10px] opacity-70 ${isUser ? "text-primary-foreground" : "text-muted-foreground"}`}>
                                      {m.fechaTexto}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                            {!convLoading && !convError && convMsgs.length === 0 && (
                              <p className="text-sm text-muted-foreground">Sin mensajes.</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Llamada */}
                      <Button size="sm" variant="outline" onClick={() => handleCall(r)}>
                        <Phone className="w-4 h-4" />
                      </Button>

                      {/* Visita */}
                      <Button size="sm" variant="outline" onClick={() => handleVisit(r)}>
                        <Calendar className="w-4 h-4" />
                      </Button>

                      {/* Hijos / Beneficiarios (si no es estudiante) */}
                      {r.rol_contacto !== "estudiante" && (
                        <Dialog open={kidsOpen} onOpenChange={setKidsOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => openKids(r)}>
                              <Users className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] sm:max-w-[1100px] max-h-[85vh] overflow-hidden">
                            <DialogHeader><DialogTitle>Beneficiarios de {selected?.name}</DialogTitle></DialogHeader>

                            {/* Lista de hijos */}
                            {kidsLoading ? (
                              <p className="text-sm text-muted-foreground">Cargando…</p>
                            ) : kids.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Sin hijos registrados.</p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Interés</TableHead>
                                    <TableHead>Estado asesor</TableHead>
                                    <TableHead>Última interacción</TableHead>
                                    <TableHead className="text-right">Acción</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {kids.map((k: any) => {
                                    const nombreCompleto = (k.nombre + " " + (k.apellidos || "")).trim();
                                    const isOpen = kidActionOpenFor === k.id_lead;
                                    return (
                                      <TableRow key={k.id_lead}>
                                        <TableCell className="font-medium">{nombreCompleto}</TableCell>
                                        <TableCell><Badge variant="outline">{mapEtapaToStatus(k.etapa)}</Badge></TableCell>
                                        <TableCell>{k.interes || "—"}</TableCell>
                                        <TableCell>
                                          {k.estado_accion_comercial ? (
                                            <Badge variant="outline" className={getStatusAsesorHijoColor(k.estado_accion_comercial)}>
                                              {k.estado_accion_comercial}
                                            </Badge>
                                          ) : <span className="text-muted-foreground">—</span>}
                                        </TableCell>
                                        <TableCell>
                                          {k.ultima_interaccion ? new Date(k.ultima_interaccion).toLocaleDateString("es-ES") : "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {!isOpen ? (
                                            <Button size="sm" variant="outline" onClick={() => setKidActionOpenFor(k.id_lead)}>
                                              Registrar acción
                                            </Button>
                                          ) : (
                                            <div className="flex items-center gap-2 justify-end">
                                              <Select value={kidActionResult} onValueChange={setKidActionResult}>
                                                <SelectTrigger className="w-40"><SelectValue placeholder="Resultado" /></SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="Clase de prueba">Clase de prueba</SelectItem>
                                                  <SelectItem value="Enrolado">Enrolado</SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <Input placeholder="Notas" className="w-48" value={kidActionNotes} onChange={(e) => setKidActionNotes(e.target.value)} />
                                              <Button size="sm" onClick={() => saveKidAction(k.id_lead)} disabled={!kidActionResult}>Guardar</Button>
                                              <Button size="sm" variant="ghost" onClick={() => { setKidActionOpenFor(null); setKidActionResult(""); setKidActionNotes(""); }}>Cancelar</Button>
                                            </div>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">Página {page} de {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

<Dialog open={callModalOpen} onOpenChange={setCallModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Llamada - {selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="call-result">Resultado de la llamada</Label>
              <Select value={callResult} onValueChange={setCallResult}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar resultado" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="contactado">Contactado exitosamente</SelectItem> */}
                  {/* <SelectItem value="No contesta">No contesta</SelectItem>
                  <SelectItem value="Linea ocupada">Línea ocupada</SelectItem> */}
                  <SelectItem value="Volver a contactar">Volver a contactar</SelectItem>
                  <SelectItem value="No interesado">No interesado</SelectItem>
                  {/* <SelectItem value="reagendar">Solicita reagendar</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="call-notes">Notas de la llamada</Label>
              <Textarea
                id="call-notes"
                placeholder="Escribe las notas de la conversación..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCallModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveCall} disabled={!callResult}>
                Guardar Llamada
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={visitModalOpen} onOpenChange={setVisitModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Visita - {selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visit-date">Fecha</Label>
                <Input id="visit-date" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="visit-time">Hora</Label>
                <Select value={visitTime} onValueChange={setVisitTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="14:00">02:00 PM</SelectItem>
                    <SelectItem value="15:00">03:00 PM</SelectItem>
                    <SelectItem value="16:00">04:00 PM</SelectItem>
                    <SelectItem value="17:00">05:00 PM</SelectItem>
                    <SelectItem value="18:00">06:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="visit-notes">Notas adicionales</Label>
              <Textarea
                id="visit-notes"
                placeholder="Información adicional sobre la visita..."
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setVisitModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveVisit} disabled={!visitDate || !visitTime}>
                Agendar Visita
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
