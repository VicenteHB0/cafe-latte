import { getUsers, deleteUser, createUser } from '@/lib/admin-actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, UserPlus, Shield, User } from 'lucide-react';
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'admin') {
    redirect('/menu');
  }

  const users = await getUsers();

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#402E24] p-6 rounded-2xl shadow-lg text-white">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-brand)' }}>
              Panel de Administración
            </h1>
            <p className="text-[#F0E0CD]/80">Gestión de usuarios y personal</p>
          </div>
          <div className="bg-[#B68847]/20 px-4 py-2 rounded-lg border border-[#B68847]/30">
            <p className="text-[#F0E0CD] font-medium">
              Total Usuarios: <span className="text-white font-bold text-lg ml-1">{users.length}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario de Creación */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-none shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-[#402E24] text-xl">
                  <div className="p-2 bg-[#402E24]/10 rounded-lg">
                    <UserPlus className="w-5 h-5 text-[#402E24]" />
                  </div>
                  Nuevo Usuario
                </CardTitle>
                <CardDescription className="text-gray-500">Agrega un nuevo miembro al equipo</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form action={async (formData) => {
                  "use server";
                  await createUser(formData);
                }} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">Nombre Completo</Label>
                    <Input name="name" placeholder="Ej. Juan Pérez" required className="border-gray-200 focus:border-[#402E24] focus:ring-[#402E24]/10 bg-gray-50/50" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-medium">Usuario</Label>
                    <Input name="username" placeholder="Ej. jperez" required className="border-gray-200 focus:border-[#402E24] focus:ring-[#402E24]/10 bg-gray-50/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Contraseña</Label>
                    <Input name="password" type="password" placeholder="******" required className="border-gray-200 focus:border-[#402E24] focus:ring-[#402E24]/10 bg-gray-50/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700 font-medium">Rol</Label>
                    <Select name="role" required defaultValue="staff">
                      <SelectTrigger className="border-gray-200 bg-gray-50/50 focus:ring-[#402E24]/10">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Barista / Staff</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full bg-[#402E24] hover:bg-[#2b1f18] text-white shadow-md hover:shadow-lg transition-all h-10 mt-2">
                    Crear Usuario
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Usuarios */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-none shadow-md h-full overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <CardTitle className="text-[#402E24] flex items-center gap-2">
                    <div className="p-2 bg-[#402E24]/10 rounded-lg">
                        <User className="w-5 h-5 text-[#402E24]" />
                    </div>
                    Usuarios Registrados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-100 bg-gray-50/30 hover:bg-gray-50/50">
                        <TableHead className="text-[#A67C52] font-semibold pl-6">Nombre</TableHead>
                        <TableHead className="text-[#A67C52] font-semibold">Usuario</TableHead>
                        <TableHead className="text-[#A67C52] font-semibold">Rol</TableHead>
                        <TableHead className="text-right text-[#A67C52] font-semibold pr-6">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-700 pl-6 py-4">{user.name}</TableCell>
                          <TableCell className="text-gray-500">{user.username}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                              user.role === 'admin' 
                                ? 'bg-[#402E24]/10 text-[#402E24] border-[#402E24]/20' 
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                              {user.role === 'admin' ? 'Admin' : 'Staff'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                             <form action={async () => {
                              "use server";
                              await deleteUser(user._id);
                            }}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                disabled={user.username === 'admin'} // Protect main admin
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
