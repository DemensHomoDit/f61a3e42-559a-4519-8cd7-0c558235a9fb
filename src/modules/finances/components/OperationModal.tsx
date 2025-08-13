import React, { useState, useEffect } from 'react';
import { 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, 
  ModalFooter, ModalCloseButton, VStack, HStack, FormControl, 
  FormLabel, Input, Select, Button, Textarea, useToast, 
  Text, Tabs, TabList, TabPanels, TabPanel, Tab, Box,
  Divider, SimpleGrid, Badge, Avatar, Icon, Radio, RadioGroup,
  Stack, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import { 
  DollarSign, Building2, User, Package, FileText, 
  ShoppingCart, Receipt, Warehouse
} from 'lucide-react';

interface OperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operationType: string;
  operationTarget: any;
  operationSource: string;
  objects: any[];
  users: any[];
  customers: any[];
  catalogItems: any[];
  selectedItemId: string;
  setSelectedItemId: (value: string) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (value: string) => void;
  operationForm: any;
  setOperationForm: React.Dispatch<React.SetStateAction<any>>;
  handleSubmitOperation: () => Promise<void>;
  handleItemSelect: (itemId: string) => void;
  handleCreateNewItem: () => void;
  handleCustomerSelect: (customerId: string) => void;
  handleCreateNewCustomer: () => void;
  resetForms: () => void;
}

