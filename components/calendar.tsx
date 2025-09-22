"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, User, Phone } from "lucide-react"

const appointmentsData = [
  {
    id: 1,
    title: "Visita - María González",
    type: "visit",
    time: "10:00 AM",
    duration: "1h",
    advisor: "Ana Martínez",
    leadName: "María González",
    segment: "C1",
    date: "2024-01-16",
    status: "confirmed",
  },
  {
    id: 2,
    title: "Llamada - Carlos Ruiz",
    type: "call",
    time: "3:00 PM",
    duration: "30min",
    advisor: "Ana Martínez",
    leadName: "Carlos Ruiz",
    segment: "C2",
    date: "2024-01-16",
    status: "pending",
  },
  {
    id: 3,
    title: "Clase de prueba - Ana López",
    type: "trial",
    time: "4:30 PM",
    duration: "1h",
    advisor: "Luis García",
    leadName: "Ana López",
    segment: "C1",
    date: "2024-01-17",
    status: "confirmed",
  },
  {
    id: 4,
    title: "Seguimiento - Pedro Martín",
    type: "follow-up",
    time: "11:00 AM",
    duration: "20min",
    advisor: "Ana Martínez",
    leadName: "Pedro Martín",
    segment: "C3",
    date: "2024-01-18",
    status: "pending",
  },
]

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 16)) // January 16, 2024
  const [view, setView] = useState("month")
  const [selectedAdvisor, setSelectedAdvisor] = useState("all")

  const getTypeColor = (type: string) => {
    switch (type) {
      case "visit":
        return "bg-green-100 text-green-800 border-green-200"
      case "call":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "trial":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "follow-up":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "visit":
        return <User className="w-4 h-4" />
      case "call":
        return <Phone className="w-4 h-4" />
      case "trial":
        return <CalendarIcon className="w-4 h-4" />
      case "follow-up":
        return <Clock className="w-4 h-4" />
      default:
        return <CalendarIcon className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const getAppointmentsForDate = (date: string) => {
    return appointmentsData.filter(
      (apt) => apt.date === date && (selectedAdvisor === "all" || apt.advisor === selectedAdvisor),
    )
  }

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const appointments = getAppointmentsForDate(dateString)
      const isToday = dateString === "2024-01-16"

      days.push(
        <div key={day} className={`h-24 border border-border p-1 ${isToday ? "bg-accent/10" : ""}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? "text-accent" : ""}`}>{day}</div>
          <div className="space-y-1">
            {appointments.slice(0, 2).map((apt) => (
              <div key={apt.id} className={`text-xs p-1 rounded truncate ${getTypeColor(apt.type)}`}>
                {apt.time} - {apt.leadName}
              </div>
            ))}
            {appointments.length > 2 && (
              <div className="text-xs text-muted-foreground">+{appointments.length - 2} más</div>
            )}
          </div>
        </div>,
      )
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-border">
        {daysOfWeek.map((day) => (
          <div key={day} className="p-2 bg-muted text-center font-medium text-sm border-b border-border">
            {day}
          </div>
        ))}
        {days}
      </div>
    )
  }

  const renderDayView = () => {
    const todayAppointments = getAppointmentsForDate("2024-01-16")

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Martes, 16 de Enero 2024</h3>
        {todayAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay citas programadas para hoy</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(apt.status)}`}></div>
                      {getTypeIcon(apt.type)}
                      <div>
                        <h4 className="font-medium">{apt.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {apt.time} - {apt.duration} | {apt.advisor}
                        </p>
                      </div>
                    </div>
                    <Badge className={getTypeColor(apt.type)}>{apt.segment}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendario</h1>
          <p className="text-muted-foreground">Gestión de citas y llamadas</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {appointmentsData.filter((apt) => apt.date === "2024-01-16").length} citas hoy
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-48 text-center">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Asesora" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Ana Martínez">Ana Martínez</SelectItem>
              <SelectItem value="Luis García">Luis García</SelectItem>
            </SelectContent>
          </Select>

          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Día</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Content */}
      <Card>
        <CardContent className="p-6">{view === "month" ? renderMonthView() : renderDayView()}</CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm">Visita al local</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="text-sm">Llamada</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-sm">Clase de prueba</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Seguimiento</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
