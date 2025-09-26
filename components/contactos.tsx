"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
// import { Toaster } from "@/components/ui/toaster"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  MessageCircle,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react"

import { useEffect } from "react"
function mapEtapaToStatus(etapa: string) {
  switch (etapa) {
    case 'nuevo':
      return 'Nuevo'
    case 'contactado':
      return 'Contactado'
    case 'llamada_agendada':
      return 'Visita agendada'
    case 'clase_prueba':
      return 'Clase de prueba'
    case 'seguimiento':
      return 'En seguimiento'
    case 'enrolado':
      return 'Enrolado'
    case 'no_interesado':
      return 'No interesado'
    default:
      return 'Nuevo'
  }
}
// Hook para obtener los leads desde la API
function useContactos() {
  const [contactos, setContactos] = useState<any[]>([]);
  const fetchContactos = () => {
    fetch("/api/contactos")
      .then((res) => res.json())
      .then((data) => {
        // Mapear los datos de la API al formato esperado por el componente
        const mappedContactos = data.map((contacto: any) => ({
          id_contacto: contacto.id_contacto,
          name: `${contacto.nombres} ${contacto.apellidos}`.trim(),
          segment: contacto.segmento || '',
            status: contacto.estado,
            district: contacto.distrito || '',
            phone: contacto.telefono || '',
            correo: contacto.correo || '',
            estado_accion_comercial: contacto.estado_accion_comercial || '',
            fecha_creacion: contacto.fecha_creacion,
          lastContact: new Date(contacto.fecha_creacion).toLocaleDateString('es-ES'),
          // Mantener datos originales para referencia
          originalData: contacto
        }))
        setContactos(mappedContactos);
      });
  };
  useEffect(fetchContactos, []);
  return { contactos, reload: fetchContactos };
  // const [contactos, setContactos] = useState<any[]>([])
  // useEffect(() => {
  //   fetch("/api/contactos")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       // Mapear los datos de la API al formato esperado por el componente
  //       const mappedContactos = data.map((contacto: any) => ({
  //         id_contacto: contacto.id_contacto,
  //         name: `${contacto.nombres} ${contacto.apellidos}`.trim(),
  //         segment: contacto.segmento || '',
  //           status: contacto.estado,
  //           district: contacto.distrito || '',
  //           phone: contacto.telefono || '',
  //           correo: contacto.correo || '',
  //           estado_accion_comercial: contacto.estado_accion_comercial || '',
  //           fecha_creacion: contacto.fecha_creacion,
  //         lastContact: new Date(contacto.fecha_creacion).toLocaleDateString('es-ES'),
  //         // Mantener datos originales para referencia
  //         originalData: contacto
  //       }))
  //       setContactos(mappedContactos)
  //     })
  // }, [])
  // console.log("Leads data:", contactos)
  // return contactos
}


