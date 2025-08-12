
'use client';

import * as React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2 } from 'lucide-react';
import type { Employee, EmployeeRole } from '@/lib/types';
import { fetchEmployees, seedInitialData } from '@/lib/api';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [role, setRole] = React.useState<EmployeeRole | ''>('');
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  // Seed data on first load
  React.useEffect(() => {
    seedInitialData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    if (!role || !name || !password) {
      toast({
        variant: 'destructive',
        title: 'Campos Incompletos',
        description: 'Por favor, completa todos los campos para iniciar sesión.',
      });
      setIsLoggingIn(false);
      return;
    }

    try {
      // Fetch employees here and pass to login function
      const employees = await fetchEmployees();
      await login(role as EmployeeRole, name, password, employees);
      // AuthProvider will handle navigation
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de Autenticación',
        description: 'Las credenciales proporcionadas son incorrectas. Verifica tus datos.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50/50 p-4">
      <div className="mb-8 flex flex-col items-center text-center">
         <div className="bg-primary/10 mb-4 rounded-full p-4">
            <Shield className="h-10 w-10 text-primary" />
         </div>
         <h1 className="text-3xl font-bold font-headline text-gray-800">Guardian Payroll</h1>
         <p className="text-muted-foreground">Bienvenido de vuelta. Por favor, inicia sesión.</p>
      </div>
      <Card className="w-full max-w-sm shadow-lg border-t-4 border-primary">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-xl font-headline">Inicio de Sesión</CardTitle>
            <CardDescription>
              Introduce tus credenciales para acceder al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Usuario</Label>
              <Select value={role} onValueChange={(v) => setRole(v as EmployeeRole)}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Director de Seguridad">Director de Seguridad</SelectItem>
                  <SelectItem value="Coordinador de Seguridad">Coordinador de Seguridad</SelectItem>
                  <SelectItem value="Supervisor de Seguridad">Supervisor de Seguridad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre y Apellido</Label>
              <Input
                id="name"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoggingIn || loading}>
                {isLoggingIn || loading ? <Loader2 className="animate-spin" /> : "Iniciar Sesión"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
