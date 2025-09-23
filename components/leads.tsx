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

// Hook para obtener los leads desde la API
function useLeads() {
  const [leads, setLeads] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then(setLeads)
  }, [])
  return leads
}


export function Leads() {
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

  const filteredLeads = leadsData.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
    // Aquí podrías hacer un POST a la API para guardar la llamada
    setCallModalOpen(false)
    setSelectedLead(null)
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
      {/* ...existing code... */}
    </div>
  )
}
