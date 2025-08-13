import React, { useState } from 'react';
import { 
  VStack, HStack, Box, Card, CardHeader, CardBody, Heading, 
  Text, Button, IconButton, Input, FormControl, FormLabel, 
  Select, Badge, SimpleGrid, Divider, Icon, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react';
import { 
  GridIcon, List, Search, Plus, Eye, Edit, Download, FileText, 
  AlertCircle, Calendar, CheckCircle
} from 'lucide-react';
import { getStatusInRussian } from '../utils';

interface InvoicesPanelProps {
  invoices: any[];
  objects: any[];
  customers: any[];
  invoiceStatusFilter: string;
  setInvoiceStatusFilter: (value: string) => void;
  invoiceViewMode: 'cards' | 'list';
  setInvoiceViewMode: (value: 'cards' | 'list') => void;
  handleAddOperation: (type: string, target: any) => void;
  handleViewInvoice: (invoice: any) => void;
  handleEditInvoice: (invoice: any) => void;
  handleDownloadInvoicePDF: (invoice: any) => void;
  handleMarkInvoicePaid: (invoice: any) => void;
  bgColor: string;
  borderColor: string;
}

export const InvoicesPanel: React.FC<InvoicesPanelProps> = ({
  invoices,
  objects,
  customers,
  invoiceStatusFilter,
  setInvoiceStatusFilter,
  invoiceViewMode,
  setInvoiceViewMode,
  handleAddOperation,
  handleViewInvoice,
  handleEditInvoice,
  handleDownloadInvoicePDF,
  handleMarkInvoicePaid,
  bgColor,
  borderColor
}) => {
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceObjectFilter, setInvoiceObjectFilter] = useState('');
  const [invoiceCustomerFilter, setInvoiceCustomerFilter] = useState('');
  const [invoiceDateFilter, setInvoiceDateFilter] = useState('');
  const [invoiceMinAmount, setInvoiceMinAmount] = useState('');
  const [invoiceMaxAmount, setInvoiceMaxAmount] = useState('');

  // Фильтрация счетов
  const filteredInvoices = invoices.filter((inv: any) => {
    // Фильтр по статусу
    if (invoiceStatusFilter !== 'all' && inv.status !== invoiceStatusFilter) {
      return false;
    }

    // Поиск по номеру счета или описанию
    if (invoiceSearchQuery && 
        !String(inv.number || '').toLowerCase().includes(invoiceSearchQuery.toLowerCase()) &&
        !String(inv.description || '').toLowerCase().includes(invoiceSearchQuery.toLowerCase())) {
      return false;
    }

    // Фильтр по объекту
    if (invoiceObjectFilter && String(inv.object_id) !== invoiceObjectFilter) {
      return false;
    }

    // Фильтр по заказчику
    if (invoiceCustomerFilter && String(inv.customer_id) !== invoiceCustomerFilter) {
      return false;
    }

    // Фильтр по дате
    if (invoiceDateFilter && (!inv.date || inv.date !== invoiceDateFilter)) {
      return false;
    }

    // Фильтр по минимальной сумме
    if (invoiceMinAmount && Number(inv.amount || 0) < Number(invoiceMinAmount)) {
      return false;
    }

    // Фильтр по максимальной сумме
    if (invoiceMaxAmount && Number(inv.amount || 0) > Number(invoiceMaxAmount)) {
      return false;
    }

    return true;
  });

  // Сброс фильтров
  const resetInvoiceFilters = () => {
    setInvoiceStatusFilter('all');
    setInvoiceSearchQuery('');
    setInvoiceObjectFilter('');
    setInvoiceCustomerFilter('');
    setInvoiceDateFilter('');
    setInvoiceMinAmount('');
    setInvoiceMaxAmount('');
  };

  // Получение цвета для статуса счета
  const getStatusColorScheme = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'blue';
      case 'overdue': return 'red';
      default: return 'gray';
    }
  };

  return (
    <VStack gap={6} align="stretch">
      {/* Заголовок и кнопки */}
      <HStack justify="space-between" align="center">
        <Heading size="md" color="gray.700">Счета</Heading>
        <HStack gap={2}>
          {/* Кнопки переключения вида */}
          <HStack gap={1} p={1} bg="gray.100" borderRadius="md">
            <IconButton
              aria-label="Вид карточек"
              icon={<Icon as={GridIcon} />}
              size="sm"
              variant={invoiceViewMode === 'cards' ? 'solid' : 'ghost'}
              colorScheme={invoiceViewMode === 'cards' ? 'blue' : 'gray'}
              onClick={() => setInvoiceViewMode('cards')}
            />
            <IconButton
              aria-label="Вид списка"
              icon={<Icon as={List} />}
              size="sm"
              variant={invoiceViewMode === 'list' ? 'solid' : 'ghost'}
              colorScheme={invoiceViewMode === 'list' ? 'blue' : 'gray'}
              onClick={() => setInvoiceViewMode('list')}
            />
          </HStack>
          
          <Button 
            size="sm" 
            colorScheme="green" 
            leftIcon={<Icon as={Plus} />}
            onClick={() => handleAddOperation('income', null)}
          >
            Создать счет
          </Button>
        </HStack>
      </HStack>

      {/* Фильтры */}
      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack gap={4} align="stretch">
            <HStack gap={4} wrap="wrap">
              {/* Основные фильтры */}
              <FormControl maxW="200px">
                <FormLabel fontSize="sm">Статус</FormLabel>
                <Select 
                  id="invoice-status-filter"
                  value={invoiceStatusFilter}
                  onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                  size="sm"
                  width="auto"
                  title="Фильтр по статусу"
                  aria-label="Фильтр по статусу"
                >
                  <option value="all">Все статусы</option>
                  <option value="paid">Оплаченные</option>
                  <option value="pending">Ожидают оплаты</option>
                  <option value="overdue">Просроченные</option>
                </Select>
              </FormControl>

              <FormControl maxW="300px">
                <FormLabel fontSize="sm">Поиск по номеру</FormLabel>
                <Input 
                  placeholder="Номер счета, описание..."
                  value={invoiceSearchQuery}
                  onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  size="sm"
                />
              </FormControl>
              
              <FormControl maxW="200px">
                <FormLabel fontSize="sm">Объект</FormLabel>
                <Select 
                  id="invoice-object-filter"
                  value={invoiceObjectFilter}
                  onChange={(e) => setInvoiceObjectFilter(e.target.value)}
                  placeholder="Все объекты"
                  size="sm"
                  title="Фильтр по объекту"
                  aria-label="Фильтр по объекту"
                >
                  {objects.map((obj: any) => (
                    <option key={obj.id} value={obj.id}>{obj.name}</option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

            <HStack gap={4} wrap="wrap">
              {/* Дополнительные фильтры */}
              <FormControl maxW="200px">
                <FormLabel fontSize="sm">Заказчик</FormLabel>
                <Select 
                  id="invoice-customer-filter"
                  value={invoiceCustomerFilter}
                  onChange={(e) => setInvoiceCustomerFilter(e.target.value)}
                  placeholder="Все заказчики"
                  size="sm"
                  title="Фильтр по заказчику"
                  aria-label="Фильтр по заказчику"
                >
                  {customers.map((cust: any) => (
                    <option key={cust.id} value={cust.id}>{cust.name}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl maxW="150px">
                <FormLabel fontSize="sm">Дата</FormLabel>
                <Input 
                  type="date"
                  value={invoiceDateFilter}
                  onChange={(e) => setInvoiceDateFilter(e.target.value)}
                  size="sm"
                />
              </FormControl>
              
              <FormControl maxW="120px">
                <FormLabel fontSize="sm">Сумма от</FormLabel>
                <Input 
                  type="number"
                  placeholder="0"
                  value={invoiceMinAmount}
                  onChange={(e) => setInvoiceMinAmount(e.target.value)}
                  size="sm"
                />
              </FormControl>
              
              <FormControl maxW="120px">
                <FormLabel fontSize="sm">Сумма до</FormLabel>
                <Input 
                  type="number"
                  placeholder="∞"
                  value={invoiceMaxAmount}
                  onChange={(e) => setInvoiceMaxAmount(e.target.value)}
                  size="sm"
                />
              </FormControl>
              
              <Button 
                size="sm" 
                colorScheme="blue" 
                variant="outline"
                onClick={resetInvoiceFilters}
                alignSelf="flex-end"
              >
                Сбросить фильтры
              </Button>
            </HStack>
            
            {/* Индикатор активных фильтров */}
            {(invoiceStatusFilter !== 'all' || 
              invoiceSearchQuery || invoiceObjectFilter || invoiceCustomerFilter || 
              invoiceDateFilter || invoiceMinAmount || invoiceMaxAmount) && (
                <Text fontSize="sm" color="blue.600" fontWeight="medium">
                  Применены фильтры
                </Text>
              )}
          </VStack>
        </CardBody>
      </Card>

      {/* Отображение счетов в зависимости от выбранного вида */}
      {invoiceViewMode === 'cards' ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredInvoices.map((inv: any) => {
            const objectName = objects.find((o: any) => Number(o.id) === Number(inv.object_id))?.name;
            const customerName = customers.find((c: any) => Number(c.id) === Number(inv.customer_id))?.name;
            const statusColorScheme = getStatusColorScheme(inv.status);
            
            return (
              <Card 
                key={inv.id} 
                bg={bgColor} 
                border="1px solid" 
                borderColor={borderColor}
                shadow="md"
                transition="all 0.2s"
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
              >
                <CardHeader pb={2}>
                  <VStack align="start" spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Badge colorScheme={statusColorScheme}>
                        {getStatusInRussian(inv.status)}
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
                        {inv.date || '—'}
                      </Text>
                    </HStack>
                    <Heading size="sm">Счет №{inv.number || inv.id}</Heading>
                    {inv.description && (
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {inv.description}
                      </Text>
                    )}
                  </VStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack align="stretch" spacing={3}>
                    <Divider />
                    <VStack align="start" spacing={2}>
                      {customerName && (
                        <HStack justify="space-between" w="full">
                          <Text color="gray.500">Заказчик:</Text>
                          <Text color="gray.700" fontWeight="medium">{customerName}</Text>
                        </HStack>
                      )}
                      {objectName && (
                        <HStack justify="space-between" w="full">
                          <Text color="gray.500">Объект:</Text>
                          <Text color="gray.700" fontWeight="medium">{objectName}</Text>
                        </HStack>
                      )}
                      <HStack justify="space-between" w="full">
                        <Text color="gray.500">Сумма:</Text>
                        <Text color="gray.700" fontWeight="medium">
                          ₽{Number(inv.amount || 0).toLocaleString('ru-RU')}
                        </Text>
                      </HStack>
                    </VStack>
                    
                    <Divider />
                    
                    <HStack justify="space-between">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon as={Eye} />}
                        onClick={() => handleViewInvoice(inv)}
                        flex={1}
                      >
                        Просмотр
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon as={Edit} />}
                        onClick={() => handleEditInvoice(inv)}
                        flex={1}
                      >
                        Править
                      </Button>
                    </HStack>
                    
                    <HStack>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<Icon as={Download} />}
                        onClick={() => handleDownloadInvoicePDF(inv)}
                        flex={1}
                      >
                        PDF
                      </Button>
                      {inv.status !== 'paid' && (
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<Icon as={CheckCircle} />}
                          onClick={() => handleMarkInvoicePaid(inv)}
                          flex={1}
                        >
                          Оплачен
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
          
          {filteredInvoices.length === 0 && (
            <Card bg={bgColor} border="1px solid" borderColor={borderColor} gridColumn={{ md: 'span 2', lg: 'span 3' }}>
              <CardBody>
                <VStack py={6}>
                  <Icon as={FileText} size={48} color="gray.400" />
                  <Text fontSize="lg" fontWeight="medium" color="gray.600">
                    Счета не найдены
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
                    Создайте новый счет или измените параметры фильтрации
                  </Text>
                  
                  <HStack mt={4}>
                    <Button 
                      colorScheme="green" 
                      leftIcon={<Icon as={Plus} />}
                      onClick={() => handleAddOperation('income', null)}
                    >
                      Создать счет
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetInvoiceFilters}
                    >
                      Сбросить фильтры
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )}
        </SimpleGrid>
      ) : (
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Box overflowX="auto">
              <Table size="sm" variant="simple" aria-label="Таблица счетов" title="Таблица счетов">
                <Thead>
                  <Tr>
                    <Th>№</Th>
                    <Th>Дата</Th>
                    <Th>Заказчик</Th>
                    <Th>Объект</Th>
                    <Th isNumeric>Сумма</Th>
                    <Th>Статус</Th>
                    <Th>Действия</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredInvoices.map((inv: any) => {
                    const objectName = objects.find((o: any) => Number(o.id) === Number(inv.object_id))?.name;
                    const customerName = customers.find((c: any) => Number(c.id) === Number(inv.customer_id))?.name;
                    const statusColorScheme = getStatusColorScheme(inv.status);
                    
                    return (
                      <Tr key={inv.id}>
                        <Td fontWeight="medium">{inv.number || inv.id}</Td>
                        <Td>{inv.date || '—'}</Td>
                        <Td>{customerName || '—'}</Td>
                        <Td>{objectName || '—'}</Td>
                        <Td isNumeric fontWeight="medium">
                          ₽{Number(inv.amount || 0).toLocaleString('ru-RU')}
                        </Td>
                        <Td>
                          <Badge colorScheme={statusColorScheme}>
                            {getStatusInRussian(inv.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack>
                            <Button
                              size="xs"
                              variant="outline"
                              leftIcon={<Icon as={Eye} />}
                              onClick={() => handleViewInvoice(inv)}
                            >
                              Просмотр
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              leftIcon={<Icon as={Edit} />}
                              onClick={() => handleEditInvoice(inv)}
                            >
                              Править
                            </Button>
                            <Button
                              size="xs"
                              colorScheme="blue"
                              leftIcon={<Icon as={Download} />}
                              onClick={() => handleDownloadInvoicePDF(inv)}
                            >
                              PDF
                            </Button>
                            {inv.status !== 'paid' && (
                              <Button
                                size="xs"
                                colorScheme="green"
                                leftIcon={<Icon as={CheckCircle} />}
                                onClick={() => handleMarkInvoicePaid(inv)}
                              >
                                Оплачен
                              </Button>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                  {filteredInvoices.length === 0 && (
                    <Tr>
                      <Td colSpan={7}>
                        <VStack py={6}>
                          <Icon as={FileText} size={40} color="gray.400" />
                          <Text fontSize="md" fontWeight="medium" color="gray.600">
                            Счета не найдены
                          </Text>
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            Создайте новый счет или измените параметры фильтрации
                          </Text>
                          
                          <HStack mt={2}>
                            <Button 
                              size="sm"
                              colorScheme="green" 
                              leftIcon={<Icon as={Plus} />}
                              onClick={() => handleAddOperation('income', null)}
                            >
                              Создать счет
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline" 
                              onClick={resetInvoiceFilters}
                            >
                              Сбросить фильтры
                            </Button>
                          </HStack>
                        </VStack>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default InvoicesPanel; 