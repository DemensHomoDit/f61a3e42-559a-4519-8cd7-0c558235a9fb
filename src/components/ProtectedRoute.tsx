import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: {
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'approve';
  };
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();

  // Показываем загрузку пока проверяем аутентификацию
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minH="100vh"
        bg="gray.50"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" />
          <Text color="gray.600">Проверка авторизации...</Text>
        </VStack>
      </Box>
    );
  }

  // Если не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверяем роль пользователя
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minH="100vh"
        bg="gray.50"
      >
        <VStack spacing={4} textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="red.600">
            Доступ запрещен
          </Text>
          <Text color="gray.600">
            У вас недостаточно прав для доступа к этой странице.
          </Text>
          <Text fontSize="sm" color="gray.500">
            Требуемая роль: {requiredRole}
          </Text>
        </VStack>
      </Box>
    );
  }

  // Проверяем конкретное право доступа
  if (requiredPermission) {
    if (!hasPermission(requiredPermission.resource, requiredPermission.action)) {
      return (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          minH="100vh"
          bg="gray.50"
        >
          <VStack spacing={4} textAlign="center">
            <Text fontSize="xl" fontWeight="bold" color="red.600">
              Доступ запрещен
            </Text>
            <Text color="gray.600">
              У вас недостаточно прав для выполнения этого действия.
            </Text>
            <Text fontSize="sm" color="gray.500">
              Требуемое право: {requiredPermission.action} на {requiredPermission.resource}
            </Text>
          </VStack>
        </Box>
      );
    }
  }

  // Если все проверки пройдены, показываем защищенный контент
  return <>{children}</>;
};

// Удобные компоненты для частых случаев
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="manager">
    {children}
  </ProtectedRoute>
);

export const ForemanRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="foreman">
    {children}
  </ProtectedRoute>
);

export const AccountantRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="accountant">
    {children}
  </ProtectedRoute>
); 