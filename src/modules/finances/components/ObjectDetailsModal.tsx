import React from 'react';
import { 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, 
  ModalFooter, ModalCloseButton, HStack, VStack, SimpleGrid, 
  Box, Text, Button, Avatar, Icon, Stat, StatLabel, StatNumber,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Heading
} from '@chakra-ui/react';
import { Building2, Plus, Eye, Edit } from 'lucide-react';
import { getStatusInRussian } from '../utils';

interface ObjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedObject: any;
  objectFinances: any[];
  users: any[];
  handleAddOperation: (type: string, target: any, source?: string) => void;
}

export const ObjectDetailsModal: React.FC<ObjectDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedObject,
  objectFinances,
  users,
  handleAddOperation
}) => {
  if (!selectedObject) return null;
  
  const obj = objectFinances.find(o => o.id === selectedObject.id);
  if (!obj) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack gap={3}>
            <Avatar size="sm" bg="green.100" icon={<Icon as={Building2} color="green.600" />} />
            <Text>Детали объекта: {selectedObject?.name}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={6} align="stretch">
            {/* Сводка */}
            <SimpleGrid columns={3} spacing={6}>
              <Stat p={4} bg="green.50" borderRadius="lg">
                <StatLabel color="green.600">Доходы</StatLabel>
                <StatNumber color="green.700">₽{obj.income.toLocaleString('ru-RU')}</StatNumber>
              </Stat>
              <Stat p={4} bg="red.50" borderRadius="lg">
                <StatLabel color="red.600">Расходы</StatLabel>
                <StatNumber color="red.700">₽{obj.expenses.toLocaleString('ru-RU')}</StatNumber>
              </Stat>
              <Stat p={4} bg={obj.profit >= 0 ? 'blue.50' : 'red.50'} borderRadius="lg">
                <StatLabel color={obj.profit >= 0 ? 'blue.600' : 'red.600'}>Результат</StatLabel>
                <StatNumber color={obj.profit >= 0 ? 'blue.700' : 'red.700'}>
                  ₽{obj.profit.toLocaleString('ru-RU')}
                </StatNumber>
              </Stat>
            </SimpleGrid>

            {/* Счета */}
            <Box>
              <Heading size="sm" mb={4}>Счета ({obj.invoices.length})</Heading>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>№</Th>
                    <Th>Дата</Th>
                    <Th isNumeric>Сумма</Th>
                    <Th>Статус</Th>
                    <Th>Заказчик</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {obj.invoices.map((inv: any) => (
                    <Tr key={inv.id}>
                      <Td>{inv.number || inv.id}</Td>
                      <Td fontSize="sm">{inv.date || '—'}</Td>
                      <Td isNumeric fontWeight="medium">
                        ₽{Number(inv.amount || 0).toLocaleString('ru-RU')}
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={inv.status === 'paid' ? 'green' : inv.status === 'overdue' ? 'red' : 'blue'} 
                          variant="subtle"
                          fontSize="xs"
                        >
                          {inv.status || '—'}
                        </Badge>
                      </Td>
                      <Td fontSize="sm" color="gray.600">{inv.customer || '—'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Закупки */}
            <Box>
              <Heading size="sm" mb={4}>Закупки ({obj.purchases.length})</Heading>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Товар/Услуга</Th>
                    <Th>Статус</Th>
                    <Th isNumeric>Сумма</Th>
                    <Th>Дата</Th>
                    <Th>Ответственный</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {obj.purchases.map((pur: any) => {
                    const u = users.find((user: any) => Number(user.id) === Number(pur.assignee_id));
                    return (
                      <Tr key={pur.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{pur.item || '—'}</Text>
                            {pur.notes && <Text fontSize="xs" color="gray.500">{pur.notes}</Text>}
                          </VStack>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              pur.status === 'completed' ? 'green' : 
                              pur.status === 'issued' ? 'blue' : 
                              pur.status === 'pending' ? 'yellow' : 'gray'
                            }
                            variant="subtle"
                            fontSize="xs"
                          >
                            {pur.status || '—'}
                          </Badge>
                        </Td>
                        <Td isNumeric fontWeight="medium">
                          ₽{Number(pur.amount || 0).toLocaleString('ru-RU')}
                        </Td>
                        <Td fontSize="sm">{pur.date || '—'}</Td>
                        <Td fontSize="sm" color="gray.600">
                          {u?.full_name || u?.username || '—'}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>

            {/* Зарплаты */}
            <Box>
              <Heading size="sm" mb={4}>Зарплаты ({obj.salaries.length})</Heading>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Сотрудник</Th>
                    <Th>Тип</Th>
                    <Th isNumeric>Сумма</Th>
                    <Th>Дата</Th>
                    <Th>Причина</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {obj.salaries.map((sal: any) => {
                    const u = users.find((user: any) => Number(user.id) === Number(sal.user_id));
                    return (
                      <Tr key={sal.id}>
                        <Td fontSize="sm" fontWeight="medium">
                          {u?.full_name || u?.username || `ID ${sal.user_id}`}
                        </Td>
                        <Td>
                          <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                            {sal.type || 'salary'}
                          </Badge>
                        </Td>
                        <Td isNumeric fontWeight="medium">
                          ₽{Number(sal.amount || 0).toLocaleString('ru-RU')}
                        </Td>
                        <Td fontSize="sm">{sal.date || '—'}</Td>
                        <Td fontSize="sm" color="gray.600">{sal.reason || '—'}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>

            {/* Складские списания */}
            <Box>
              <Heading size="sm" mb={4}>Складские списания ({obj.consumption.length})</Heading>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Материал</Th>
                    <Th>Количество</Th>
                    <Th isNumeric>Цена за ед.</Th>
                    <Th isNumeric>Сумма</Th>
                    <Th>Дата</Th>
                    <Th>Причина</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {obj.consumption.map((cons: any) => (
                    <Tr key={cons.id}>
                      <Td fontWeight="medium">{cons.item_name || '—'}</Td>
                      <Td fontSize="sm">
                        {Number(cons.quantity || 0).toLocaleString('ru-RU')} {cons.unit || 'шт'}
                      </Td>
                      <Td isNumeric fontSize="sm" color="gray.600">
                        ₽{Number(cons.unit_price || 0).toLocaleString('ru-RU')}
                      </Td>
                      <Td isNumeric fontWeight="medium">
                        ₽{Number(cons.total_amount || 0).toLocaleString('ru-RU')}
                      </Td>
                      <Td fontSize="sm">{cons.consumption_date || '—'}</Td>
                      <Td fontSize="sm" color="gray.600">{cons.reason || '—'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack gap={3}>
            <Button variant="ghost" onClick={onClose}>
              Закрыть
            </Button>
            <Button 
              colorScheme="green" 
              onClick={() => {
                handleAddOperation('income', selectedObject, 'objects');
                onClose();
              }}
            >
              Добавить операцию
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ObjectDetailsModal; 