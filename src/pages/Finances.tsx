import React, { useState } from 'react';
import { 
  Container, VStack, HStack, Tabs, TabList, TabPanels, 
  TabPanel, Tab, Box, Card, CardBody, Grid, GridItem, 
  Stat, StatLabel, StatNumber, Heading, Text, Icon, 
  useColorModeValue
} from '@chakra-ui/react';
import { useFinanceData } from '@/modules/finances/hooks/useFinanceData';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { RequestsPanel } from '@/modules/finances/components/RequestsPanel';
import { InvoicesPanel } from '@/modules/finances/components/InvoicesPanel';
import { OperationModal } from '@/modules/finances/components/OperationModal';
import { ObjectDetailsModal } from '@/modules/finances/components/ObjectDetailsModal';
import { EmployeeDetailsModal } from '@/modules/finances/components/EmployeeDetailsModal';
import { FinanceSummary } from '@/modules/finances/components/FinanceSummary';
import { FinanceChart } from '@/modules/finances/components/FinanceChart';
import { FinanceJournal } from '@/modules/finances/components/FinanceJournal';
import { OtherExpensesTable } from '@/modules/finances/components/OtherExpensesTable';
import { SalariesTable } from '@/modules/finances/components/SalariesTable';
import { PurchasesTable } from '@/modules/finances/components/PurchasesTable';
import { BudgetPlanner } from '@/modules/finances/components/BudgetPlanner';
import { CashFlow } from '@/modules/finances/components/CashFlow';
import { ReceivablesPayables } from '@/modules/finances/components/ReceivablesPayables';
import { AbsencesTable } from '@/modules/finances/components/AbsencesTable';

