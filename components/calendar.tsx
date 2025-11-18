"use client"

import { useEffect,useMemo,useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, User, Phone } from "lucide-react"

type Cita = {
  id_cita: number;
  fecha_programada: string;
  contacto?: {
    nombres?: string;
    apellidos?: string;
    segmento?: string;
  };
};
type Advisor = { id_persona: number; nombres: string; apellidos: string };

function useCitas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  useEffect(() => {
    fetch("/api/citas")
      .then(res => res.json())
      .then(setCitas);
  }, []);
  return citas;
}


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
  // Semana: primer día de la semana actual (domingo)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0,0,0,0)
    return d
  }
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()))
  const renderWeekView = () => {
    // Días de la semana actual
    const days = []
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(currentWeekStart)
      dayDate.setDate(currentWeekStart.getDate() + i)
      const dayString = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}`
      const appointments = getAppointmentsForDate(dayString)
      const dayLabel = dayDate.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })
      days.push(
        <div key={dayString} className="flex-1 min-w-0 border border-border h-32 p-2">
          <div className="text-xs font-semibold mb-1">{dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}</div>
          <div className="space-y-1">
            {appointments.length === 0 ? (
              <div className="text-xs text-muted-foreground">Sin citas</div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id_cita} className={`text-xs p-1 rounded flex items-center gap-1 ${getTypeColor(apt.type)}`}>
                  {apt.type === "visit" && <User className="w-3 h-3 inline-block" />}
                  <span>{apt.time} - {apt.leadName}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )
    }
    // Semana label
    const weekLabel = `${daysOfWeek[0]}, ${currentWeekStart.getDate()} ${months[currentWeekStart.getMonth()]} ${currentWeekStart.getFullYear()} - ${daysOfWeek[6]}, ${new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() + 6).getDate()} ${months[new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() + 6).getMonth()]} ${new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() + 6).getFullYear()}`
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Semana: {weekLabel}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(getStartOfWeek(new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() - 7)))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(getStartOfWeek(new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() + 7)))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-0 w-full">
          {days}
        </div>
      </div>
    )
  }
  const [currentDate, setCurrentDate] = useState(new Date()) // Mes y año actual por defecto
  const [view, setView] = useState("month")
  const [currentDay, setCurrentDay] = useState(new Date()) // Día actual para la vista diaria
  const [citas, setCitas] = useState<Cita[]>([]);




  // Cargar todas las citas
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/citas");
      if (!r.ok) return;
      const json = await r.json();
      setCitas(json);
    })();
  }, []);

  // Mapea las citas al formato que usa el calendario
  // const appointmentsData = citas.map(cita => {
  //   const fecha = new Date(cita.fecha_programada);
  //   return {
  //     id_cita: cita.id_cita,
  //     title: `Visita - ${cita.contacto?.nombres ?? ""} ${cita.contacto?.apellidos ?? ""}`,
  //     type: "visit",
  //     time: fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "America/Lima" }),
  //     date: fecha.toISOString().slice(0, 10), // yyyy-mm-dd
  //     leadName: `${cita.contacto?.nombres ?? ""} ${cita.contacto?.apellidos ?? ""}`,
  //     segment: cita.contacto?.segmento ?? "",
  //     status: "confirmed",
  //   };
  // });
  // Mapea citas para el calendario
  const appointmentsData = useMemo(() => {
    return citas.map((cita) => {
      const fecha = new Date(cita.fecha_programada);
      return {
        id_cita: cita.id_cita,
        title: `Visita - ${cita.contacto?.nombres ?? ""} ${cita.contacto?.apellidos ?? ""}`,
        type: "visit",
        time: fecha.toLocaleTimeString("es-PE", {
          hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "America/Lima" ,
        }),
        // date: new Intl.DateTimeFormat("en-CA", {
        //   timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
        // }).format(fecha), // "YYYY-MM-DD" en Lima
        date: fecha.toISOString().slice(0, 10), // yyyy-mm-dd
        leadName: `${cita.contacto?.nombres ?? ""} ${cita.contacto?.apellidos ?? ""}`,
        segment: cita.contacto?.segmento ?? "",
        status: "confirmed",
      };
    });
  }, [citas]);
  
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
      (apt) => apt.date === date
    )
  }

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days : JSX.Element[] = [];

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
              <div key={apt.id_cita} className={`text-xs p-1 rounded flex items-center gap-1 ${getTypeColor(apt.type)}`}>
                {apt.type === "visit" && <User className="w-3 h-3 inline-block" />}
                <span>{apt.time} - {apt.leadName}</span>
              </div>
            ))}
            {appointments.length > 2 && (
              <div className="text-xs text-muted-foreground">+{appointments.length - 2} más</div>
            )}
          </div>
        </div>
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
    // Formato yyyy-mm-dd para comparar
    const dayString = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, "0")}-${String(currentDay.getDate()).padStart(2, "0")}`;
    const dayAppointments = getAppointmentsForDate(dayString);
    // Formato legible
    const dayLabel = currentDay.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentDay(new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() - 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDay(new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() + 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {dayAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay citas programadas para este día</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dayAppointments.map((apt) => (
              <Card key={apt.id_cita}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(apt.status)}`}></div>
                      {getTypeIcon(apt.type)}
                      <div>
                        <h4 className="font-medium">{apt.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {apt.time}
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
const TZ = 'America/Lima';
const todayYMD = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date()); // p.ej. "2025-09-26"
const countToday = useMemo(
    () => appointmentsData.filter((apt) => apt.date === todayYMD).length,
    [appointmentsData]
  );

// const countToday = appointmentsData.filter(apt => apt.date.slice(0,10) === todayYMD).length;
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
            {countToday} citas hoy
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
        <CardContent className="p-6">
          {view === "month"
            ? renderMonthView()
            : view === "day"
            ? renderDayView()
            : view === "week"
            ? renderWeekView()
            : null}
        </CardContent>
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
            {/* <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="text-sm">Llamada</span>
            </div> */}
            {/* <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-sm">Clase de prueba</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Seguimiento</span>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
