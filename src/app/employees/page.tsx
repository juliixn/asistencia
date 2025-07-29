'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { initialEmployees } from '@/lib/data';
import type { Employee, EmployeeRole } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmployeesPage() {
    const { toast } = useToast();
    const [employees, setEmployees] = React.useState<Employee[]>(initialEmployees);
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

    const handleDelete = (employeeName: string) => {
        toast({
            title: "Función no implementada",
            description: `La eliminación de ${employeeName} estará disponible pronto.`
        });
    }
  
    const handleEdit = (employeeName: string) => {
        toast({
            title: "Función no implementada",
            description: `La edición de ${employeeName} estará disponible pronto.`
        });
    }

    const handleAddEmployee = (newEmployee: Omit<Employee, 'id'>) => {
        const employeeWithId: Employee = {
            ...newEmployee,
            id: `emp${Date.now()}`
        };
        setEmployees(prev => [employeeWithId, ...prev]);
        toast({
            title: "Empleado Añadido",
            description: `Se ha añadido a ${newEmployee.name} a la lista de personal.`,
        });
        setIsAddDialogOpen(false);
    }
  
    return (
        <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <div className="flex flex-col h-full bg-gray-50/50">
                <header className="p-4 border-b bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                    <h1 className="text-xl md:text-2xl font-headline font-bold text-gray-800">Gestión de Empleados</h1>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2" />
                            Añadir Empleado
                        </Button>
                      </DialogTrigger>
                      <AddEmployeeDialog onSave={handleAddEmployee} />
                    </Dialog>
                    </div>
                </header>
                <main className="flex-1 p-2 md:p-6 overflow-auto">
                    <Card className="shadow-lg border-t-4 border-primary">
                    <CardHeader>
                        <CardTitle>Listado de Personal</CardTitle>
                        <CardDescription>
                            Aquí puedes ver y gestionar la información de todos los empleados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="px-4 py-3">Nombre</TableHead>
                                <TableHead className="px-4 py-3">Rol</TableHead>
                                <TableHead className="px-4 py-3 hidden sm:table-cell">Tarifa por Turno</TableHead>
                                <TableHead className="text-right px-4 py-3">Acciones</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium px-4">{employee.name}</TableCell>
                                        <TableCell className="px-4">
                                            <Badge variant="secondary">{employee.role}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell px-4">${employee.shiftRate.toFixed(2)}</TableCell>
                                        <TableCell className="text-right px-4">
                                            <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(employee.name)}>
                                                    <Edit className="mr-2 h-4 w-4"/>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(employee.name)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                    </Card>
                </main>
            </div>
        </SidebarInset>
        </SidebarProvider>
    );
}


function AddEmployeeDialog({ onSave }: { onSave: (data: Omit<Employee, 'id'>) => void}) {
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<EmployeeRole | ''>('');
  const [shiftRate, setShiftRate] = React.useState<number>(0);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || shiftRate <= 0) {
        toast({
            variant: "destructive",
            title: "Campos Incompletos",
            description: "Por favor, completa todos los campos requeridos.",
        });
        return;
    }
    onSave({ name, role, shiftRate });
  }

  return (
    <DialogContent className="w-[95%] sm:max-w-lg rounded-lg">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle className="font-headline text-lg sm:text-xl">Añadir Nuevo Empleado</DialogTitle>
            </DialogHeader>
            <div className="py-4 grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Juan Pérez" />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as EmployeeRole)}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Guardia">Guardia</SelectItem>
                                <SelectItem value="Supervisor">Supervisor</SelectItem>
                                <SelectItem value="Coordinador">Coordinador</SelectItem>
                                <SelectItem value="Dirección">Dirección</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shiftRate">Tarifa por Turno</Label>
                        <Input id="shiftRate" type="number" value={shiftRate === 0 ? '' : shiftRate} onChange={e => setShiftRate(parseFloat(e.target.value) || 0)} placeholder="0.00" />
                    </div>
                </div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full sm:w-auto">Cancelar</Button>
                </DialogClose>
                <Button type="submit" className="w-full sm:w-auto">Guardar Empleado</Button>
            </DialogFooter>
        </form>
    </DialogContent>
  )
}
