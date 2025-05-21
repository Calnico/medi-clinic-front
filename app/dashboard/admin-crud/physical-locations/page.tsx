// app/dashboard/admin-crud/physical-locations/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type PhysicalLocation = {
  id: string
  name: string
  address: string
}

export default function PhysicalLocationsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<PhysicalLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<PhysicalLocation | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: ""
  })

  // Fetch locations
  const fetchLocations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/physical-locations`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al obtener las ubicaciones")

      const data = await response.json()
      setLocations(data)
    } catch (error) {
      toast.error("Error al cargar las ubicaciones")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      const url = editMode && currentLocation 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/physical-locations/${currentLocation.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/physical-locations`

      const method = editMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error(editMode ? "Error al actualizar" : "Error al crear")

      toast.success(editMode ? "Ubicación actualizada" : "Ubicación creada")
      fetchLocations()
      setOpenDialog(false)
      resetForm()
    } catch (error) {
      toast.error(editMode ? "Error al actualizar" : "Error al crear")
      console.error(error)
    }
  }

  // Delete location
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/physical-locations/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Ubicación eliminada")
      fetchLocations()
    } catch (error) {
      toast.error("Error al eliminar")
      console.error(error)
    }
  }

  // Edit location
  const handleEdit = (location: PhysicalLocation) => {
    setCurrentLocation(location)
    setFormData({
      name: location.name,
      address: location.address
    })
    setEditMode(true)
    setOpenDialog(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      address: ""
    })
    setEditMode(false)
    setCurrentLocation(null)
  }

  // Filter and paginate
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage)
  const paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ubicaciones Físicas</CardTitle>
          <CardDescription>
            Gestiona los hospitales, clínicas y otros centros médicos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ubicaciones..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Ubicación
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLocations.length > 0 ? (
                    paginatedLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.address}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(location)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(location.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        {searchTerm ? "No se encontraron resultados" : "No hay ubicaciones registradas"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {filteredLocations.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={(open) => {
        if (!open) resetForm()
        setOpenDialog(open)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Editar Ubicación" : "Nueva Ubicación"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "Modifica los datos de la ubicación" : "Completa el formulario para agregar una nueva ubicación"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Dirección
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">
                {editMode ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}