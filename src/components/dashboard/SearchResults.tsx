import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

interface SearchResult {
  type: string;
  label: string;
  to: string;
}

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  onClearSearch: () => void;
}

export function SearchResults({ query, results, onClearSearch }: SearchResultsProps) {
  if (!query || results.length === 0) {
    return null;
  }

  return (
    <Box className="modern-card mb-6">
      <VStack align="stretch" spacing={3}>
        <Text className="font-semibold text-gray-800">Результаты поиска</Text>
        {results.map((m, idx) => (
          <HStack
            key={idx}
            as={Link}
            to={m.to}
            onClick={onClearSearch}
            className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            justify="space-between"
          >
            <VStack align="start" spacing={1}>
              <Text className="text-gray-500 text-sm">
                {m.type}
              </Text>
              <Text className="font-medium text-gray-800">
                {m.label}
              </Text>
            </VStack>
            <Box className="modern-badge">
              Открыть
            </Box>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
} 