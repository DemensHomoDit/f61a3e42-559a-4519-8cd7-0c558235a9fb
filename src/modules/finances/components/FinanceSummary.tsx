import { SimpleGrid, Card, CardHeader, CardBody, Heading, Stat, StatNumber, StatLabel } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";

type Props = {
  totalPurchases: number; purchasesCount: number;
  totalSalaries: number; salariesCount: number;
  totalAbsences: number; absencesCount: number;
};

export const FinanceSummary: React.FC<Props> = ({ totalPurchases = 0, purchasesCount = 0, totalSalaries = 0, salariesCount = 0, totalAbsences = 0, absencesCount = 0 }) => {
  return (
    <SimpleGrid as={motion.div} layout columns={{ base: 1, md: 3 }} spacing={4}>
      <Card>
        <CardHeader p={4}><Heading size="sm" color="brand.500">Закупки</Heading></CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          <Stat>
            <StatNumber color="text.primary" fontSize="2xl">₽{(totalPurchases || 0).toLocaleString('ru-RU')}</StatNumber>
            <StatLabel color="text.secondary" fontSize="sm">Всего закупок: {purchasesCount || 0}</StatLabel>
          </Stat>
        </CardBody>
      </Card>
      <Card>
        <CardHeader p={4}><Heading size="sm" color="brand.500">Зарплаты</Heading></CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          <Stat>
            <StatNumber color="text.primary" fontSize="2xl">₽{(totalSalaries || 0).toLocaleString('ru-RU')}</StatNumber>
            <StatLabel color="text.secondary" fontSize="sm">Всего выплат: {salariesCount || 0}</StatLabel>
          </Stat>
        </CardBody>
      </Card>
      <Card>
        <CardHeader p={4}><Heading size="sm" color="brand.500">Отсутствия</Heading></CardHeader>
        <CardBody pt={0} px={4} pb={4}>
          <Stat>
            <StatNumber color="text.primary" fontSize="2xl">₽{(totalAbsences || 0).toLocaleString('ru-RU')}</StatNumber>
            <StatLabel color="text.secondary" fontSize="sm">Всего штрафов: {absencesCount || 0}</StatLabel>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
}; 