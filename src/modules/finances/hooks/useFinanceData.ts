import { useQuery } from '@tanstack/react-query';
import { 
  getBudgets, 
  getCustomers, 
  getCatalogItems, 
  getPurchaseRequests,
  getReceivables
} from '@/api/client';

// Получаем базовый URL API из переменных окружения или используем localhost по умолчанию
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useFinanceData = () => {
  // Получение списка объектов
  const { 
    data: objects = [],
    isLoading: isLoadingObjects,
    error: objectsError
  } = useQuery({
    queryKey: ['objects'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/objects`);
        if (!response.ok) {
          throw new Error(`Failed to fetch objects: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching objects:', error);
        return [];
      }
    }
  });

  // Получение списка пользователей
  const { 
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/users`);
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    }
  });

  // Получение списка заказчиков
  const { 
    data: customers = [],
    isLoading: isLoadingCustomers,
    error: customersError
  } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/customers`);
        if (!response.ok) {
          throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
      }
    }
  });

  // Получение списка элементов каталога
  const { 
    data: catalogItems = [],
    isLoading: isLoadingCatalogItems,
    error: catalogItemsError
  } = useQuery({
    queryKey: ['catalogItems'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/items`);
        if (!response.ok) {
          throw new Error(`Failed to fetch catalog items: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching catalog items:', error);
        return [];
      }
    }
  });

  // Получение списка заявок на закупку
  const { 
    data: requests = [],
    isLoading: isLoadingRequests,
    error: requestsError,
    refetch: refetchRequests
  } = useQuery({
    queryKey: ['purchaseRequests'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/purchase-requests`);
        if (!response.ok) {
          throw new Error(`Failed to fetch purchase requests: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching purchase requests:', error);
        return [];
      }
    }
  });

  // Получение списка счетов
  const { 
    data: invoices = [],
    isLoading: isLoadingInvoices,
    error: invoicesError,
    refetch: refetchInvoices
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/invoices`);
        if (!response.ok) {
          throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }
    }
  });

  // Получение списка бюджетов
  const { 
    data: budgets = [],
    isLoading: isLoadingBudgets,
    error: budgetsError,
    refetch: refetchBudgets
  } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/budgets`);
        if (!response.ok) {
          throw new Error(`Failed to fetch budgets: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching budgets:', error);
        return [];
      }
    }
  });

  // Получение списка закупок
  const { 
    data: purchases = [],
    isLoading: isLoadingPurchases,
    error: purchasesError
  } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/purchases`);
        if (!response.ok) {
          throw new Error(`Failed to fetch purchases: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching purchases:', error);
        return [];
      }
    }
  });

  // Получение списка зарплат
  const { 
    data: salaries = [],
    isLoading: isLoadingSalaries,
    error: salariesError
  } = useQuery({
    queryKey: ['salaries'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/salaries`);
        if (!response.ok) {
          throw new Error(`Failed to fetch salaries: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching salaries:', error);
        return [];
      }
    }
  });

  // Вычисление финансовых данных по объектам
  const objectFinances = objects.map((obj: any) => {
    // Фильтруем счета по объекту
    const objectInvoices = Array.isArray(invoices) ? 
      invoices.filter((inv: any) => Number(inv?.object_id) === Number(obj?.id)) : [];
    
    // Фильтруем закупки по объекту
    const objectPurchases = Array.isArray(purchases) ? 
      purchases.filter((pur: any) => Number(pur?.object_id) === Number(obj?.id)) : [];
    
    // Фильтруем зарплаты по объекту
    const objectSalaries = Array.isArray(salaries) ? 
      salaries.filter((sal: any) => Number(sal?.object_id) === Number(obj?.id)) : [];
    
    // Фильтруем списания материалов по объекту
    const objectConsumption = Array.isArray(purchases) ? 
      purchases.filter((pur: any) => 
        Number(pur?.object_id) === Number(obj?.id) && pur?.status === 'stock_out'
      ) : [];
    
    // Рассчитываем доходы (сумма счетов)
    const income = objectInvoices.reduce((sum: number, inv: any) => sum + Number(inv?.amount || 0), 0);
    
    // Рассчитываем расходы (сумма закупок, зарплат и списаний)
    const expenses = (
      objectPurchases.reduce((sum: number, pur: any) => sum + Number(pur?.amount || 0), 0) +
      objectSalaries.reduce((sum: number, sal: any) => sum + Number(sal?.amount || 0), 0) +
      objectConsumption.reduce((sum: number, cons: any) => sum + Number(cons?.amount || 0), 0)
    );
    
    // Рассчитываем прибыль
    const profit = income - expenses;
    
    return {
      id: obj?.id,
      name: obj?.name,
      income,
      expenses,
      profit,
      invoices: objectInvoices,
      purchases: objectPurchases,
      salaries: objectSalaries,
      consumption: objectConsumption
    };
  });

  // Вычисление финансовых данных по сотрудникам
  const employeeFinances = users.map((user: any) => {
    // Фильтруем зарплаты по сотруднику
    const userSalaries = Array.isArray(salaries) ? 
      salaries.filter((sal: any) => Number(sal?.user_id) === Number(user?.id)) : [];
    
    // Рассчитываем начисленную сумму
    const accrued = userSalaries.reduce((sum: number, sal: any) => sum + Number(sal?.amount || 0), 0);
    
    // Рассчитываем выплаченную сумму (статус paid)
    const paid = userSalaries
      .filter((sal: any) => sal?.status === 'paid')
      .reduce((sum: number, sal: any) => sum + Number(sal?.amount || 0), 0);
    
    // Рассчитываем долг (разница между начисленным и выплаченным)
    const debt = accrued - paid;
    
    return {
      uid: user?.id,
      user,
      accrued,
      paid,
      debt
    };
  });

  // Вычисление общих финансовых показателей компании
  const companySummary = {
    income: Array.isArray(invoices) ? 
      invoices.reduce((sum: number, inv: any) => sum + Number(inv?.amount || 0), 0) : 0,
    expenses: (
      (Array.isArray(purchases) ? purchases.reduce((sum: number, pur: any) => sum + Number(pur?.amount || 0), 0) : 0) +
      (Array.isArray(salaries) ? salaries.reduce((sum: number, sal: any) => sum + Number(sal?.amount || 0), 0) : 0)
    ),
    profit: 0 // Вычисляется ниже
  };
  
  companySummary.profit = companySummary.income - companySummary.expenses;

  return {
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
    isLoading: (
      isLoadingObjects || isLoadingUsers || isLoadingCustomers || 
      isLoadingCatalogItems || isLoadingRequests || isLoadingInvoices || 
      isLoadingBudgets || isLoadingPurchases || isLoadingSalaries
    ),
    refetchRequests,
    refetchInvoices,
    refetchBudgets
  };
};

export default useFinanceData; 