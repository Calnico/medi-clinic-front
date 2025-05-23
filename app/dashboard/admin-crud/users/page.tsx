// app/dashboard/admin-crud/users/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsersCrud } from "@/hooks/useUsersCrud"
import { useState } from "react"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState("ALL")
  
  const itemsPerPage = 10
  
  const {
    users,
    loading,
    formData,
    documentTypes,
    genders,
    roles,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    handleEdit,
    handleUpdate,
    handleDelete,
    getUserRole,
    resetForm,
    fetchUsers,
    fetchUsersByRole
  } = useUsersCrud()

  // Filter and paginate
  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.documentNumber.includes(searchTerm)
    
    if (roleFilter === "ALL") return matchesSearch
    
    const userRole = getUserRole(user.roles)
    const filterRole = roleFilter === "ADMIN" ? "Administrador" : 
                      roleFilter === "USER" ? "Paciente" : "Doctor"
    
    return matchesSearch && userRole === filterRole
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleFormSubmit = async (e: React.FormEvent) => {
    
    try {
      if (editMode && currentUser) {
        console.log("✏️ [DEBUG] Modo edición - llamando handleUpdate")
        await handleUpdate(currentUser)
      } else {
        console.log("➕ [DEBUG] Modo creación - llamando handleSubmit")
        await handleSubmit(e)
      }
      setOpenDialog(false)
    } catch (error) {
    }
  }

  const handleEditClick = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      handleEdit(user)
      setCurrentUser(userId)
      setEditMode(true)
      setOpenDialog(true)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    
    if (!open) {
      resetForm()
      setEditMode(false)
      setCurrentUser(null)
    }
    console.log("🏠 [DEBUG] Estableciendo openDialog a:", open)
    setOpenDialog(open)
  }

  const handleRoleFilterChange = async (value: string) => {
    setRoleFilter(value)
    setCurrentPage(1)
    
    if (value === "ALL") {
      await fetchUsers()
    } else {
      await fetchUsersByRole(value)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Gestiona los usuarios del sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full sm:w-48">
                <Select
                  value={roleFilter}
                  onValueChange={handleRoleFilterChange}
                >
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los roles</SelectItem>
                    <SelectItem value="ADMIN">Administradores</SelectItem>
                    <SelectItem value="USER">Pacientes</SelectItem>
                    <SelectItem value="DOCTOR">Doctores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>

          {loading.users ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Rol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          {user.documentType === 'CITIZENSHIP_CARD' ? 'CC' : 
                           user.documentType === 'FOREIGNERS_ID_CARD' ? 'CE' :
                           user.documentType === 'PASSPORT' ? 'PA' : 'TI'} {user.documentNumber}
                        </TableCell>
                        <TableCell>{getUserRole(user.roles)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchTerm || roleFilter !== "ALL" ? "No se encontraron resultados" : "No hay usuarios registrados"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {filteredUsers.length > itemsPerPage && (
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
      <Dialog open={openDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Editar Usuario" : "Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "Modifica los datos del usuario" : "Complete el formulario para registrar un nuevo usuario"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombres</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo de Documento</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) => handleSelectChange("documentType", value)}
                  required
                  disabled={editMode}
                >
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editMode && (
                  <p className="text-xs text-muted-foreground">
                    No se puede modificar en modo edición
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">Número de Documento</Label>
                <Input
                  id="documentNumber"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  required
                  disabled={editMode}
                />
                {editMode && (
                  <p className="text-xs text-muted-foreground">
                    No se puede modificar en modo edición
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                  required
                  disabled={editMode}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Seleccione un género" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editMode && (
                  <p className="text-xs text-muted-foreground">
                    No se puede modificar en modo edición
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                  required
                  disabled={editMode}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editMode && (
                  <p className="text-xs text-muted-foreground">
                    No se puede modificar en modo edición
                  </p>
                )}
              </div>

              {!editMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={loading.submitting}>
                {loading.submitting ? "Procesando..." : editMode ? "Actualizar Usuario" : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}