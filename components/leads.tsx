"use client"

import { useState } from "react"
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
function useLeads() {
  const [leads, setLeads] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        // Mapear los datos de la API al formato esperado por el componente
        const mappedLeads = data.map((lead: any) => ({
          id: lead.id,
          name: `${lead.nombre} ${lead.apellidos}`.trim(),
          email: lead.correo || 'Sin email',
          segment: lead.segmento || 'C1',
          status: mapEtapaToStatus(lead.etapa),
          phone: lead.telefono || 'Sin teléfono',
          district: lead.distrito || 'Sin distrito',
          interest: lead.interes, // Puedes ajustar esto según tus datos
          lastContact: new Date(lead.ultima_interaccion || lead.fecha_creacion).toLocaleDateString('es-ES'),
          estado_accion_comercial: lead.estado_accion_comercial || '',
          // Mantener datos originales para referencia
          originalData: lead
        }))
        setLeads(mappedLeads)
      })
  }, [])
  console.log("Leads data:", leads)
  return leads
}


export function Leads() {
  // Toast para notificaciones
  // Si tienes un hook useToast, importa y úsalo aquí
  let toast: any = () => {};
  try {
    // @ts-ignore
    toast = require("@/hooks/use-toast").useToast().toast;
  } catch {}
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

  const leadsData = useLeads()

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
      // case "No contesta":
      //   return "bg-blue-100 text-blue-800"
      // case "Volver a contactar":
      //   return "bg-yellow-100 text-yellow-800"
      // case "Visita agendada":
      //   return "bg-green-100 text-green-800"
      case "Clase de prueba":
        return "bg-blue-500 text-white"
      // case "En seguimiento":
      //   return "bg-orange-100 text-orange-800"
      case "Enrolado":
        return "bg-orange-500 text-white"
      // case "No interesado":
      //   return "bg-red-100 text-red-800"
      // default:
      //   return "bg-gray-100 text-gray-800"
    }
}

  const filteredLeads = leadsData.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSegment = filterSegment === "all" || lead.segment === filterSegment
    return matchesSearch && matchesSegment
  })

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
    if (["Enrolado", "Clase de prueba"].includes(callResult)) {
      fetch("/api/leads/accion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_lead: selectedLead.id,
          estado: callResult,
          nota: callNotes,
        }),
      })
      .then(res => {
        if (res.ok) {
          toast({
            title: "Acción comercial registrada",
            description: 'La acción (${callResult}) fue registrada correctamente.',
            variant: "success"
          });
        } else {
          toast({
            title: "Error al registrar acción",
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

  const saveVisit = () => {
    // Aquí podrías hacer un POST a la API para guardar la visita
    setVisitModalOpen(false)
    setSelectedLead(null)
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
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">Gestión de leads y conversaciones</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredLeads.length} leads
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar leads..."
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
          <CardTitle>Lista de Leads</CardTitle>
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
                <TableHead>Interés</TableHead>
                <TableHead>Último Contacto</TableHead>
                <TableHead>Estado Asesor</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLeads.map((lead) => (
                <TableRow key={lead.id}>
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
                  <TableCell>{lead.interest}</TableCell>
                  <TableCell>{lead.lastContact}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusAsesorColor(lead.estado_accion_comercial)}>
                      {lead.estado_accion_comercial}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Conversación con {lead.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-sm">
                                <strong>Bot:</strong> ¡Hola! Soy el asistente de School of Rock Miraflores. ¿En qué te
                                puedo ayudar?
                              </p>
                              <span className="text-xs text-muted-foreground">14:30</span>
                            </div>
                            <div className="bg-accent/10 p-3 rounded-lg ml-8">
                              <p className="text-sm">
                                <strong>{lead.name}:</strong> Hola, me interesa información sobre clases de{" "}
                                {lead.interest.toLowerCase()}
                              </p>
                              <span className="text-xs text-muted-foreground">14:32</span>
                            </div>
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-sm">
                                <strong>Bot:</strong> ¡Excelente! Te puedo ayudar con eso. ¿Podrías decirme en qué
                                distrito vives?
                              </p>
                              <span className="text-xs text-muted-foreground">14:33</span>
                            </div>
                            <div className="bg-accent/10 p-3 rounded-lg ml-8">
                              <p className="text-sm">
                                <strong>{lead.name}:</strong> Vivo en {lead.district}
                              </p>
                              <span className="text-xs text-muted-foreground">14:35</span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog> */}
                      <Button size="sm" variant="outline" onClick={() => handleCallAction(lead)}>
                        <Phone className="w-4 h-4" />
                      </Button>
                      {/* <Button size="sm" variant="outline" onClick={() => handleVisitAction(lead)}>
                        <Calendar className="w-4 h-4" />
                      </Button> */}
                      <Button size="sm" variant="outline" onClick={() => handleCreditAction(lead)}>
                        <FileText className="w-4 h-4" />
                      </Button>
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
            {/* <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Visita agendada
            </Button> */}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserCheck className="w-4 h-4 mr-2" />
              Clase de prueba
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <UserCheck className="w-4 h-4 mr-2" />
              Enrolado
            </Button>
            {/* <Button variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Volver a contactar
            </Button>
            <Button variant="destructive">
              <UserX className="w-4 h-4 mr-2" />
              No interesado
            </Button> */}
          </div>
        </CardContent>
      </Card>

      <Dialog open={callModalOpen} onOpenChange={setCallModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Acción Comercial - {selectedLead?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="call-result">Resultado de la acción comercial</Label>
              <Select value={callResult} onValueChange={setCallResult}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enrolado">Enrolado</SelectItem>
                  <SelectItem value="Clase de prueba">Clase de prueba</SelectItem>
                  {/* <SelectItem value="ocupado">Línea ocupada</SelectItem>
                  <SelectItem value="interesado">Mostró interés</SelectItem>
                  <SelectItem value="no-interesado">No interesado</SelectItem>
                  <SelectItem value="reagendar">Solicita reagendar</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="call-notes">Notas</Label>
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
                Guardar Accion Comercial
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* <Dialog open={visitModalOpen} onOpenChange={setVisitModalOpen}>
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
      </Dialog> */}

      <Dialog open={creditModalOpen} onOpenChange={setCreditModalOpen}>
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
      </Dialog>

    </div>
  )
}