export const OperationModal: React.FC<OperationModalProps> = ({
  isOpen,
  onClose,
  operationType,
  operationTarget,
  operationSource,
  objects,
  users,
  customers,
  catalogItems,
  selectedItemId,
  setSelectedItemId,
  selectedCustomerId,
  setSelectedCustomerId,
  operationForm,
  setOperationForm,
  handleSubmitOperation,
  handleItemSelect,
  handleCreateNewItem,
  handleCustomerSelect,
  handleCreateNewCustomer,
  resetForms
}) => {
  const toast = useToast();
  
  // Обработка закрытия модального окна
  const handleClose = () => {
    resetForms();
    onClose();
  };
  
  // Получение заголовка модального окна
  const getModalTitle = () => {
    switch (operationType) {
      case 'income':
        return 'Добавление дохода';
      case 'expense':
        return 'Добавление расхода';
      case 'salary':
        return 'Начисление зарплаты';
      case 'consumption':
        return 'Списание материалов';
      case 'budget':
        return 'Добавление бюджетной строки';
      case 'request':
        return 'Создание заявки на закупку';
      default:
        return 'Добавление операции';
    }
  };
  
  // Получение иконки для типа операции
  const getOperationIcon = () => {
    switch (operationType) {
      case 'income':
        return DollarSign;
      case 'expense':
        return ShoppingCart;
      case 'salary':
        return User;
      case 'consumption':
        return Warehouse;
      case 'budget':
        return FileText;
      case 'request':
        return Package;
      default:
        return DollarSign;
    }
  };
  
  // Получение цвета для типа операции
  const getOperationColor = () => {
    switch (operationType) {
      case 'income':
        return 'green';
      case 'expense':
        return 'red';
      case 'salary':
        return 'purple';
      case 'consumption':
        return 'orange';
      case 'budget':
        return 'blue';
      case 'request':
        return 'yellow';
      default:
        return 'blue';
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack gap={3}>
            <Avatar 
              size="sm" 
              bg={`${getOperationColor()}.100`} 
              icon={<Icon as={getOperationIcon()} color={`${getOperationColor()}.600`} />} 
            />
            <Text>{getModalTitle()}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack gap={4} align="stretch">
            {/* Форма для дохода */}
            {operationType === 'income' && (
              <>
                <FormControl isRequired>
                  <FormLabel>Тип дохода</FormLabel>
                  <Select 
                    value={operationForm.income_type || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, income_type: e.target.value }))}
                    title="Тип дохода"
                    aria-label="Тип дохода"
                  >
                    <option value="invoice">Счет</option>
                    <option value="prepayment">Предоплата</option>
                    <option value="other">Прочее</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Заказчик</FormLabel>
                  <Select 
                    value={selectedCustomerId} 
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    title="Заказчик"
                    aria-label="Заказчик"
                  >
                    <option value="">Выберите заказчика</option>
                    {customers.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="new">+ Добавить нового заказчика</option>
                  </Select>
                </FormControl>
                
                {selectedCustomerId === 'new' && (
                  <FormControl isRequired>
                    <FormLabel>Новый заказчик</FormLabel>
                    <Input 
                      value={operationForm.new_customer_name || ''} 
                      onChange={(e) => setOperationForm(v => ({ ...v, new_customer_name: e.target.value }))}
                      placeholder="Название компании или ФИО"
                    />
                  </FormControl>
                )}
                
                <FormControl isRequired>
                  <FormLabel>Сумма</FormLabel>
                  <NumberInput 
                    value={operationForm.amount || ''} 
                    onChange={(valueString) => setOperationForm(v => ({ ...v, amount: valueString }))}
                    min={0}
                  >
                    <NumberInputField placeholder="Сумма в рублях" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Дата</FormLabel>
                  <Input 
                    type="date" 
                    value={operationForm.date || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, date: e.target.value }))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Объект</FormLabel>
                  <Select 
                    value={operationForm.object_id || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, object_id: e.target.value }))}
                    title="Объект"
                    aria-label="Объект"
                  >
                    <option value="">Не связано с объектом</option>
                    {objects.map((o: any) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Номер счета</FormLabel>
                  <Input 
                    value={operationForm.number || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, number: e.target.value }))}
                    placeholder="Например: 2023-001"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Описание</FormLabel>
                  <Textarea 
                    value={operationForm.description || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, description: e.target.value }))}
                    placeholder="Описание счета или услуги"
                  />
                </FormControl>
              </>
            )}
            
            {/* Форма для расхода */}
            {operationType === 'expense' && (
              <>
                <FormControl isRequired>
                  <FormLabel>Тип расхода</FormLabel>
                  <Select 
                    value={operationForm.expense_type || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, expense_type: e.target.value }))}
                    title="Тип расхода"
                    aria-label="Тип расхода"
                  >
                    <option value="purchase">Закупка</option>
                    <option value="service">Услуга</option>
                    <option value="rent">Аренда</option>
                    <option value="utility">Коммунальные платежи</option>
                    <option value="tax">Налоги</option>
                    <option value="other">Прочее</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Товар/Услуга</FormLabel>
                  <Select 
                    value={selectedItemId} 
                    onChange={(e) => handleItemSelect(e.target.value)}
                    title="Товар или услуга"
                    aria-label="Товар или услуга"
                  >
                    <option value="">Выберите товар или услугу</option>
                    {catalogItems
                      .filter((item: any) => !item.type || item.type === 'service' || item.type === 'product')
                      .map((item: any) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))
                    }
                    <option value="new">+ Добавить новый товар/услугу</option>
                  </Select>
                </FormControl>
                
                {selectedItemId === 'new' && (
                  <FormControl isRequired>
                    <FormLabel>Новый товар/услуга</FormLabel>
                    <Input 
                      value={operationForm.new_item_name || ''} 
                      onChange={(e) => setOperationForm(v => ({ ...v, new_item_name: e.target.value }))}
                      placeholder="Название товара или услуги"
                    />
                  </FormControl>
                )}
                
                <FormControl isRequired>
                  <FormLabel>Сумма</FormLabel>
                  <NumberInput 
                    value={operationForm.amount || ''} 
                    onChange={(valueString) => setOperationForm(v => ({ ...v, amount: valueString }))}
                    min={0}
                  >
                    <NumberInputField placeholder="Сумма в рублях" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Дата</FormLabel>
                  <Input 
                    type="date" 
                    value={operationForm.date || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, date: e.target.value }))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Объект</FormLabel>
                  <Select 
                    value={operationForm.object_id || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, object_id: e.target.value }))}
                    title="Объект"
                    aria-label="Объект"
                  >
                    <option value="">Не связано с объектом</option>
                    {objects.map((o: any) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Ответственный</FormLabel>
                  <Select 
                    value={operationForm.assignee_id || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, assignee_id: e.target.value }))}
                    title="Ответственный"
                    aria-label="Ответственный"
                  >
                    <option value="">Не назначен</option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.full_name || u.username}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Примечание</FormLabel>
                  <Textarea 
                    value={operationForm.notes || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, notes: e.target.value }))}
                    placeholder="Дополнительная информация"
                  />
                </FormControl>
              </>
            )}
            
            {/* Форма для зарплаты */}
            {operationType === 'salary' && (
              <>
                <FormControl isRequired>
                  <FormLabel>Сотрудник</FormLabel>
                  <Select 
                    value={operationForm.user_id || (operationTarget?.uid || '')} 
                    onChange={(e) => setOperationForm(v => ({ ...v, user_id: e.target.value }))}
                    isDisabled={!!operationTarget}
                    title="Сотрудник"
                    aria-label="Сотрудник"
                  >
                    <option value="">Выберите сотрудника</option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.full_name || u.username}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Тип начисления</FormLabel>
                  <Select 
                    value={operationForm.type || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, type: e.target.value }))}
                    title="Тип начисления"
                    aria-label="Тип начисления"
                  >
                    <option value="salary">Зарплата</option>
                    <option value="bonus">Премия</option>
                    <option value="advance">Аванс</option>
                    <option value="compensation">Компенсация</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Сумма</FormLabel>
                  <NumberInput 
                    value={operationForm.amount || ''} 
                    onChange={(valueString) => setOperationForm(v => ({ ...v, amount: valueString }))}
                    min={0}
                  >
                    <NumberInputField placeholder="Сумма в рублях" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Дата</FormLabel>
                  <Input 
                    type="date" 
                    value={operationForm.date || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, date: e.target.value }))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Объект</FormLabel>
                  <Select 
                    value={operationForm.object_id || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, object_id: e.target.value }))}
                    title="Объект"
                    aria-label="Объект"
                  >
                    <option value="">Не связано с объектом</option>
                    {objects.map((o: any) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Причина</FormLabel>
                  <Textarea 
                    value={operationForm.reason || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, reason: e.target.value }))}
                    placeholder="Причина начисления"
                  />
                </FormControl>
              </>
            )}
            
            {/* Форма для списания материалов */}
            {operationType === 'consumption' && (
              <>
                <FormControl isRequired>
                  <FormLabel>Материал</FormLabel>
                  <Select 
                    value={selectedItemId} 
                    onChange={(e) => handleItemSelect(e.target.value)}
                    title="Материал"
                    aria-label="Материал"
                  >
                    <option value="">Выберите материал</option>
                    {catalogItems
                      .filter((item: any) => item.type === 'materials' || item.type === 'consumables' || item.type === 'tools')
                      .map((item: any) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))
                    }
                    <option value="new">+ Добавить новый материал</option>
                  </Select>
                </FormControl>
                
                {selectedItemId === 'new' && (
                  <FormControl isRequired>
                    <FormLabel>Новый материал</FormLabel>
                    <Input 
                      value={operationForm.new_item_name || ''} 
                      onChange={(e) => setOperationForm(v => ({ ...v, new_item_name: e.target.value }))}
                      placeholder="Название материала"
                    />
                  </FormControl>
                )}
                
                <FormControl isRequired>
                  <FormLabel>Количество</FormLabel>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    value={operationForm.quantity}
                    onChange={(e) => setOperationForm(v => ({ ...v, quantity: e.target.value }))}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Единица измерения</FormLabel>
                  <Select 
                    value={operationForm.unit || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, unit: e.target.value }))}
                    title="Единица измерения"
                    aria-label="Единица измерения"
                  >
                    <option value="шт">шт</option>
                    <option value="кг">кг</option>
                    <option value="м">м</option>
                    <option value="м2">м²</option>
                    <option value="м3">м³</option>
                    <option value="л">л</option>
                    <option value="уп">уп</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Дата</FormLabel>
                  <Input 
                    type="date" 
                    value={operationForm.date || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, date: e.target.value }))}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Объект</FormLabel>
                  <Select 
                    value={operationForm.object_id || (operationTarget?.id || '')} 
                    onChange={(e) => setOperationForm(v => ({ ...v, object_id: e.target.value }))}
                    isDisabled={!!operationTarget}
                    title="Объект"
                    aria-label="Объект"
                  >
                    <option value="">Выберите объект</option>
                    {objects.map((o: any) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Причина списания</FormLabel>
                  <Textarea 
                    value={operationForm.reason || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, reason: e.target.value }))}
                    placeholder="Причина списания материала"
                  />
                </FormControl>
              </>
            )}
            
            {/* Форма для заявки на закупку */}
            {operationType === 'request' && (
              <>
                <FormControl isRequired>
                  <FormLabel>Наименование</FormLabel>
                  <Input 
                    value={operationForm.item_name || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, item_name: e.target.value }))}
                    placeholder="Название товара или услуги"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Описание</FormLabel>
                  <Textarea 
                    value={operationForm.description || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, description: e.target.value }))}
                    placeholder="Дополнительная информация, характеристики"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Ориентировочная цена</FormLabel>
                  <NumberInput 
                    value={operationForm.estimated_price || ''} 
                    onChange={(valueString) => setOperationForm(v => ({ ...v, estimated_price: valueString }))}
                    min={0}
                  >
                    <NumberInputField placeholder="Сумма в рублях" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Количество</FormLabel>
                  <NumberInput 
                    value={operationForm.quantity || ''} 
                    onChange={(valueString) => setOperationForm(v => ({ ...v, quantity: valueString }))}
                    min={1}
                  >
                    <NumberInputField placeholder="Количество" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Единица измерения</FormLabel>
                  <Select 
                    value={operationForm.unit || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, unit: e.target.value }))}
                    title="Единица измерения"
                    aria-label="Единица измерения"
                  >
                    <option value="шт">шт</option>
                    <option value="кг">кг</option>
                    <option value="м">м</option>
                    <option value="м2">м²</option>
                    <option value="м3">м³</option>
                    <option value="л">л</option>
                    <option value="уп">уп</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Срочность</FormLabel>
                  <Select 
                    value={operationForm.urgency || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, urgency: e.target.value }))}
                    title="Срочность"
                    aria-label="Срочность"
                  >
                    <option value="low">Низкая</option>
                    <option value="medium">Средняя</option>
                    <option value="high">Высокая</option>
                    <option value="urgent">Срочно</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Срок поставки</FormLabel>
                  <Input 
                    type="date" 
                    value={operationForm.due_date || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, due_date: e.target.value }))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Объект</FormLabel>
                  <Select 
                    value={operationForm.object_id || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, object_id: e.target.value }))}
                    title="Объект"
                    aria-label="Объект"
                  >
                    <option value="">Не связано с объектом</option>
                    {objects.map((o: any) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Ссылка на товар</FormLabel>
                  <Input 
                    value={operationForm.url || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, url: e.target.value }))}
                    placeholder="Ссылка на сайт поставщика"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Комментарий</FormLabel>
                  <Textarea 
                    value={operationForm.comment || ''} 
                    onChange={(e) => setOperationForm(v => ({ ...v, comment: e.target.value }))}
                    placeholder="Дополнительная информация для закупщика"
                  />
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <HStack gap={3}>
            <Button variant="ghost" onClick={handleClose}>
              Отмена
            </Button>
            <Button 
              colorScheme={getOperationColor()} 
              onClick={handleSubmitOperation}
            >
              Сохранить
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OperationModal; 