export function Contactos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSegment, setFilterSegment] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const [callModalOpen, setCallModalOpen] = useState(false)
  const [visitModalOpen, setVisitModalOpen] = useState(false)
  const [creditModalOpen, setCreditModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [callNotes, setCallNotes] = useState("")
  const [callResult, setCallResult] = useState("")
  const [visitDate, setVisitDate] = useState("")
  const [visitTime, setVisitTime] = useState("")
  const [visitNotes, setVisitNotes] = useState("")
  const [creditScore, setCreditScore] = useState("")
  const [dni, setDni] = useState("")
  const [interestLevel, setInterestLevel] = useState("")

  const { toast } = useToast()

// ---- NUEVOS estados para conversación ----
  const [convOpen, setConvOpen] = useState(false)
  const [convLoading, setConvLoading] = useState(false)
  const [convError, setConvError] = useState<string | null>(null)
  const [convMsgs, setConvMsgs] = useState<
    { id: string; text: string; from: "bot" | "usuario"; fechaTexto: string }[]
  >([])

  const {contactos, reload} = useContactos()

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "C1":
        return "bg-accent text-accent-foreground"
      case "C2":
        return "bg-primary text-primary-foreground"
      case "C3":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nuevo":
        return "bg-blue-100 text-blue-800"
      case "Contactado":
        return "bg-yellow-100 text-yellow-800"
      case "Visita agendada":
        return "bg-green-100 text-green-800"
      case "Clase de prueba":
        return "bg-purple-100 text-purple-800"
      case "En seguimiento":
        return "bg-orange-100 text-orange-800"
      case "Enrolado":
        return "bg-emerald-100 text-emerald-800"
      case "No interesado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
}
const getStatusAsesorColor = (estado_accion_comercial: string) => {
    switch (estado_accion_comercial) {
      case "No contesta":
        return "bg-blue-100 text-blue-800"
      case "Volver a contactar":
        return "bg-yellow-100 text-yellow-800"
      case "Visita agendada":
        return "bg-green-100 text-green-800"
      case "Linea ocupada":
        return "bg-purple-100 text-purple-800"
      case "En seguimiento":
        return "bg-orange-100 text-orange-800"
      case "Enrolado":
        return "bg-emerald-100 text-emerald-800"
      case "No interesado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
}
    const filteredLeads = contactos.filter((lead) => {
      const matchesSearch =
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSegment = filterSegment === "all" || lead.segment === filterSegment
      return matchesSearch && matchesSegment
    })

  // ----- NUEVO: cargar conversación -----
  const openConversation = async (lead: any) => {
    setSelectedLead(lead)
    setConvOpen(true)
    setConvLoading(true)
    setConvError(null)
    setConvMsgs([])

    try {
      const res = await fetch(`/api/conversacion/${lead.id_contacto}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setConvMsgs(data.conversaciones ?? [])
    } catch (e: any) {
      setConvError("No se pudo cargar la conversación")
    } finally {
      setConvLoading(false)
    }
  }
    const saveVisit = async () => {
      if (!selectedLead) return;
      const fechaHora = `${visitDate}T${visitTime}:00-05:00`;
      try {
        const res = await fetch("/api/contactos/cita", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_contacto: selectedLead.id_contacto,
            fechaHora, // solo este campo
            notas: visitNotes,
          }),
        });
        reload();
        if (res.ok) {
          console.log("Toast disparado: cita agendada con éxito");
          toast({
            title: "Cita agendada con éxito",
            description: `La cita para ${selectedLead.name} fue registrada correctamente.`,
            variant: "success"
          });
        } else {
          console.log("Toast disparado: error al agendar cita");
          toast({
            title: "Error al agendar cita",
            description: "No se pudo registrar la cita. Intenta nuevamente.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.log("Toast disparado: error de red");
        toast({
          title: "Error de red",
          description: "No se pudo conectar con el servidor.",
          variant: "destructive"
        });
      }
      setVisitModalOpen(false);
      setSelectedLead(null);
      reload();
    }

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLeads = filteredLeads.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleCallAction = (lead: any) => {
    setSelectedLead(lead)
    setCallModalOpen(true)
    setCallNotes("")
    setCallResult("")
  }

  const handleVisitAction = (lead: any) => {
    setSelectedLead(lead)
    setVisitModalOpen(true)
    setVisitDate("")
    setVisitTime("")
    setVisitNotes("")
  }

  const handleCreditAction = (lead: any) => {
    setSelectedLead(lead)
    setCreditModalOpen(true)
    setCreditScore("")
    setDni("")
    setInterestLevel("")
  }

  const saveCall = () => {
    // Registrar acción comercial solo para ciertos resultados
    if (["No contesta", "Volver a contactar", "Linea ocupada", "No interesado"].includes(callResult)) {
      fetch("/api/contactos/accion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_contacto: selectedLead.id_contacto,
          estado: callResult,
          nota: callNotes,
        }),
      })
      .then(res => {
        reload();
        if (res.ok) {
          toast({
            title: "Acción comercial registrada",
            description: `La llamada (${callResult}) fue registrada correctamente.`,
            variant: "success"
          });
        } else {
          toast({
            title: "Error al registrar llamada",
            description: "No se pudo guardar la acción comercial.",
            variant: "destructive"
          });
        }
      })
      .catch(() => {
        toast({
          title: "Error de red",
          description: "No se pudo conectar con el servidor.",
          variant: "destructive"
        });
      });
    }
    setCallModalOpen(false);
    setSelectedLead(null);
    
  }

  const saveCredit = () => {
    // Aquí podrías hacer un POST a la API para guardar el score
    setCreditModalOpen(false)
    setSelectedLead(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contactos</h1>
          <p className="text-muted-foreground">Gestión de leads y conversaciones</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredLeads.length} contactos
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterSegment} onValueChange={setFilterSegment}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="C1">C1</SelectItem>
            <SelectItem value="C2">C2</SelectItem>
            <SelectItem value="C3">C3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contactos</CardTitle>
        </CardHeader>
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
                <TableHead>Último Contacto</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLeads.map((lead) => (
                <TableRow key={lead.id_contacto}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <Badge className={getSegmentColor(lead.segment)}>{lead.segment}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{lead.district}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusAsesorColor(lead.estado_accion_comercial)}>
                      {lead.estado_accion_comercial}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.lastContact}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* --- VER CONVERSACIÓN (API real) --- */}
                      <Dialog open={convOpen} onOpenChange={setConvOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => openConversation(lead)}>
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Conversación con {lead.name}</DialogTitle>
                          </DialogHeader>

                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {convLoading && <p className="text-sm text-muted-foreground">Cargando…</p>}
                            {convError && <p className="text-sm text-red-600">{convError}</p>}

                            {!convLoading && !convError && convMsgs.map((m) => {
                              const isUser = m.from === "usuario"; // sender=true => usuario (contacto)
                              return (
                                <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                  <div
                                    className={`max-w-[75%] rounded-lg px-3 py-2
                                      ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}
                                    `}
                                  >
                                    <p className="text-sm whitespace-pre-wrap">
                                      <strong className="mr-1">{isUser ? "Contacto" : "Bot"}:</strong>
                                      {m.text}
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

                      <Button size="sm" variant="outline" onClick={() => handleCallAction(lead)}>
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleVisitAction(lead)}>
                        <Calendar className="w-4 h-4" />
                      </Button>
                      {/* <Button size="sm" variant="outline" onClick={() => handleCreditAction(lead)}>
                        <FileText className="w-4 h-4" />
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredLeads.length)} de {filteredLeads.length} leads
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Comerciales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Visita agendada
            </Button>
            {/* <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserCheck className="w-4 h-4 mr-2" />
              Clase de prueba
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <UserCheck className="w-4 h-4 mr-2" />
              Enrolado
            </Button> */}
            <Button variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Volver a contactar
            </Button>
            <Button variant="destructive">
              <UserX className="w-4 h-4 mr-2" />
              No interesado
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={callModalOpen} onOpenChange={setCallModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Llamada - {selectedLead?.name}</DialogTitle>
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
            <DialogTitle>Agendar Visita - {selectedLead?.name}</DialogTitle>
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

      {/* <Dialog open={creditModalOpen} onOpenChange={setCreditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Variables - {selectedLead?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="credit-score">Score Crediticio</Label>
              <Input
                id="credit-score"
                type="number"
                placeholder="Ej: 750"
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value)}
                min="300"
                max="850"
              />
            </div>
            <div>
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                placeholder="Ej: 12345678"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                maxLength={8}
              />
            </div>
            <div>
              <Label htmlFor="interest-level">Nivel de Interés</Label>
              <Select value={interestLevel} onValueChange={setInterestLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nivel de interés" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muy-alto">Muy Alto</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="medio">Medio</SelectItem>
                  <SelectItem value="bajo">Bajo</SelectItem>
                  <SelectItem value="muy-bajo">Muy Bajo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCreditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveCredit} disabled={!creditScore || !dni || !interestLevel}>
                Guardar Variables
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}

    </div>
  )
}
