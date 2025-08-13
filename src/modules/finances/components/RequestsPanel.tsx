import React, { useState } from 'react';
import { 
  VStack, HStack, Box, Card, CardHeader, CardBody, Heading, 
  Text, Button, IconButton, Input, FormControl, FormLabel, 
  Select, Badge, SimpleGrid, Divider, Icon, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react';
import { 
  GridIcon, List, Search, Plus, Eye, Edit, CheckCircle, XCircle, 
  Calendar, AlertTriangle, Clock
} from 'lucide-react';

interface RequestsPanelProps {
  requests: any[];
  objects: any[];
  users: any[];
  showRequestHistory: boolean;
  setShowRequestHistory: (value: boolean) => void;
  handleAddOperation: (type: string, target: any) => void;
  handleViewRequest: (request: any) => void;
  handleEditRequest: (request: any) => void;
  handleApproveRequest: (requestId: number) => void;
  handleRejectRequest: (requestId: number) => void;
  bgColor: string;
  borderColor: string;
}

export const RequestsPanel: React.FC<RequestsPanelProps> = ({
  requests,
  objects,
  users,
  showRequestHistory,
  setShowRequestHistory,
  handleAddOperation,
  handleViewRequest,
  handleEditRequest,
  handleApproveRequest,
  handleRejectRequest,
  bgColor,
  borderColor
}) => {
  const [requestsViewMode, setRequestsViewMode] = useState<'cards' | 'list'>('cards');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'completed' | 'all'>(
    showRequestHistory ? 'all' : 'pending'
  );
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [requestObjectFilter, setRequestObjectFilter] = useState('');
  const [requestUrgencyFilter, setRequestUrgencyFilter] = useState('');
  const [requestDateFilter, setRequestDateFilter] = useState('');
  const [requestMinPrice, setRequestMinPrice] = useState('');
  const [requestMaxPrice, setRequestMaxPrice] = useState('');

  // Фильтрация заявок
  const filteredRequests = requests.filter((req: any) => {
    // Фильтр по статусу
    if (requestStatusFilter !== 'all' && req.status !== requestStatusFilter) {
      return false;
    }

    // Поиск по тексту
    if (requestSearchQuery && !req.item_name?.toLowerCase().includes(requestSearchQuery.toLowerCase()) &&
        !req.description?.toLowerCase().includes(requestSearchQuery.toLowerCase())) {
      return false;
    }

    // Фильтр по объекту
    if (requestObjectFilter && String(req.object_id) !== requestObjectFilter) {
      return false;
    }

    // Фильтр по срочности
    if (requestUrgencyFilter && req.urgency !== requestUrgencyFilter) {
      return false;
    }

    // Фильтр по дате
    if (requestDateFilter && (!req.due_date || req.due_date !== requestDateFilter)) {
      return false;
    }

    // Фильтр по минимальной цене
    if (requestMinPrice && Number(req.estimated_price || 0) < Number(requestMinPrice)) {
      return false;
    }

    // Фильтр по максимальной цене
    if (requestMaxPrice && Number(req.estimated_price || 0) > Number(requestMaxPrice)) {
      return false;
    }

    return true;
  });

  // Сброс фильтров
  const resetRequestFilters = () => {
    setRequestStatusFilter(showRequestHistory ? 'all' : 'pending');
    setRequestSearchQuery('');
    setRequestObjectFilter('');
    setRequestUrgencyFilter('');
    setRequestDateFilter('');
    setRequestMinPrice('');
    setRequestMaxPrice('');
  };

  // Получение цвета для статуса заявки
  const getStatusColorScheme = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };

  // Получение текста для статуса заявки
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'approved': return 'Одобрено';
      case 'rejected': return 'Отклонено';
      case 'completed': return 'Выполнено';
      default: return status;
    }
  };

  // Получение цвета для срочности заявки
  const getUrgencyColorScheme = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'gray';
      case 'medium': return 'yellow';
      case 'high': return 'orange';
      case 'urgent': return 'red';
      default: return 'gray';
    }
  };

  // Получение текста для срочности заявки
  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'Низкая';
      case 'medium': return 'Средняя';
      case 'high': return 'Высокая';
      case 'urgent': return 'Срочно';
      default: return urgency;
    }
  };

  return (
    <VStack gap={6} align="stretch">
      {/* Заголовок и кнопки */}
      <HStack justify="space-between" align="center">
        <Heading size="md" color="gray.700">
          {showRequestHistory ? 'История заявок на закупки' : 'Заявки на закупки'}
        </Heading>
        <HStack gap={2}>
          {/* Кнопки переключения вида */}
          <HStack gap={1} p={1} bg="gray.100" borderRadius="md">
            <IconButton
              aria-label="Вид карточек"
              icon={<Icon as={GridIcon} />}
              size="sm"
              variant={requestsViewMode === 'cards' ? 'solid' : 'ghost'}
              colorScheme={requestsViewMode === 'cards' ? 'blue' : 'gray'}
              onClick={() => setRequestsViewMode('cards')}
            />
            <IconButton
              aria-label="Вид списка"
              icon={<Icon as={List} />}
              size="sm"
              variant={requestsViewMode === 'list' ? 'solid' : 'ghost'}
              colorScheme={requestsViewMode === 'list' ? 'blue' : 'gray'}
              onClick={() => setRequestsViewMode('list')}
            />
          </HStack>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowRequestHistory(!showRequestHistory);
              // Сбрасываем фильтры при переключении
              setRequestStatusFilter(!showRequestHistory ? 'all' : 'pending');
              setRequestSearchQuery('');
              setRequestDateFilter('');
              setRequestMinPrice('');
              setRequestMaxPrice('');
              setRequestObjectFilter('');
              setRequestUrgencyFilter('');
            }}
          >
            {showRequestHistory ? 'Активные заявки' : 'История'}
          </Button>
          
          <Button 
            size="sm" 
            colorScheme="green" 
            leftIcon={<Icon as={Plus} />}
            onClick={() => handleAddOperation('request', null)}
          >
            Создать заявку
          </Button>
        </HStack>
      </HStack>

      {/* Расширенные фильтры */}
      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack gap={4} align="stretch">
            <HStack gap={4} wrap="wrap">
              {/* Основные фильтры */}
              <FormControl maxW="200px">
                <FormLabel fontSize="sm">Статус</FormLabel>
                <Select 
                  id="request-status-filter"
                  value={requestStatusFilter}
                  onChange={(e) => setRequestStatusFilter(e.target.value as 'pending' | 'approved' | 'rejected' | 'completed' | 'all')}
                  size="sm"
                  title="Фильтр по статусу заявки"
                  aria-label="Фильтр по статусу заявки"
                >
                  <option value="pending">Ожидают</option>
                  <option value="all">Все статусы</option>
                  {showRequestHistory && (
                    <>
                      <option value="approved">Одобренные</option>
                      <option value="rejected">Отклоненные</option>
                      <option value="completed">Выполненные</option>
                    </>
                  )}
                </Select>
              </FormControl>

              <FormControl maxW="300px">
                <FormLabel fontSize="sm">Поиск по товару</FormLabel>
                <Input 
                  placeholder="Название товара, описание..."
                  value={requestSearchQuery}
                  onChange={(e) => setRequestSearchQuery(e.target.value)}
                  size="sm"
                />
              </FormControl>
              
              <FormControl maxW="200px">
                <FormLabel fontSize="sm">Объект</FormLabel>
                <Select 
                  id="request-object-filter"
                  value={requestObjectFilter}
                  onChange={(e) => setRequestObjectFilter(e.target.value)}
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
              <FormControl maxW="150px">
                <FormLabel fontSize="sm">Срочность</FormLabel>
                <Select 
                  id="request-urgency-filter"
                  value={requestUrgencyFilter}
                  onChange={(e) => setRequestUrgencyFilter(e.target.value)}
                  placeholder="Любая"
                  size="sm"
                  title="Фильтр по срочности"
                  aria-label="Фильтр по срочности"
                >
                  <option value="low">Низкая</option>
                  <option value="medium">Средняя</option>
                  <option value="high">Высокая</option>
                  <option value="urgent">Срочно</option>
                </Select>
              </FormControl>
              
              <FormControl maxW="150px">
                <FormLabel fontSize="sm">Дата поставки</FormLabel>
                <Input 
                  type="date"
                  value={requestDateFilter}
                  onChange={(e) => setRequestDateFilter(e.target.value)}
                  size="sm"
                />
              </FormControl>
              
              <FormControl maxW="120px">
                <FormLabel fontSize="sm">Цена от</FormLabel>
                <Input 
                  type="number"
                  placeholder="0"
                  value={requestMinPrice}
                  onChange={(e) => setRequestMinPrice(e.target.value)}
                  size="sm"
                />
              </FormControl>
              
              <FormControl maxW="120px">
                <FormLabel fontSize="sm">Цена до</FormLabel>
                <Input 
                  type="number"
                  placeholder="∞"
                  value={requestMaxPrice}
                  onChange={(e) => setRequestMaxPrice(e.target.value)}
                  size="sm"
                />
              </FormControl>
              
              <Button 
                size="sm" 
                colorScheme="blue" 
                variant="outline"
                onClick={resetRequestFilters}
                alignSelf="flex-end"
              >
                Сбросить фильтры
              </Button>
            </HStack>
            
            {/* Индикатор активных фильтров */}
            {(requestStatusFilter !== (showRequestHistory ? 'all' : 'pending') || 
              requestSearchQuery || requestObjectFilter || requestUrgencyFilter || 
              requestDateFilter || requestMinPrice || requestMaxPrice) && (
                <Text fontSize="sm" color="blue.600" fontWeight="medium">
                  Применены фильтры
                </Text>
              )}
          </VStack>
        </CardBody>
      </Card>

      {/* Отображение заявок в зависимости от выбранного вида */}
      {requestsViewMode === 'cards' ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredRequests.map((req: any) => {
            const objectName = objects.find((o: any) => Number(o.id) === Number(req.object_id))?.name;
            const requester = users.find((u: any) => Number(u.id) === Number(req.requested_by));
            const statusColorScheme = getStatusColorScheme(req.status);
            const urgencyColorScheme = getUrgencyColorScheme(req.urgency);
            
            return (
              <Card 
                key={req.id} 
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
                        {getStatusText(req.status)}
                      </Badge>
                      <Badge colorScheme={urgencyColorScheme} variant="outline">
                        {getUrgencyText(req.urgency)}
                      </Badge>
                    </HStack>
                    <Heading size="sm">{req.item_name}</Heading>
                    {req.description && (
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {req.description}
                      </Text>
                    )}
                  </VStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack align="stretch" spacing={3}>
                    <Divider />
                    <VStack align="start" spacing={2}>
                      {objectName && (
                        <HStack justify="space-between" w="full">
                          <Text color="gray.500">Объект:</Text>
                          <Text color="gray.700" fontWeight="medium">{objectName}</Text>
                        </HStack>
                      )}
                      {req.estimated_price && (
                        <HStack justify="space-between" w="full">
                          <Text color="gray.500">Цена:</Text>
                          <Text color="gray.700" fontWeight="medium">
                            ₽{Number(req.estimated_price).toLocaleString('ru-RU')}
                          </Text>
                        </HStack>
                      )}
                      {req.due_date && (
                        <HStack justify="space-between" w="full">
                          <Text color="gray.500">Срок:</Text>
                          <Text color="gray.700" fontWeight="medium">
                            {req.due_date}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                    
                    <Divider />
                    
                    <HStack justify="space-between">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon as={Eye} />}
                        onClick={() => handleViewRequest(req)}
                        flex={1}
                      >
                        Просмотр
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Icon as={Edit} />}
                        onClick={() => handleEditRequest(req)}
                        flex={1}
                      >
                        Править
                      </Button>
                    </HStack>
                    
                    {req.status === 'pending' && (
                      <HStack>
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<Icon as={CheckCircle} />}
                          onClick={() => handleApproveRequest(req.id)}
                          flex={1}
                        >
                          Одобрить
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          leftIcon={<Icon as={XCircle} />}
                          onClick={() => handleRejectRequest(req.id)}
                          flex={1}
                        >
                          Отклонить
                        </Button>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
          
          {filteredRequests.length === 0 && (
            <Card bg={bgColor} border="1px solid" borderColor={borderColor} gridColumn={{ md: 'span 2', lg: 'span 3' }}>
              <CardBody>
                <VStack py={6}>
                  <Icon as={showRequestHistory ? Calendar : AlertTriangle} size={48} color="gray.400" />
                  <Text fontSize="lg" fontWeight="medium" color="gray.600">
                    {showRequestHistory 
                      ? 'История заявок пуста' 
                      : 'Нет активных заявок на закупки'}
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
                    {showRequestHistory 
                      ? 'Заявки на закупки будут отображаться здесь после их создания' 
                      : 'Создайте новую заявку на закупку или измените параметры фильтрации'}
                  </Text>
                  
                  <HStack mt={4}>
                    <Button 
                      colorScheme="green" 
                      leftIcon={<Icon as={Plus} />}
                      onClick={() => handleAddOperation('request', null)}
                    >
                      Создать первую заявку
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetRequestFilters}
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
              <Table size="sm" variant="simple" aria-label="Таблица заявок на закупки" title="Таблица заявок на закупки">
                <Thead>
                  <Tr>
                    <Th>Товар</Th>
                    <Th>Статус</Th>
                    <Th>Срочность</Th>
                    <Th>Объект</Th>
                    <Th isNumeric>Цена</Th>
                    <Th>Срок</Th>
                    <Th>Действия</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredRequests.map((req: any) => {
                    const objectName = objects.find((o: any) => Number(o.id) === Number(req.object_id))?.name;
                    const statusColorScheme = getStatusColorScheme(req.status);
                    const urgencyColorScheme = getUrgencyColorScheme(req.urgency);
                    
                    return (
                      <Tr key={req.id}>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{req.item_name}</Text>
                            {req.description && (
                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                {req.description}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={statusColorScheme}>
                            {getStatusText(req.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={urgencyColorScheme} variant="outline">
                            {getUrgencyText(req.urgency)}
                          </Badge>
                        </Td>
                        <Td>{objectName || '—'}</Td>
                        <Td isNumeric fontWeight="medium">
                          {req.estimated_price ? `₽${Number(req.estimated_price).toLocaleString('ru-RU')}` : '—'}
                        </Td>
                        <Td>{req.due_date || '—'}</Td>
                        <Td>
                          <HStack>
                            <Button
                              size="xs"
                              variant="outline"
                              leftIcon={<Icon as={Eye} />}
                              onClick={() => handleViewRequest(req)}
                            >
                              Просмотр
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              leftIcon={<Icon as={Edit} />}
                              onClick={() => handleEditRequest(req)}
                            >
                              Править
                            </Button>
                            {req.status === 'pending' && (
                              <>
                                <Button
                                  size="xs"
                                  colorScheme="green"
                                  onClick={() => handleApproveRequest(req.id)}
                                >
                                  Одобрить
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  onClick={() => handleRejectRequest(req.id)}
                                >
                                  Отклонить
                                </Button>
                              </>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <Tr>
                      <Td colSpan={7}>
                        <VStack py={6}>
                          <Icon as={showRequestHistory ? Calendar : Clock} size={40} color="gray.400" />
                          <Text fontSize="md" fontWeight="medium" color="gray.600">
                            {showRequestHistory 
                              ? 'История заявок пуста' 
                              : 'Нет активных заявок на закупки'}
                          </Text>
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            {showRequestHistory 
                              ? 'Заявки на закупки будут отображаться здесь после их создания' 
                              : 'Создайте новую заявку или измените параметры фильтрации'}
                          </Text>
                          
                          <HStack mt={2}>
                            <Button 
                              size="sm"
                              colorScheme="green" 
                              leftIcon={<Icon as={Plus} />}
                              onClick={() => handleAddOperation('request', null)}
                            >
                              Создать первую заявку
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline" 
                              onClick={resetRequestFilters}
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

export default RequestsPanel; 