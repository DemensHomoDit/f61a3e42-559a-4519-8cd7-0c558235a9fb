import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, updateUser, deleteUser } from "@/api/client";
import type { User } from "@/types";

export function useEmployees() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });

  const createMut = useMutation({
    mutationFn: (payload: Partial<User>) => createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { id: number; data: Partial<User> }) => updateUser(vars.id, vars.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  return {
    users,
    isLoading,
    createUser: createMut.mutate,
    updateUser: updateMut.mutate,
    deleteUser: deleteMut.mutate,
  };
}

export default useEmployees; 