import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { DragonLogo } from '@/components/DragonLogo';
import { z } from 'zod';

const emailSchema = z.string().email('Nieprawidłowy adres email');
const passwordSchema = z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków');

type ViewMode = 'login' | 'forgot-password' | 'reset-password';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, resetPassword, updatePassword, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    // Check if this is a password reset callback
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setViewMode('reset-password');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !authLoading && viewMode !== 'reset-password') {
      navigate('/');
    }
  }, [user, authLoading, navigate, viewMode]);

  const validateLoginForm = () => {
    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);
    
    const newErrors: { email?: string; password?: string } = {};
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmailForm = () => {
    const emailResult = emailSchema.safeParse(email);
    
    const newErrors: { email?: string } = {};
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const passwordResult = passwordSchema.safeParse(password);
    
    const newErrors: { password?: string; confirmPassword?: string } = {};
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    if (password !== confirmPassword) newErrors.confirmPassword = 'Hasła muszą być identyczne';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd logowania',
        description: error.message === 'Invalid login credentials' 
          ? 'Nieprawidłowy email lub hasło' 
          : error.message
      });
    } else {
      toast({
        title: 'Zalogowano',
        description: 'Witaj w SMoKi!'
      });
      navigate('/');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmailForm()) return;

    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.message
      });
    } else {
      setResetEmailSent(true);
      toast({
        title: 'Email wysłany',
        description: 'Sprawdź swoją skrzynkę pocztową.'
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResetForm()) return;

    setIsLoading(true);
    const { error } = await updatePassword(password);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error.message
      });
    } else {
      toast({
        title: 'Hasło zmienione',
        description: 'Możesz teraz zalogować się nowym hasłem.'
      });
      setViewMode('login');
      setPassword('');
      setConfirmPassword('');
      navigate('/auth');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <DragonLogo className="w-20 h-20" />
          </div>
          <CardTitle className="text-2xl font-bold"><span className="text-gradient">SMoKi</span></CardTitle>
          <CardDescription>
            {viewMode === 'login' && 'Zaloguj się do systemu'}
            {viewMode === 'forgot-password' && 'Zresetuj swoje hasło'}
            {viewMode === 'reset-password' && 'Ustaw nowe hasło'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Hasło</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full gradient-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Zaloguj się'
                )}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setViewMode('forgot-password');
                  setErrors({});
                  setPassword('');
                }}
              >
                Zapomniałem hasła
              </Button>
            </form>
          )}

          {viewMode === 'forgot-password' && (
            <div className="space-y-4">
              {resetEmailSent ? (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Link do resetowania hasła został wysłany na adres <strong>{email}</strong>.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sprawdź swoją skrzynkę pocztową i kliknij w link, aby ustawić nowe hasło.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setViewMode('login');
                      setResetEmailSent(false);
                      setEmail('');
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Powrót do logowania
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Podaj swój adres email, a wyślemy Ci link do resetowania hasła.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="twoj@email.pl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Wyślij link resetujący'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setViewMode('login');
                      setErrors({});
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Powrót do logowania
                  </Button>
                </form>
              )}
            </div>
          )}

          {viewMode === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Wprowadź nowe hasło dla swojego konta.
              </p>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nowe hasło</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Potwierdź hasło</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full gradient-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Ustaw nowe hasło'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
