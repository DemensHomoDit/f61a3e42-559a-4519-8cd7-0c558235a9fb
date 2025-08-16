import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Select, HStack, VStack, Button, useToast } from "@chakra-ui/react";
import React from "react";

interface FormData {
  full_name: string; 
  role: string; 
  position: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isEditing?: boolean;
  onSubmit: () => void;
  loading?: boolean;
}

const EmployeeFormModal: React.FC<Props> = ({ isOpen, onClose, formData, setFormData, isEditing = false, onSubmit, loading = false }) => {
  const toast = useToast();
  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEditing ? 'Редактировать сотрудника' : 'Добавить нового сотрудника'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Полное имя</FormLabel>
              <Input 
                value={formData.full_name} 
                onChange={handleChange('full_name')} 
                placeholder="Иванов Иван Иванович" 
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Роль</FormLabel>
              <Select value={formData.role} onChange={handleChange('role')} aria-label="Выберите роль сотрудника">
                <option value="worker">Рабочий</option>
                <option value="foreman">Прораб</option>
                <option value="manager">Менеджер</option>
                <option value="admin">Администратор</option>
                <option value="accountant">Бухгалтер</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Должность</FormLabel>
              <Input 
                value={formData.position} 
                onChange={handleChange('position')} 
                placeholder="Монтажник, электрик, сварщик..." 
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack gap={3}>
            <Button variant="ghost" onClick={onClose}>Отмена</Button>
            <Button 
              variant={isEditing ? 'primary' : 'success'} 
              onClick={onSubmit} 
              isLoading={loading} 
              isDisabled={!formData.full_name || !formData.role}
            >
              {isEditing ? 'Сохранить' : 'Создать и перейти к профилю'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EmployeeFormModal; 