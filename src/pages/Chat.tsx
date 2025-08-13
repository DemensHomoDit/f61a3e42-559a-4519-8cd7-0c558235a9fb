import { Helmet } from "react-helmet-async";
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Card, 
  CardHeader, 
  CardBody,
  Input,
  Button,
  HStack,
  Avatar,
  Divider
} from "@chakra-ui/react";
import { useState } from "react";
import { Send, Bot, User } from "lucide-react";

const canonical = typeof window !== 'undefined' ? window.location.href : '';

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Привет! Я ИИ-ассистент ПромСтрой Контроль. Чем могу помочь?", isBot: true, timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const newMessage = { id: Date.now(), text: input, isBot: false, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    
    // Имитация ответа бота
    setTimeout(() => {
      const botResponse = { 
        id: Date.now() + 1, 
        text: "Спасибо за сообщение! Я обрабатываю ваш запрос...", 
        isBot: true, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>ИИ Чат — ПромСтрой Контроль</title>
        <meta name="description" content="ИИ-ассистент для помощи в управлении проектами." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Box as="main" role="main" display="flex" flexDirection="column" gap={6} className="animate-fade-in" maxW="800px" mx="auto">
        <Box>
          <Heading size="lg" color="brand.500">ИИ Чат</Heading>
          <Text color="text.secondary" mt={1}>ИИ-ассистент для помощи</Text>
        </Box>

        <VStack spacing={4} align="stretch">
          {messages.map((msg) => (
            <HStack key={msg.id} alignItems="flex-start" spacing={2}>
              <Avatar size="sm" name={msg.isBot ? "Bot" : "User"} src={msg.isBot ? Bot : User} />
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" fontWeight="medium">{msg.isBot ? "Bot" : "User"}</Text>
                <Text>{msg.text}</Text>
                <Text fontSize="xs" color="text.secondary">{msg.timestamp.toLocaleTimeString()}</Text>
              </VStack>
            </HStack>
          ))}
        </VStack>

        <HStack spacing={2}>
          <Input
            placeholder="Введите сообщение"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          <Button onClick={sendMessage} leftIcon={<Send />}>Отправить</Button>
        </HStack>
      </Box>
    </>
  );
};

export default Chat; 