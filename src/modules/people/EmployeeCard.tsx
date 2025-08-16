import { Card, CardBody, Image, Box, Text, HStack, Button, VStack, Grid, GridItem, Badge, Avatar } from "@chakra-ui/react";
import React from "react";
import { motion } from "framer-motion";
import { Shield, HardHat, Hammer, User as UserIcon, MapPin, Clock, Phone, Mail, MessageCircle } from "lucide-react";
import type { User } from "@/types";
import { useNavigate } from "react-router-dom";

interface Props {
  user: User;
  onEdit: (u: User) => void;
  onDelete: (id: number) => void;
}

const roleColor = (r?: string) => r === 'admin' ? 'red' : r === 'foreman' ? 'blue' : r === 'worker' ? 'green' : 'gray';
const roleLabel = (r?: string) => r === 'admin' ? 'Администратор' : r === 'foreman' ? 'Прораб' : r === 'worker' ? 'Рабочий' : 'Сотрудник';
const roleIcon = (r?: string) => r === 'admin' ? Shield : r === 'foreman' ? HardHat : r === 'worker' ? Hammer : UserIcon;

const headerGradientByRole = (r?: string) => {
  // Лесная палитра — более светлые оттенки
  if (r === 'admin') return 'linear-gradient(135deg, #1f6a54 0%, #2f4858 100%)';
  if (r === 'foreman') return 'linear-gradient(135deg, #1f6a54 0%, #0e7a5f 100%)';
  if (r === 'manager') return 'linear-gradient(135deg, #2a7d46 0%, #2f855a 100%)';
  if (r === 'worker') return 'linear-gradient(135deg, #158f89 0%, #2f855a 100%)';
  return 'linear-gradient(135deg, #2a7d46 0%, #1f6a54 100%)';
};

const MotionCard = motion.create(Card);

const EmployeeCard: React.FC<Props> = ({ user, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <MotionCard
      whileHover={{ y: -8, scale: 1.03 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 20,
        duration: 0.6
      }}
      className="modern-card overflow-hidden"
    >
      {/* Современный заголовок */}
      <Box 
        className="p-8"
        position="relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)), ${headerGradientByRole(user.role)}`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* fallback градиент, если картинка недоступна */}
        <Box
          position="absolute"
          inset={0}
          className="bg-gradient-earth"
          opacity={0.15}
        />
        <VStack spacing={5} textAlign="center" position="relative" zIndex={1}>
          {/* Квадратный аватар с закругленными краями - расширенное фото */}
          <Box 
            className="w-64 h-64 rounded-2xl overflow-hidden shadow-lg"
            position="relative"
          >
            <Image
              src={user.photo_url || `https://i.pravatar.cc/300?img=${user.id}`}
              alt={user.full_name}
              w="full"
              h="full"
              objectFit="cover"
            />
          </Box>
          
          {/* Имя и должность */}
          <VStack spacing={2}>
            <Text fontSize="xl" fontWeight="700" color="white">
              {user.full_name}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.800">
              {user.position || 'Должность не указана'}
            </Text>
          </VStack>
          
          {/* Роль */}
          <Badge 
            colorScheme={roleColor(user.role)}
            variant="solid"
            fontSize="10px"
            px={3}
            py={1}
            borderRadius="full"
          >
            {roleLabel(user.role)}
          </Badge>
        </VStack>
      </Box>

      {/* Информация */}
      <Box p={8}>
        <VStack spacing={5} align="stretch">
          {/* Контактная информация */}
          <Box className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <VStack spacing={4} align="stretch">
              {/* Номер телефона - всегда показываем, даже если пустой */}
              <HStack spacing={3}>
                <Box className="modern-stats-icon w-10 h-10">
                  <Phone size={16} color="white" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase">
                    Телефон
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="gray.700">
                    {user.phone || '+7 (999) 000-00-00'}
                  </Text>
                </VStack>
              </HStack>
              
              {user.email && (
                <HStack spacing={3}>
                  <Box className="modern-stats-icon w-10 h-10">
                    <Mail size={16} color="white" />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase">
                      Email
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                      {user.email}
                    </Text>
                  </VStack>
                </HStack>
              )}
              
              <HStack spacing={3}>
                <Box className="modern-stats-icon w-10 h-10">
                  <MessageCircle size={16} color="white" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase">
                    Telegram
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="gray.700">
                    @{user.username || 'username'}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>

          {/* Статус */}
          <Box className="bg-green-50 p-4 rounded-xl border border-green-200">
            <HStack spacing={2} justify="center">
              <Box w={3} h={3} borderRadius="full" bg="green.500" />
              <Text fontSize="sm" fontWeight="600" color="green.700">
                Активен на объекте
              </Text>
            </HStack>
          </Box>
          
          {/* Кнопки */}
          <HStack spacing={3} w="full" pt={2}>
            <Button 
              flex="1" 
              className="modern-button"
              size="sm"
              fontSize="13px"
              fontWeight="600"
              onClick={() => {
                console.log('Кнопка "Подробнее" нажата для пользователя:', user.id);
                navigate(`/people/${user.id}/profile`);
              }}
            >
              Подробнее
            </Button>
            <Button 
              flex="1" 
              className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border border-purple-200 rounded-xl font-medium hover:shadow-md transition-all duration-300 shadow-sm"
              size="sm"
              fontSize="13px"
              fontWeight="600"
              onClick={()=> onEdit(user)}
            >
              Редактировать
            </Button>
          </HStack>
        </VStack>
      </Box>
    </MotionCard>
  );
};

export default EmployeeCard; 