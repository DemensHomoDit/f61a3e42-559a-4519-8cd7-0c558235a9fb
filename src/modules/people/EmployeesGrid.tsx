import { SimpleGrid, Box, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { motion } from "framer-motion";
import type { User } from "@/types";
import EmployeeCard from "./EmployeeCard";

interface Props {
  users: User[];
  onEdit: (u: User) => void;
  onDelete: (id: number) => void;
}

const MotionGrid = motion.create(SimpleGrid);

const EmployeesGrid: React.FC<Props> = ({ users, onEdit, onDelete }) => {
  if (users.length === 0) {
    return (
      <Box textAlign="center" py={16}>
        <VStack spacing={6}>
          <Box className="card-nature shadow-elevated" p={8} maxW="400px" mx="auto">
            <VStack spacing={4}>
              <Box p={4} bg="gray.100" borderRadius="xl">
                <Text fontSize="4xl">👥</Text>
              </Box>
              <Text fontSize="lg" color="gray.700" fontWeight="600">
                Сотрудники не найдены
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Попробуйте изменить параметры поиска или добавить нового сотрудника
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    );
  }

  return (
    <MotionGrid
      columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
      spacing={8}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
            duration: 0.8,
            ease: "easeOut"
          },
        },
      }}
    >
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.95 },
            visible: { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 20,
                duration: 0.6
              }
            },
          }}
          custom={index}
        >
          <EmployeeCard
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </MotionGrid>
  );
};

export default EmployeesGrid; 