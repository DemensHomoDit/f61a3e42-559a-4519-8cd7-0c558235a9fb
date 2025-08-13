import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCatalogItems, createCatalogItem, updateCatalogItem, getSuppliers, createSupplier, updateSupplier, deleteCatalogItem, deleteSupplier, getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/api/client";

export function useCatalog() {
  const qc = useQueryClient();

  const common = { retry: 0, refetchOnWindowFocus: false as const };

  const { data: items = [] } = useQuery<any[]>({
    queryKey: ["catalog.items"],
    queryFn: getCatalogItems,
    ...common,
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["catalog.suppliers"],
    queryFn: getSuppliers,
    ...common,
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["catalog.customers"],
    queryFn: getCustomers,
    ...common,
  });

  const createItem = useMutation({
    mutationFn: async (payload: any) => createCatalogItem(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog.items"] })
  });

  const patchItem = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => updateCatalogItem(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog.items"] })
  });

  const createSupp = useMutation({
    mutationFn: async (payload: any) => createSupplier(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog.suppliers"] })
  });

  const patchSupp = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => updateSupplier(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog.suppliers"] })
  });

  const createCust = useMutation({
    mutationFn: async (payload: any) => createCustomer(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog.customers"] })
  });

  const patchCust = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => updateCustomer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog.customers"] })
  });

  const removeItem = useMutation({
    mutationFn: async (id: number) => deleteCatalogItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog.items"] })
  });
  const removeSupp = useMutation({
    mutationFn: async (id: number) => deleteSupplier(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog.suppliers"] })
  });
  const removeCust = useMutation({
    mutationFn: async (id: number) => deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalog.customers"] })
  });

  return { items, suppliers, customers, createItem, patchItem, createSupp, patchSupp, createCust, patchCust, removeItem, removeSupp, removeCust };
} 