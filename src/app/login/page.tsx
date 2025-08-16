
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
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Campos Incompletos',
        description: 'Por favor, introduce tu correo y contraseña.',
      });
      setIsLoggingIn(false);
      return;
    }

    try {
      await login(email, password);
      // AuthProvider will handle navigation to the main app content.
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de Autenticación',
        description: error.message || 'Las credenciales proporcionadas son incorrectas. Verifica tus datos.',
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
              Introduce tus credenciales. Prueba con:<br/>
              <span className="font-medium">carlos.mendoza@guardian.co</span> / <span className="font-medium">password123</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@guardian.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
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
