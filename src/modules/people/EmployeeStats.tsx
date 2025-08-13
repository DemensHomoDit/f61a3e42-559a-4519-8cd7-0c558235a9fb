import { Card, CardHeader, CardBody, Heading, Stat, StatNumber, StatLabel, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import type { User } from "@/types";

interface Props { users: User[]; }

const EmployeeStats: React.FC<Props> = ({ users = [] }) => {
  const total = users.length;
  const active = users.filter(u => u.status === 'active').length;
  const foremen = users.filter(u => u.role === 'foreman').length;

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
      <Card>
        <CardHeader p={4}><Heading size="sm" color="brand.500">Всего сотрудников</Heading></CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          <Stat>
            <StatNumber color="text.primary" fontSize="2xl">{total}</StatNumber>
            <StatLabel color="text.secondary" fontSize="sm">в системе</StatLabel>
          </Stat>
        </CardBody>
      </Card>
      <Card>
        <CardHeader p={4}><Heading size="sm" color="brand.500">Активных</Heading></CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          <Stat>
            <StatNumber color="text.primary" fontSize="2xl">{active}</StatNumber>
            <StatLabel color="text.secondary" fontSize="sm">работают сейчас</StatLabel>
          </Stat>
        </CardBody>
      </Card>
      <Card>
        <CardHeader p={4}><Heading size="sm" color="brand.500">Прорабов</Heading></CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          <Stat>
            <StatNumber color="text.primary" fontSize="2xl">{foremen}</StatNumber>
            <StatLabel color="text.secondary" fontSize="sm">руководящий состав</StatLabel>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
};

export default EmployeeStats; 