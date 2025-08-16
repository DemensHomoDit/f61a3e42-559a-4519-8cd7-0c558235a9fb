import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  HStack,
  VStack,
  Text,
  Box
} from "@chakra-ui/react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  formatDateOnly: (date?: string) => string;
  TYPE_RU: Record<string, string>;
  readNotifications: Set<string>; // Добавляем информацию о прочитанных уведомлениях
}

export function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  formatDateOnly,
  TYPE_RU,
  readNotifications
}: NotificationsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent className="modern-card">
        <ModalHeader className="text-gray-800">
          <HStack spacing={3}>
            <HStack spacing={3}>
              <Box className="relative">
                <Bell size={24} color="#6b7280" />
                {unreadCount > 0 && (
                  <Box
                    position="absolute"
                    top="-2"
                    right="-2"
                    className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Box>
                )}
              </Box>
              <Text>Уведомления</Text>
            </HStack>
            {unreadCount > 0 && (
              <Button
                className="modern-button-secondary"
                size="sm"
                onClick={onMarkAllAsRead}
              >
                Прочитать все
              </Button>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <VStack align="stretch" spacing={3}>
              {[1,2,3,4,5,6,7,8].map(i => (
                <Box key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </VStack>
          ) : (
            <VStack align="stretch" spacing={3}>
              {notifications.length > 0 ? (
                notifications.map((n) => {
                  const to = n.id.startsWith('t-') || n.id.startsWith('td-') ? `/tasks/${n.id.split('-')[1]}` : n.id.startsWith('p-') ? '/finances' : '/notifications';
                  return (
                    <HStack 
                      as={Link} 
                      to={to} 
                      key={n.id} 
                      justify="space-between" 
                      p={4} 
                      className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => onMarkAsRead(n.id)}
                    >
                      <VStack align="start" spacing={2} flex="1">
                        <Text className="text-gray-800 font-medium">{n.title ?? 'Событие'}</Text>
                        {n.date && (
                          <Text className="text-gray-500 text-sm">
                            {formatDateOnly(n.date)}
                          </Text>
                        )}
                      </VStack>
                      <VStack align="end" spacing={2}>
                        <Box className={`modern-badge ${n.type === 'warning' ? 'modern-badge-warning' : n.type === 'error' ? 'modern-badge-warning' : n.type === 'success' ? 'modern-badge-success' : ''}`}>
                          {TYPE_RU[n.type] ?? 'Инфо'}
                        </Box>
                        {!readNotifications.has(n.id) && (
                          <Box className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </VStack>
                    </HStack>
                  );
                })
              ) : (
                <Box className="text-center py-12">
                  <Bell size={48} color="#9ca3af" className="mx-auto mb-4" />
                  <Text className="text-gray-500 text-lg">Нет уведомлений</Text>
                  <Text className="text-gray-400 text-sm">Новые уведомления появятся здесь</Text>
                </Box>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Text className="text-gray-500 text-sm">
              Всего: {notifications.length} • Непрочитанных: {unreadCount}
            </Text>
            <Button
              className="modern-button"
              onClick={onClose}
            >
              Закрыть
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 