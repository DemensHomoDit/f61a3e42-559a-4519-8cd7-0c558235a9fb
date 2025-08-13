import { Helmet } from "react-helmet-async";
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Card, 
  CardHeader, 
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  Switch,
  HStack,
  Divider
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings as apiGetSettings, putSetting as apiPutSetting } from "@/api/client";
import type { Setting } from "@/types";
import { useEffect, useState } from "react";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Settings = () => {
  const qc = useQueryClient();
  const { data: settings = [] } = useQuery<Setting[]>({ queryKey: ["settings"], queryFn: async () => await apiGetSettings() as any });
  const [local, setLocal] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings.length) {
      setLocal(Object.fromEntries(settings.map(s => [s.key, String(s.value)])));
    }
  }, [settings]);

  const { mutate: save } = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => apiPutSetting(key, value),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); },
  });

  const toggle = (key: string) => {
    const v = local[key];
    const next = (v === 'true') ? 'false' : 'true';
    setLocal((l) => ({ ...l, [key]: next }));
    save({ key, value: next });
  };

  return (
    <>
      <Helmet>
        <title>Настройки — ПромСтрой Контроль</title>
        <meta name="description" content="Настройки системы и пользователя." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="800px" mx="auto">
        <Box>
          <Heading size="lg" color="brand.500">Настройки</Heading>
          <Text color="text.secondary" mt={1}>Управление системой</Text>
        </Box>
        <VStack spacing={6}>
          <Card className="shadow-construction">
            <CardHeader>
              <Heading size="md">Флаги системы</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                {settings.map((s) => (
                  <HStack key={s.key} justify="space-between" w="full">
                    <Text color="text.secondary">{s.key}</Text>
                    <Switch 
                      isChecked={(local[s.key] ?? String(s.value)) === 'true'} 
                      onChange={() => toggle(s.key)} 
                    />
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </>
  );
};

export default Settings; 