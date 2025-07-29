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
import { initialWorkLocations } from '@/lib/data';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function ServicesPage() {
    const { toast } = useToast();

    const handleDelete = (serviceName: string) => {
        toast({
            title: "Función no implementada",
            description: `La eliminación de ${serviceName} estará disponible pronto.`
        });
    }
  
    const handleEdit = (serviceName: string) => {
        toast({
            title: "Función no implementada",
            description: `La edición de ${serviceName} estará disponible pronto.`
        });
    }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full bg-gray-50/50">
            <header className="p-4 border-b bg-white shadow-sm">
                <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-headline font-bold text-gray-800">Gestión de Servicios</h1>
                <Button>
                    <PlusCircle className="mr-2" />
                    Añadir Servicio
                </Button>
                </div>
            </header>
            <main className="flex-1 p-2 md:p-6 overflow-auto">
                <Card className="shadow-lg border-t-4 border-primary">
                    <CardHeader>
                        <CardTitle>Listado de Centros de Trabajo</CardTitle>
                        <CardDescription>
                        Aquí puedes ver y gestionar los lugares donde se presta servicio.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="overflow-x-auto rounded-lg border">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="px-4 py-3">Nombre del Servicio</TableHead>
                                    <TableHead className="text-right px-4 py-3">Acciones</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {initialWorkLocations.map((location) => (
                                        <TableRow key={location.id}>
                                            <TableCell className="font-medium px-4">{location.name}</TableCell>
                                            <TableCell className="text-right px-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                         <DropdownMenuItem onClick={() => handleEdit(location.name)}>
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(location.name)}>
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
