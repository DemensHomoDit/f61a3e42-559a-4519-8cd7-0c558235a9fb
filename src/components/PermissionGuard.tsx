import React, { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'approve';
  children: ReactNode;
  fallback?: ReactNode;
  showIfNoPermission?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  children,
  fallback = null,
  showIfNoPermission = false
}) => {
  const { hasPermission } = usePermissions();
  
  const hasAccess = hasPermission(resource, action);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (showIfNoPermission) {
    return <>{fallback}</>;
  }
  
  return null;
};

// Удобные компоненты для частых случаев
export const CanCreate: React.FC<Omit<PermissionGuardProps, 'action'>> = (props) => (
  <PermissionGuard {...props} action="create" />
);

export const CanRead: React.FC<Omit<PermissionGuardProps, 'action'>> = (props) => (
  <PermissionGuard {...props} action="read" />
);

export const CanUpdate: React.FC<Omit<PermissionGuardProps, 'action'>> = (props) => (
  <PermissionGuard {...props} action="update" />
);

export const CanDelete: React.FC<Omit<PermissionGuardProps, 'action'>> = (props) => (
  <PermissionGuard {...props} action="delete" />
);

export const CanApprove: React.FC<Omit<PermissionGuardProps, 'action'>> = (props) => (
  <PermissionGuard {...props} action="approve" />
); 