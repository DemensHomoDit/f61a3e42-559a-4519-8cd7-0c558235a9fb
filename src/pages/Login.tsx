import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Отладочная информация
  console.log('Login states:', { 
    authLoading, 
    isAuthenticated, 
    showSplash, 
    showTransition, 
    isLoading 
  });

  // Анимация логотипа при первой загрузке
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Показываем логотип 2.5 секунды

    return () => clearTimeout(timer);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-nature-pulse">
          <div className="h-12 w-12 border-4 border-nature-young-spruce border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Анимация перехода при входе (проверяем до isAuthenticated)
  if (showTransition) {
    return (
      <>
        <Helmet>
          <title>Вход в систему | UgraBuilders</title>
        </Helmet>
        <div className="fixed inset-0 bg-gradient-forest flex items-center justify-center z-50">
          <div className="text-center animate-fade-in">
            <div className="animate-scale-bounce">
              <img 
                src="/logo.svg" 
                alt="UgraBuilders"
                className="w-80 h-auto mx-auto animate-pulse"
              />
            </div>
            <div className="text-white text-xl font-medium animate-fade-in opacity-80 mt-4">
              Вход в систему...
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Splash screen с логотипом
  if (showSplash) {
    return (
      <>
        <Helmet>
          <title>Вход в систему | UgraBuilders</title>
        </Helmet>
        <div className="fixed inset-0 bg-gradient-forest flex items-center justify-center z-50">
          <div className="text-center animate-fade-in">
            <div className="mb-8 animate-scale-bounce">
              <img 
                src="/logo.svg" 
                alt="UgraBuilders"
                className="w-80 h-auto mx-auto"
              />
            </div>
            <div className="text-white text-xl font-medium animate-fade-in opacity-80">
              Система управления строительством
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    console.log('Начинаем вход в систему...');
    
    try {
      const res = await login(username, password);
      if (!res) {
        throw new Error('Auth failed');
      }
      // Если требуется смена пароля — перенаправляем на страницу смены
      if (res.must_change_password) {
        navigate('/change-password', { state: { username } });
        return;
      }
      setShowTransition(true);
      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      toast({ title: 'Неверный логин или пароль', status: 'error' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Вход в систему | UgraBuilders</title>
        <meta name="description" content="Вход в систему управления строительными проектами" />
      </Helmet>

      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Логотип и заголовок */}
          <div className="text-center space-y-6">
            <div className="hover-lift">
              <img 
                src="/logo.svg" 
                alt="UgraBuilders"
                className="w-64 h-auto mx-auto"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-forest bg-clip-text text-transparent">
                Добро пожаловать
              </h1>
              <p className="text-muted-foreground">
                Войдите в систему управления строительством
              </p>
            </div>
          </div>

          {/* Форма входа */}
          <Card className="card-nature shadow-elevated">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-xl">Вход в систему</CardTitle>
              <CardDescription>
                Введите свои учетные данные для доступа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Введите имя пользователя"
                    className="transition-all duration-300 focus:shadow-glow"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Введите пароль"
                      className="pr-12 transition-all duration-300 focus:shadow-glow"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-nature"
                  disabled={isLoading || showTransition}
                >
                  {isLoading || showTransition ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {showTransition ? 'Вход в систему...' : 'Вход...'}
                    </div>
                  ) : (
                    'Войти в систему'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Демо данные */}
          <Alert className="glass-effect border-nature-morning-mist">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Демо доступ:</strong><br />
              Логин: <code className="bg-muted px-1 rounded">DemensHomo</code><br />
              Пароль: <code className="bg-muted px-1 rounded">8950Madmax</code>
            </AlertDescription>
          </Alert>

          {/* Дополнительная информация */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Система управления строительными объектами,</p>
            <p>задачами, финансами и персоналом</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;