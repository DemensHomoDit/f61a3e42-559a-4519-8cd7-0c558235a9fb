import React from 'react';
import { 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, 
  ModalFooter, ModalCloseButton, HStack, VStack, SimpleGrid, 
  Box, Text, Button, Avatar, Icon, Stat, StatLabel, StatNumber,
  Table, Thead, Tbody, Tr, Th, Td, Badge
} from '@chakra-ui/react';
import { User, Plus } from 'lucide-react';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmployee: any;
  salaries: any[];
  objects: any[];
  handleAddOperation: (type: string, target: any) => void;
}

export const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedEmployee,
  salaries,
  objects,
  handleAddOperation
}) => {
  if (!selectedEmployee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack gap={3}>
            <Avatar size="sm" bg="purple.100" icon={<Icon as={User} color="purple.600" />} />
            <Text>Детали сотрудника: {selectedEmployee?.user?.full_name || selectedEmployee?.user?.name || `ID ${selectedEmployee?.uid}`}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedEmployee && (
            <VStack gap={6} align="stretch">
              {/* Сводка */}
              <SimpleGrid columns={3} spacing={6}>
                <Stat p={4} bg="blue.50" borderRadius="lg">
                  <StatLabel color="blue.600">Начислено</StatLabel>
                  <StatNumber color="blue.700">₽{selectedEmployee.accrued.toLocaleString('ru-RU')}</StatNumber>
                </Stat>
                <Stat p={4} bg="green.50" borderRadius="lg">
                  <StatLabel color="green.600">Выплачено</StatLabel>
                  <StatNumber color="green.700">₽{selectedEmployee.paid.toLocaleString('ru-RU')}</StatNumber>
                </Stat>
                <Stat p={4} bg={selectedEmployee.debt > 0 ? 'red.50' : 'green.50'} borderRadius="lg">
                  <StatLabel color={selectedEmployee.debt > 0 ? 'red.600' : 'green.600'}>
                    {selectedEmployee.debt > 0 ? 'Долг' : 'Остаток'}
                  </StatLabel>
                  <StatNumber color={selectedEmployee.debt > 0 ? 'red.700' : 'green.700'}>
                    ₽{Math.abs(selectedEmployee.debt).toLocaleString('ru-RU')}
                  </StatNumber>
                </Stat>
              </SimpleGrid>

              {/* История начислений */}
              <Box>
                <Text fontSize="lg" fontWeight="medium" mb={4}>История начислений</Text>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Дата</Th>
                      <Th>Тип</Th>
                      <Th isNumeric>Сумма</Th>
                      <Th>Объект</Th>
                      <Th>Причина</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(salaries as any[])
                      .filter((s: any) => String(s.user_id) === selectedEmployee.uid)
                      .sort((a: any, b: any) => String(b.date || '').localeCompare(String(a.date || '')))
                      .map((s: any) => {
                        const o = objects.find((obj: any) => Number(obj.id) === Number(s.object_id));
                        return (
                          <Tr key={s.id}>
                            <Td fontSize="sm">{s.date || '—'}</Td>
                            <Td>
                              <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                                {s.type || 'salary'}
                              </Badge>
                            </Td>
                            <Td isNumeric fontWeight="medium">
                              ₽{Number(s.amount || 0).toLocaleString('ru-RU')}
                            </Td>
                            <Td fontSize="sm" color="gray.600">
                              {o?.name || '—'}
                            </Td>
                            <Td fontSize="sm" color="gray.600">
                              {s.reason || '—'}
                            </Td>
                          </Tr>
                        );
                      })}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <HStack gap={3}>
            <Button variant="ghost" onClick={onClose}>
              Закрыть
            </Button>
            <Button 
              colorScheme="green" 
              onClick={() => {
                handleAddOperation('salary', selectedEmployee);
                onClose();
              }}
            >
              Добавить начисление
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EmployeeDetailsModal; 