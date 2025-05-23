// app/dashboard/admin-crud/users/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Plus, Search, ChevronLeft, ChevronRight, Filter, UserPlus, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
      // Error ya manejado en el hook con SweetAlert
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

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type)
    return docType ? docType.label.split(' ')[0] : type
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Administrador":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Doctor":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-purple-900">Gestión de Usuarios</CardTitle>
              <CardDescription className="text-purple-700">
                Administra los usuarios del sistema - {users.length} usuarios registrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o documento..."
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
            
            <Button onClick={() => setOpenDialog(true)} className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>

          {loading.users ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Cargando usuarios...</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Nombre Completo</TableHead>
                      <TableHead className="font-semibold">Contacto</TableHead>
                      <TableHead className="font-semibold">Documento</TableHead>
                      <TableHead className="font-semibold">Género</TableHead>
                      <TableHead className="font-semibold">Rol</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {String(user.id).slice(0, 8)}...
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">
                              <Badge variant="outline" className="text-xs">
                                {getDocumentTypeLabel(user.documentType)}
                              </Badge>
                              <div className="mt-1">{user.documentNumber}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {user.gender === 'MALE' ? 'Masculino' : 'Femenino'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(getUserRole(user.roles))}`}>
                              {getUserRole(user.roles)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.isActive ? "default" : "secondary"} 
                              className={user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                            >
                              {user.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-gray-100 rounded-full">
                              <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-gray-600 font-medium">
                                {searchTerm || roleFilter !== "ALL" ? "No se encontraron resultados" : "No hay usuarios registrados"}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {searchTerm || roleFilter !== "ALL" ? "Intenta con otros términos de búsqueda o filtros" : "Comienza agregando un nuevo usuario"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <span className="text-sm text-muted-foreground px-2">
                      Página {currentPage} de {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              {editMode ? "Editar Usuario" : "Registrar Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "Modifica los datos del usuario seleccionado" : "Complete todos los campos para registrar un nuevo usuario en el sistema"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Nombres <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Ej: Juan Carlos"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Apellidos <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Ej: García López"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="usuario@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Ej: +57 300 123 4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {!editMode && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Contraseña Temporal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500">
                      El usuario deberá cambiar esta contraseña en su primer acceso
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType" className="text-sm font-medium">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => handleSelectChange("documentType", value)}
                    required
                    disabled={editMode}
                  >
                    <SelectTrigger id="documentType" className="focus:ring-2 focus:ring-purple-500">
                      <SelectValue placeholder="Seleccione el tipo" />
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
                    <p className="text-xs text-gray-500">
                      No se puede modificar en modo edición
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentNumber" className="text-sm font-medium">
                    Número de Documento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="documentNumber"
                    name="documentNumber"
                    placeholder="Ej: 12345678"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    required
                    disabled={editMode}
                    className="focus:ring-2 focus:ring-purple-500"
                  />
                  {editMode && (
                    <p className="text-xs text-gray-500">
                      No se puede modificar en modo edición
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Género <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                    required
                    disabled={editMode}
                  >
                    <SelectTrigger id="gender" className="focus:ring-2 focus:ring-purple-500">
                      <SelectValue placeholder="Seleccione el género" />
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
                    <p className="text-xs text-gray-500">
                      No se puede modificar en modo edición
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Rol del Usuario <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange("role", value)}
                    required
                    disabled={editMode}
                  >
                    <SelectTrigger id="role" className="focus:ring-2 focus:ring-purple-500">
                      <SelectValue placeholder="Seleccione el rol" />
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
                    <p className="text-xs text-gray-500">
                      No se puede modificar en modo edición
                    </p>
                  )}
                  {!editMode && (
                    <p className="text-xs text-gray-500">
                      Los doctores se crean desde la sección específica de doctores
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                disabled={loading.submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading.submitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading.submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  editMode ? "Actualizar Usuario" : "Crear Usuario"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}