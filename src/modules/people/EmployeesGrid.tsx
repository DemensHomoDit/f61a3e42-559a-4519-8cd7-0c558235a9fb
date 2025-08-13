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

const MotionGrid = motion(SimpleGrid);

const EmployeesGrid: React.FC<Props> = ({ users, onEdit, onDelete }) => {
  if (users.length === 0) {
    return (
      <Box textAlign="center" py={12}>
        <VStack spacing={4}>
          <Text fontSize="lg" color="text.secondary" fontWeight="500">
            Сотрудники не найдены
          </Text>
          <Text fontSize="sm" color="text.tertiary">
            Попробуйте изменить параметры поиска
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <MotionGrid
      columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
      spacing={6}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
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