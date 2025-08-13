import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Card,
  CardBody,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Если уже авторизован, перенаправляем на главную
  if (authLoading) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minH="100vh"
        bg={bgColor}
      >
        <Text>Загрузка...</Text>
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast({
          title: 'Успешный вход',
          description: 'Добро пожаловать в систему!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      } else {
        toast({
          title: 'Ошибка входа',
          description: 'Неверное имя пользователя или пароль',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при входе. Попробуйте еще раз.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      minH="100vh" 
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
    >
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Логотип и заголовок */}
          <VStack spacing={4} textAlign="center">
            <Box
              p={4}
              bg="green.500"
              borderRadius="full"
              color="white"
              fontSize="3xl"
            >
              <Building2 />
            </Box>
            <Heading size="lg" color="gray.700">
              ПромСтрой Контроль
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Система управления строительными проектами
            </Text>
          </VStack>

          {/* Форма входа */}
          <Card w="full" bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Имя пользователя</FormLabel>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Введите имя пользователя"
                      size="lg"
                      title="Имя пользователя"
                      aria-label="Поле для ввода имени пользователя"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Пароль</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Введите пароль"
                        title="Пароль"
                        aria-label="Поле для ввода пароля"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                          icon={showPassword ? <EyeOff /> : <Eye />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="green"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Вход..."
                  >
                    Войти в систему
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Информация о системе */}
          <VStack spacing={4} textAlign="center" maxW="md">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Информация для входа</AlertTitle>
                <AlertDescription>
                  Используйте логин <strong>DemensHomo</strong> и пароль <strong>8950Madmax</strong> для входа в систему.
                </AlertDescription>
              </Box>
            </Alert>
            
            <Text fontSize="sm" color="gray.500">
              Система управления строительными объектами, задачами, финансами и персоналом
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Login; 