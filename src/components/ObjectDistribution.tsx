import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  SimpleGrid,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
  Icon,
  IconButton,
  Progress,
  Divider
} from '@chakra-ui/react';
import { Building2, Plus, XCircle, AlertCircle } from 'lucide-react';

interface ObjectDistributionItem {
  objectId: number;
  amount: number;
  comment?: string;
}

interface ObjectDistributionProps {
  objects: any[];
  distribution: ObjectDistributionItem[];
  totalAmount: number;
  onAddDistribution: (item: ObjectDistributionItem) => void;
  onRemoveDistribution: (index: number) => void;
  onUpdateDistribution: (index: number, field: 'amount' | 'comment', value: any) => void;
}

const ObjectDistribution: React.FC<ObjectDistributionProps> = ({
  objects,
  distribution,
  totalAmount,
  onAddDistribution,
  onRemoveDistribution,
  onUpdateDistribution
}) => {
  const [newItem, setNewItem] = React.useState<ObjectDistributionItem>({
    objectId: 0,
    amount: 0,
    comment: ''
  });

  const getTotalDistributed = () => {
    return distribution.reduce((total, item) => total + Number(item.amount || 0), 0);
  };

  const handleAdd = () => {
    if (!newItem.objectId || !newItem.amount) return;
    onAddDistribution(newItem);
    setNewItem({ objectId: 0, amount: 0, comment: '' });
  };

  const availableObjects = objects.filter(obj => 
    !distribution.some(item => item.objectId === obj.id)
  );

  return (
    <Box>
      <Heading size="sm" color="blue.600" mb={2}>
        🏢 Распределение по объектам
      </Heading>
      <Text fontSize="sm" color="gray.600" mb={4}>
        Распределите сумму счета между объектами строительства
      </Text>
      
      <VStack gap={4} align="stretch">
        {/* Форма добавления */}
        <Card variant="outline" borderColor="blue.200" bg="blue.50">
          <CardBody p={4}>
            <VStack gap={4} align="stretch">
              <HStack spacing={4}>
                <FormControl flex={2}>
                  <FormLabel fontSize="sm" mb={1}>Выберите объект</FormLabel>
                  <Select
                    value={newItem.objectId || ''}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      objectId: Number(e.target.value)
                    })}
                    placeholder="Выберите объект строительства"
                    size="md"
                    title="Выберите объект для распределения суммы"
                    aria-label="Выберите объект для распределения суммы"
                  >
                    {availableObjects.map(obj => (
                      <option key={obj.id} value={obj.id}>{obj.name}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl flex={1}>
                  <FormLabel fontSize="sm" mb={1}>Сумма, ₽</FormLabel>
                  <Input
                    type="number"
                    value={newItem.amount || ''}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      amount: Number(e.target.value)
                    })}
                    placeholder="0"
                    size="md"
                  />
                </FormControl>
                
                <Button
                  colorScheme="blue"
                  size="md"
                  leftIcon={<Icon as={Plus} />}
                  alignSelf="flex-end"
                  isDisabled={!newItem.objectId || !newItem.amount}
                  onClick={handleAdd}
                >
                  Добавить
                </Button>
              </HStack>
              
              <FormControl>
                <FormLabel fontSize="sm" mb={1}>Комментарий</FormLabel>
                <Input
                  value={newItem.comment || ''}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    comment: e.target.value
                  })}
                  placeholder="Назначение платежа или комментарий"
                  size="md"
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Список распределенных объектов */}
        {distribution.length > 0 ? (
          <>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {distribution.map((item, index) => (
                <Card 
                  key={index} 
                  variant="outline" 
                  borderColor="green.200"
                  bg="green.50"
                >
                  <CardBody p={4}>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={Building2} color="green.500" size={20} />
                          <Text fontWeight="bold" color="green.700" fontSize="md">
                            {objects.find(obj => obj.id === item.objectId)?.name || 'Неизвестный объект'}
                          </Text>
                        </HStack>
                        <IconButton
                          aria-label="Удалить объект"
                          icon={<Icon as={XCircle} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => onRemoveDistribution(index)}
                        />
                      </HStack>
                      
                      <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="green.600">Сумма</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.700">
                            ₽{Number(item.amount).toLocaleString('ru-RU')}
                          </Text>
                        </VStack>
                        
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => onUpdateDistribution(index, 'amount', Number(e.target.value))}
                          size="sm"
                          width="80px"
                          textAlign="right"
                        />
                      </HStack>
                      
                      <Input
                        value={item.comment || ''}
                        onChange={(e) => onUpdateDistribution(index, 'comment', e.target.value)}
                        placeholder="Добавить комментарий..."
                        size="sm"
                        bg="white"
                      />
                      
                      {item.comment && (
                        <Box p={2} bg="white" borderRadius="md" border="1px solid" borderColor="green.200">
                          <Text fontSize="sm" color="gray.700">
                            💬 {item.comment}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
            
            {/* Сводка распределения */}
            <Card variant="outline" borderColor="gray.300" bg="gray.50">
              <CardBody p={4}>
                <VStack spacing={3}>
                  <HStack justify="space-between" w="full">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">Всего распределено:</Text>
                      <Text fontSize="xl" fontWeight="bold" color={getTotalDistributed() === totalAmount ? "green.600" : "orange.600"}>
                        ₽{getTotalDistributed().toLocaleString('ru-RU')}
                      </Text>
                    </VStack>
                    
                    <VStack align="end" spacing={0}>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">Сумма счета:</Text>
                      <Text fontSize="xl" fontWeight="bold" color="blue.600">
                        ₽{totalAmount.toLocaleString('ru-RU')}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Progress 
                    value={totalAmount > 0 ? (getTotalDistributed() / totalAmount) * 100 : 0}
                    colorScheme={getTotalDistributed() === totalAmount ? "green" : "orange"}
                    size="lg"
                    borderRadius="md"
                    w="full"
                  />
                  
                  {getTotalDistributed() !== totalAmount && (
                    <Box p={3} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200" w="full">
                      <HStack>
                        <Icon as={AlertCircle} color="orange.500" />
                        <Text fontSize="sm" color="orange.700" fontWeight="medium">
                          {getTotalDistributed() > totalAmount
                            ? `Превышение на ₽${(getTotalDistributed() - totalAmount).toLocaleString('ru-RU')}`
                            : `Остаток ₽${(totalAmount - getTotalDistributed()).toLocaleString('ru-RU')}`}
                        </Text>
                      </HStack>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </>
        ) : (
          <Card variant="outline" borderColor="gray.200" bg="gray.50">
            <CardBody p={6} textAlign="center">
              <VStack spacing={3}>
                <Icon as={Building2} color="gray.400" boxSize={12} />
                <Text color="gray.500" fontSize="lg" fontWeight="medium">Объекты не выбраны</Text>
                <Text fontSize="sm" color="gray.400">
                  Добавьте объекты для распределения суммы счета
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default ObjectDistribution; 