const Finances: React.FC = () => {
  // Получение данных с помощью хука
  const { 
    objects, 
    users, 
    customers, 
    catalogItems, 
    requests, 
    invoices, 
    budgets, 
    purchases,
    salaries,
    objectFinances,
    employeeFinances,
    companySummary,
    isLoading,
    refetchRequests,
    refetchInvoices,
    refetchBudgets
  } = useFinanceData();

  // Состояния для UI
  const [tabIndex, setTabIndex] = useState(0);
  const [showRequestHistory, setShowRequestHistory] = useState(false);
  const [invoiceViewMode, setInvoiceViewMode] = useState<'cards' | 'list'>('cards');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('all');
  
  // Состояния для модальных окон
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
  const [isObjectDetailsModalOpen, setIsObjectDetailsModalOpen] = useState(false);
  const [isEmployeeDetailsModalOpen, setIsEmployeeDetailsModalOpen] = useState(false);
  
  // Состояния для операций
  const [operationType, setOperationType] = useState<string>('');
  const [operationTarget, setOperationTarget] = useState<any>(null);
  const [operationSource, setOperationSource] = useState<string>('other');
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  // Состояния для форм
  const [operationForm, setOperationForm] = useState<any>({});
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Цвета для UI
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Обработчики для объектов
  const handleObjectClick = (object: any) => {
    setSelectedObject(object);
    setIsObjectDetailsModalOpen(true);
  };

  // Обработчики для сотрудников
  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee(employee);
    setIsEmployeeDetailsModalOpen(true);
  };

  // Обработчик для добавления операций
  const handleAddOperation = (type: 'income' | 'expense' | 'salary' | 'consumption' | 'budget' | 'request', target?: any, source: 'objects' | 'settlements' | 'other' = 'other') => {
    setOperationType(type);
    setOperationTarget(target);
    setOperationSource(source);
    
    // Инициализация формы в зависимости от типа операции
    const today = new Date().toISOString().slice(0, 10);
    
    setOperationForm({
      date: today,
      ...(target?.id ? { object_id: target.id } : {}),
      ...(target?.uid ? { user_id: target.uid } : {}),
      ...(type === 'request' ? { urgency: 'medium' } : {}),
      ...(type === 'income' ? { income_type: 'invoice' } : {}),
      ...(type === 'expense' ? { expense_type: 'purchase' } : {}),
      ...(type === 'salary' ? { type: 'salary' } : {}),
      ...(type === 'consumption' ? { unit: 'шт' } : {})
    });
    
    setSelectedItemId('');
    setSelectedCustomerId('');
    setIsOperationModalOpen(true);
  };

  // Обработчик для просмотра заявки
  const handleViewRequest = (request: any) => {
    // Логика просмотра заявки
    console.log('View request:', request);
  };

  // Обработчик для редактирования заявки
  const handleEditRequest = (request: any) => {
    // Логика редактирования заявки
    console.log('Edit request:', request);
  };

  // Обработчик для одобрения заявки
  const handleApproveRequest = (requestId: number) => {
    // Логика одобрения заявки
    console.log('Approve request:', requestId);
  };

  // Обработчик для отклонения заявки
  const handleRejectRequest = (requestId: number) => {
    // Логика отклонения заявки
    console.log('Reject request:', requestId);
  };

  // Обработчик для просмотра счета
  const handleViewInvoice = (invoice: any) => {
    // Логика просмотра счета
    console.log('View invoice:', invoice);
  };

  // Обработчик для редактирования счета
  const handleEditInvoice = (invoice: any) => {
    // Логика редактирования счета
    console.log('Edit invoice:', invoice);
  };

  // Обработчик для скачивания PDF счета
  const handleDownloadInvoicePDF = (invoice: any) => {
    // Логика скачивания PDF счета
    console.log('Download invoice PDF:', invoice);
  };

  // Обработчик для отметки счета как оплаченного
  const handleMarkInvoicePaid = (invoice: any) => {
    // Логика отметки счета как оплаченного
    console.log('Mark invoice as paid:', invoice);
  };

  // Обработчик для выбора элемента каталога
  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    
    if (itemId && itemId !== 'new') {
      const item = catalogItems.find((i: any) => i.id === itemId);
      if (item) {
        setOperationForm(v => ({
          ...v,
          item_name: item.name,
          amount: item.price,
          unit: item.unit || 'шт'
        }));
      }
    }
  };

  // Обработчик для создания нового элемента каталога
  const handleCreateNewItem = () => {
    // Логика создания нового элемента каталога
    console.log('Create new item:', operationForm.new_item_name);
  };

  // Обработчик для выбора заказчика
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    
    if (customerId && customerId !== 'new') {
      const customer = customers.find((c: any) => c.id === customerId);
      if (customer) {
        setOperationForm(v => ({
          ...v,
          customer_id: customer.id,
          customer_name: customer.name
        }));
      }
    }
  };

  // Обработчик для создания нового заказчика
  const handleCreateNewCustomer = () => {
    // Логика создания нового заказчика
    console.log('Create new customer:', operationForm.new_customer_name);
  };

  // Обработчик для сброса форм
  const resetForms = () => {
    setOperationForm({});
    setSelectedItemId('');
    setSelectedCustomerId('');
  };

  // Обработчик для отправки операции
  const handleSubmitOperation = async () => {
    try {
      // Логика отправки операции
      console.log('Submit operation:', operationType, operationForm);
      
      // Закрытие модального окна и сброс форм
      setIsOperationModalOpen(false);
      resetForms();
      
      // Обновление данных в зависимости от типа операции
      if (operationType === 'request') {
        refetchRequests();
      } else if (operationType === 'income') {
        refetchInvoices();
      } else if (operationType === 'budget') {
        refetchBudgets();
      }
    } catch (error) {
      console.error('Error submitting operation:', error);
    }
  };

  return (
    <Container maxW="container.xl" py={6}>
      {/* Заголовок и сводка */}
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Финансы</Heading>
        </HStack>

        {/* Сводка по компании */}
        <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Доходы</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color="green.600">
                    ₽{companySummary.income.toLocaleString('ru-RU')}
                  </StatNumber>
                  <HStack color="green.500" fontSize="sm">
                    <Icon as={TrendingUp} />
                    <Text>+5% с прошлого месяца</Text>
                  </HStack>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Расходы</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color="red.600">
                    ₽{companySummary.expenses.toLocaleString('ru-RU')}
                  </StatNumber>
                  <HStack color="red.500" fontSize="sm">
                    <Icon as={TrendingDown} />
                    <Text>-2% с прошлого месяца</Text>
                  </HStack>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Прибыль</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color={companySummary.profit >= 0 ? 'blue.600' : 'red.600'}>
                    ₽{companySummary.profit.toLocaleString('ru-RU')}
                  </StatNumber>
                  <HStack color={companySummary.profit >= 0 ? 'blue.500' : 'red.500'} fontSize="sm">
                    <Icon as={companySummary.profit >= 0 ? TrendingUp : TrendingDown} />
                    <Text>{companySummary.profit >= 0 ? '+10%' : '-8%'} с прошлого месяца</Text>
                  </HStack>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Основные вкладки */}
        <Tabs index={tabIndex} onChange={setTabIndex} variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Обзор</Tab>
            <Tab>Счета</Tab>
            <Tab>Заявки</Tab>
            <Tab>Бюджеты</Tab>
            <Tab>Движение средств</Tab>
            <Tab>Объекты</Tab>
            <Tab>Сотрудники</Tab>
          </TabList>

          <TabPanels>
            {/* Вкладка "Обзор" */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <FinanceSummary companySummary={companySummary} />
                <FinanceChart data={objectFinances} />
                <FinanceJournal 
                  invoices={invoices} 
                  purchases={purchases} 
                  salaries={salaries} 
                  objects={objects} 
                  users={users} 
                  customers={customers}
                />
              </VStack>
            </TabPanel>

            {/* Вкладка "Счета" */}
            <TabPanel>
              <InvoicesPanel 
                invoices={invoices}
                objects={objects}
                customers={customers}
                invoiceStatusFilter={invoiceStatusFilter}
                setInvoiceStatusFilter={setInvoiceStatusFilter}
                invoiceViewMode={invoiceViewMode}
                setInvoiceViewMode={setInvoiceViewMode}
                handleAddOperation={handleAddOperation}
                handleViewInvoice={handleViewInvoice}
                handleEditInvoice={handleEditInvoice}
                handleDownloadInvoicePDF={handleDownloadInvoicePDF}
                handleMarkInvoicePaid={handleMarkInvoicePaid}
                bgColor={bgColor}
                borderColor={borderColor}
              />
            </TabPanel>

            {/* Вкладка "Заявки" */}
            <TabPanel>
              <RequestsPanel 
                requests={requests}
                objects={objects}
                users={users}
                showRequestHistory={showRequestHistory}
                setShowRequestHistory={setShowRequestHistory}
                handleAddOperation={handleAddOperation}
                handleViewRequest={handleViewRequest}
                handleEditRequest={handleEditRequest}
                handleApproveRequest={handleApproveRequest}
                handleRejectRequest={handleRejectRequest}
                bgColor={bgColor}
                borderColor={borderColor}
              />
            </TabPanel>

            {/* Вкладка "Бюджеты" */}
            <TabPanel>
              <BudgetPlanner 
                budgets={budgets} 
                objects={objects} 
                refetchBudgets={refetchBudgets} 
              />
            </TabPanel>

            {/* Вкладка "Движение средств" */}
            <TabPanel>
              <CashFlow 
                invoices={invoices} 
                purchases={purchases} 
                salaries={salaries} 
                objects={objects} 
                users={users} 
                customers={customers}
              />
            </TabPanel>

            {/* Вкладка "Объекты" */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="gray.700">Финансы по объектам</Heading>
                <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                  {objectFinances.map((obj) => (
                    <GridItem key={obj.id}>
                      <Card 
                        bg={bgColor} 
                        border="1px solid" 
                        borderColor={borderColor}
                        shadow="md"
                        transition="all 0.2s"
                        _hover={{ shadow: 'lg', transform: 'translateY(-2px)', cursor: 'pointer' }}
                        onClick={() => handleObjectClick(obj)}
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <Heading size="sm">{obj.name}</Heading>
                            <HStack justify="space-between">
                              <Text color="gray.500">Доходы:</Text>
                              <Text color="green.600" fontWeight="medium">
                                ₽{obj.income.toLocaleString('ru-RU')}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.500">Расходы:</Text>
                              <Text color="red.600" fontWeight="medium">
                                ₽{obj.expenses.toLocaleString('ru-RU')}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.500">Результат:</Text>
                              <Text color={obj.profit >= 0 ? 'blue.600' : 'red.600'} fontWeight="medium">
                                ₽{obj.profit.toLocaleString('ru-RU')}
                              </Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </GridItem>
                  ))}
                </Grid>
              </VStack>
            </TabPanel>

            {/* Вкладка "Сотрудники" */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="gray.700">Финансы по сотрудникам</Heading>
                <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                  {employeeFinances.map((emp) => (
                    <GridItem key={emp.uid}>
                      <Card 
                        bg={bgColor} 
                        border="1px solid" 
                        borderColor={borderColor}
                        shadow="md"
                        transition="all 0.2s"
                        _hover={{ shadow: 'lg', transform: 'translateY(-2px)', cursor: 'pointer' }}
                        onClick={() => handleEmployeeClick(emp)}
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <Heading size="sm">{emp.user?.full_name || emp.user?.username || `ID ${emp.uid}`}</Heading>
                            <HStack justify="space-between">
                              <Text color="gray.500">Начислено:</Text>
                              <Text color="blue.600" fontWeight="medium">
                                ₽{emp.accrued.toLocaleString('ru-RU')}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.500">Выплачено:</Text>
                              <Text color="green.600" fontWeight="medium">
                                ₽{emp.paid.toLocaleString('ru-RU')}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.500">{emp.debt > 0 ? 'Долг:' : 'Остаток:'}</Text>
                              <Text color={emp.debt > 0 ? 'red.600' : 'green.600'} fontWeight="medium">
                                ₽{Math.abs(emp.debt).toLocaleString('ru-RU')}
                              </Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </GridItem>
                  ))}
                </Grid>

                <Box mt={8}>
                  <SalariesTable salaries={salaries} objects={objects} users={users} />
                </Box>

                <Box mt={8}>
                  <AbsencesTable users={users} />
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Модальные окна */}
      <OperationModal
        isOpen={isOperationModalOpen}
        onClose={() => setIsOperationModalOpen(false)}
        operationType={operationType}
        operationTarget={operationTarget}
        operationSource={operationSource}
        objects={objects}
        users={users}
        customers={customers}
        catalogItems={catalogItems}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
        selectedCustomerId={selectedCustomerId}
        setSelectedCustomerId={setSelectedCustomerId}
        operationForm={operationForm}
        setOperationForm={setOperationForm}
        handleSubmitOperation={handleSubmitOperation}
        handleItemSelect={handleItemSelect}
        handleCreateNewItem={handleCreateNewItem}
        handleCustomerSelect={handleCustomerSelect}
        handleCreateNewCustomer={handleCreateNewCustomer}
        resetForms={resetForms}
      />

      <ObjectDetailsModal
        isOpen={isObjectDetailsModalOpen}
        onClose={() => setIsObjectDetailsModalOpen(false)}
        selectedObject={selectedObject}
        objectFinances={objectFinances}
        users={users}
        handleAddOperation={handleAddOperation}
      />

      <EmployeeDetailsModal
        isOpen={isEmployeeDetailsModalOpen}
        onClose={() => setIsEmployeeDetailsModalOpen(false)}
        selectedEmployee={selectedEmployee}
        salaries={salaries}
        objects={objects}
        handleAddOperation={handleAddOperation}
      />
    </Container>
  );
};

export default Finances;






