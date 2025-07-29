'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarDays, FileDown, Briefcase, Users, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PayrollPage() {
  const [currentDate] = React.useState(new Date());

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full bg-gray-50/50">
            <header className="p-4 border-b bg-white shadow-sm">
                <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-headline font-bold text-gray-800">Cálculo de Nómina</h1>
                 <div className="flex items-center gap-2">
                     <Button>
                        <CheckCircle className="mr-2" />
                        Cerrar Periodo de Nómina
                    </Button>
                    <Button variant="outline">
                        <FileDown className="mr-2" />
                        Exportar Reporte General
                    </Button>
                 </div>
                </div>
            </header>
            <main className="flex-1 p-2 md:p-6 overflow-auto">
                 <Card className="shadow-lg border-t-4 border-primary mb-6">
                    <CardHeader>
                        <CardTitle className="font-headline">
                            Calculadora de Nómina
                        </CardTitle>
                        <CardDescription>
                            Selecciona el periodo para calcular y visualizar la nómina de los empleados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 w-full">
                            <Select defaultValue="1-15">
                                <SelectTrigger className="bg-white">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Seleccionar periodo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1-15">Periodo: 1-15 {format(currentDate, 'MMMM yyyy', { locale: es })}</SelectItem>
                                    <SelectItem value="16-end">Periodo: 16-fin {format(currentDate, 'MMMM yyyy', { locale: es })}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full md:w-auto">Calcular Nómina</Button>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">$ 45,231.89</div>
                        <p className="text-xs text-muted-foreground">Nómina bruta del periodo</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Empleados en Nómina</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">+5</div>
                        <p className="text-xs text-muted-foreground">Total de empleados activos</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Préstamos</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">$ 1,250.00</div>
                        <p className="text-xs text-muted-foreground">Descuentos del periodo</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bonos y Extras</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">$ 800.00</div>
                        <p className="text-xs text-muted-foreground">Pagos adicionales</p>
                        </CardContent>
                    </Card>
                </div>
                 <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pre-nómina (Aún no implementado)</CardTitle>
                            <CardDescription>
                                Aquí se mostrará el desglose de la nómina por empleado una vez que se calcule.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-center text-muted-foreground py-12">
                                Presiona "Calcular Nómina" para ver los resultados.
                            </p>
                        </CardContent>
                    </Card>
                 </div>
            </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
