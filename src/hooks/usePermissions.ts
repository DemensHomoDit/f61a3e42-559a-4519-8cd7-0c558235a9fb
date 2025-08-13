import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission, UserRole, ROLE_PERMISSIONS } from '@/types';

export const usePermissions = () => {
  const { user } = useAuth();

  const userPermissions = useMemo(() => {
    if (!user?.role) return [];
    
    const roleConfig = ROLE_PERMISSIONS.find(r => r.role === user.role);
    return roleConfig?.permissions || [];
  }, [user?.role]);

  const hasPermission = (resource: string, action: Permission['action']): boolean => {
    if (!user?.role) return false;
    
    // Админ имеет все права
    if (user.role === 'admin') return true;
    
    // Проверяем конкретное право
    return userPermissions.some(p => 
      p.resource === resource && p.action === action
    );
  };

  const canCreate = (resource: string): boolean => hasPermission(resource, 'create');
  const canRead = (resource: string): boolean => hasPermission(resource, 'read');
  const canUpdate = (resource: string): boolean => hasPermission(resource, 'update');
  const canDelete = (resource: string): boolean => hasPermission(resource, 'delete');
  const canApprove = (resource: string): boolean => hasPermission(resource, 'approve');

  const getRoleName = (role: UserRole): string => {
    const roleConfig = ROLE_PERMISSIONS.find(r => r.role === role);
    return roleConfig?.description || role;
  };

  return {
    userPermissions,
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canApprove,
    getRoleName,
    userRole: user?.role,
    isAdmin: user?.role === 'admin'
  };
}; 