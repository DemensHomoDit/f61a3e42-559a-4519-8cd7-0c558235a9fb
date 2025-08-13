import { Card, CardBody, Image, Box, Text, HStack, Button, VStack, Grid, GridItem, Badge } from "@chakra-ui/react";
import React from "react";
import { motion } from "framer-motion";
import { Shield, HardHat, Hammer, User as UserIcon, MapPin, Clock } from "lucide-react";
import type { User } from "@/types";
import { Link } from "react-router-dom";

interface Props {
  user: User;
  onEdit: (u: User) => void;
  onDelete: (id: number) => void;
}

const roleColor = (r?: string) => r === 'admin' ? 'red' : r === 'foreman' ? 'blue' : r === 'worker' ? 'green' : 'gray';
const roleLabel = (r?: string) => r === 'admin' ? 'Администратор' : r === 'foreman' ? 'Прораб' : r === 'worker' ? 'Рабочий' : 'Сотрудник';
const roleIcon = (r?: string) => r === 'admin' ? Shield : r === 'foreman' ? HardHat : r === 'worker' ? Hammer : UserIcon;

const MotionCard = motion(Card);

const EmployeeCard: React.FC<Props> = ({ user, onEdit, onDelete }) => (
  <MotionCard
    whileHover={{ y: -6, scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      type: 'spring', 
      stiffness: 200, 
      damping: 20,
      duration: 0.6
    }}
    variant="interactive"
    bg="bg.card"
  >
    {/* Фото */}
    <Box p={4} pt={4}>
      <Image
        w="full"
        h="48"
        objectFit="cover"
        src={`https://randomuser.me/api/portraits/${user.gender==='female'?'women':'men'}/${user.id % 100}.jpg`}
        alt={user.full_name}
        borderRadius="xl"
        border="1px solid"
        borderColor="border.light"
        transition="all 0.3s ease"
        _hover={{
          borderColor: "border.medium",
          transform: "scale(1.02)"
        }}
      />
    </Box>

    {/* Информация */}
    <CardBody p={6} pt={0}>
      <VStack spacing={3} textAlign="center" mb={6}>
        <VStack spacing={1}>
          <Text fontSize="xl" fontWeight="700" color="text.primary">{user.full_name}</Text>
          <Text fontSize="sm" color="text.secondary" fontWeight="500">{user.position || roleLabel(user.role)}</Text>
        </VStack>
        
        <HStack spacing={2}>
          <Badge variant="brand" fontSize="10px" px={2} py={1}>
            {roleLabel(user.role)}
          </Badge>
          <Badge variant="success" fontSize="10px" px={2} py={1}>
            Активен
          </Badge>
        </HStack>
      </VStack>

      <Box bg="bg.tertiary" borderRadius="xl" p={4} mb={6} border="1px solid" borderColor="border.light">
        <Grid templateColumns="80px 1fr" rowGap={3} columnGap={4} fontSize="sm">
          {user.phone && (<>
            <GridItem fontWeight="600" color="text.secondary" fontSize="11px" textTransform="uppercase" letterSpacing="0.05em">Телефон</GridItem>
            <GridItem color="text.primary" fontWeight="500">{user.phone}</GridItem>
          </>) }
          {user.email && (<>
            <GridItem fontWeight="600" color="text.secondary" fontSize="11px" textTransform="uppercase" letterSpacing="0.05em">Email</GridItem>
            <GridItem color="text.primary" fontWeight="500">{user.email}</GridItem>
          </>) }
          <GridItem fontWeight="600" color="text.secondary" fontSize="11px" textTransform="uppercase" letterSpacing="0.05em">ID</GridItem>
          <GridItem color="text.primary" fontWeight="500">EMP-{user.id}</GridItem>
          <GridItem fontWeight="600" color="text.secondary" fontSize="11px" textTransform="uppercase" letterSpacing="0.05em">Статус</GridItem>
          <GridItem>
            <HStack spacing={1}>
              <Box w={2} h={2} borderRadius="full" bg="accent.success" />
              <Text color="text.primary" fontWeight="500">На объекте</Text>
            </HStack>
          </GridItem>
        </Grid>
      </Box>
      
      <HStack spacing={3} w="full">
        <Button 
          as={Link} 
          to={`/people/${user.id}`} 
          flex="1" 
          variant="primary"
          size="sm"
          fontSize="13px"
          fontWeight="600"
        >
          Подробнее
        </Button>
        <Button 
          flex="1" 
          variant="secondary"
          size="sm"
          fontSize="13px"
          fontWeight="600"
          onClick={()=> onEdit(user)}
        >
          Редактировать
        </Button>
      </HStack>
    </CardBody>
  </MotionCard>
);

export default EmployeeCard; 