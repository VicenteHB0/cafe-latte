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
    <div className="min-h-screen bg-[#F0E0CD] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#402E24]" style={{ fontFamily: 'var(--font-brand)' }}>
              Panel de Administración
            </h1>
            <p className="text-[#756046]">Gestión de usuarios y personal</p>
          </div>
          <p className="text-[#B68847] font-medium">
            Total Usuarios: {users.length}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario de Creación */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#402E24]">
                  <UserPlus className="w-5 h-5" />
                  Nuevo Usuario
                </CardTitle>
                <CardDescription>Agrega un nuevo miembro al equipo</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={async (formData) => {
                  "use server";
                  await createUser(formData);
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input name="name" placeholder="Ej. Juan Pérez" required className="border-[#B68847]" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuario</Label>
                    <Input name="username" placeholder="Ej. jperez" required className="border-[#B68847]" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input name="password" type="password" placeholder="******" required className="border-[#B68847]" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select name="role" required defaultValue="staff">
                      <SelectTrigger className="border-[#B68847]">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Barista / Staff</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full bg-[#402E24] hover:bg-[#402E24]/90 text-white">
                    Crear Usuario
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Usuarios */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-[#402E24]">Usuarios Registrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-[#B68847]/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-[#B68847]/20 hover:bg-[#F0E0CD]/20">
                        <TableHead className="text-[#756046]">Nombre</TableHead>
                        <TableHead className="text-[#756046]">Usuario</TableHead>
                        <TableHead className="text-[#756046]">Rol</TableHead>
                        <TableHead className="text-right text-[#756046]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id} className="border-b-[#B68847]/20 hover:bg-[#F0E0CD]/20">
                          <TableCell className="font-medium text-[#402E24]">{user.name}</TableCell>
                          <TableCell className="text-[#756046]">{user.username}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-[#402E24] text-white' 
                                : 'bg-[#F0E0CD] text-[#756046]'
                            }`}>
                              {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                              {user.role === 'admin' ? 'Admin' : 'Staff'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                             <form action={async () => {
                              "use server";
                              await deleteUser(user._id);
                            }}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
