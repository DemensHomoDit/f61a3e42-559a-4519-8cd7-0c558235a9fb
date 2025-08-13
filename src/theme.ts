import { extendTheme } from "@chakra-ui/react";

const colors = {
  // Основная природная палитра
  brand: {
    50: "#f0f4f1",   // Очень светлый туман
    100: "#dce1df",  // Утренний туман
    200: "#9bbf87",  // Лесная трава
    300: "#7b8e78",  // Холодный мох
    400: "#3f6b4e",  // Молодая ель
    500: "#2e4d38",  // Глубокая хвоя
    600: "#4f6f3e",  // Лист летний
    700: "#4a3b2a",  // Тёмная кора
    800: "#6b4f3f",  // Хвойная шишка
    900: "#2e4d38",  // Глубокая хвоя
  },
  
  // Древесные оттенки
  wood: {
    50: "#fdfcf9",   // Очень светлый
    100: "#d9d6cf",  // Серебристая берёза
    200: "#e8e0d0",  // Светло-бежевый
    300: "#7b5e3b",  // Молодая кора
    400: "#b97b4e",  // Сухой лист
    500: "#6b4f3f",  // Хвойная шишка
    600: "#4a3b2a",  // Тёмная кора
    700: "#3d2f1f",  // Очень тёмная кора
    800: "#2a1f15",  // Почти чёрная кора
    900: "#1a130d",  // Тень коры
  },
  
  // Нейтральные цвета - мягкие серые
  gray: {
    50: "#fafbfa",   // Почти белый с зелёным подтоном
    100: "#f5f6f5",  // Очень светлый серый
    200: "#e8ebe8",  // Светло-серый
    300: "#d1d6d1",  // Средне-светлый серый
    400: "#a3a8a3",  // Средний серый
    500: "#737873",  // Тёмно-серый
    600: "#525752",  // Очень тёмный серый
    700: "#404440",  // Почти чёрный
    800: "#262926",  // Тёмный
    900: "#171917",  // Очень тёмный
  },
  
  // Акцентные цвета - природные
  accent: {
    success: "#8fbf72",  // Лист весенний
    warning: "#b97b4e",  // Сухой лист
    error: "#d67b6b",    // Природный красный
    info: "#7b8e78",     // Холодный мох
  },
  
  // Текстовые цвета - мягкие
  text: {
    primary: "#2e4d38",    // Глубокая хвоя
    secondary: "#7b8e78",  // Холодный мох
    tertiary: "#a3a8a3",   // Средний серый
  },
  
  // Фоновые цвета - светлые и мягкие
  bg: {
    primary: "#fafbfa",    // Почти белый с зелёным подтоном
    secondary: "#ffffff",  // Чистый белый
    tertiary: "#f5f6f5",   // Очень светлый серый
    card: "#ffffff",       // Белые карточки
    sidebar: "#f8f9f8",    // Светло-серый для сайдбара
  },
  
  // Границы - мягкие и светлые
  border: {
    light: "#e8ebe8",      // Светло-серый - очень мягкий
    medium: "#d1d6d1",     // Средне-серый - мягкий
    dark: "#a3a8a3",       // Тёмно-серый - умеренный
  },
  
  // Тени - мягкие и естественные
  shadow: {
    sm: "0 1px 3px 0 rgba(46, 77, 56, 0.1), 0 1px 2px 0 rgba(46, 77, 56, 0.06)",
    md: "0 4px 6px -1px rgba(46, 77, 56, 0.1), 0 2px 4px -1px rgba(46, 77, 56, 0.06)",
    lg: "0 10px 15px -3px rgba(46, 77, 56, 0.1), 0 4px 6px -2px rgba(46, 77, 56, 0.05)",
    xl: "0 20px 25px -5px rgba(46, 77, 56, 0.1), 0 10px 10px -5px rgba(46, 77, 56, 0.04)",
  },
};

const styles = {
  global: {
    "html, body, #root": { 
      bg: "bg.primary", 
      color: "text.primary", 
      height: "100%",
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    body: { 
      fontSize: "14px",
      lineHeight: "1.6",
    },
    "*": { 
      borderColor: "border.light",
    },
  },
};

const components = {
  Button: {
    baseStyle: { 
      fontWeight: "600", 
      borderRadius: "8px",
      fontSize: "14px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        transform: "translateY(-1px)",
      },
      _active: { 
        transform: "translateY(0)" 
      },
    },
    variants: {
      primary: {
        bg: "brand.500",
        color: "white",
        _hover: { 
          bg: "brand.600", 
          boxShadow: "shadow.lg",
        },
      },
      secondary: {
        bg: "bg.secondary",
        color: "text.primary",
        border: "1px solid",
        borderColor: "border.medium",
        _hover: { 
          bg: "bg.tertiary",
          borderColor: "border.dark",
        },
      },
      ghost: {
        bg: "transparent",
        color: "text.secondary",
        _hover: { 
          bg: "bg.tertiary",
          color: "text.primary",
        },
      },
      success: {
        bg: "accent.success",
        color: "white",
        _hover: { 
          bg: "brand.400",
          boxShadow: "shadow.lg",
        },
      },
    },
    defaultProps: { variant: "primary" },
  },
  
  Card: {
    baseStyle: {
      container: { 
        bg: "bg.card", 
        borderRadius: "12px", 
        border: "1px solid",
        borderColor: "border.light",
        boxShadow: "shadow.sm",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
    variants: {
      elevated: {
        container: {
          boxShadow: "shadow.lg",
          borderColor: "border.medium",
        },
      },
      interactive: {
        container: {
          cursor: "pointer",
          _hover: {
            transform: "translateY(-4px)",
            boxShadow: "shadow.xl",
            borderColor: "border.medium",
          },
        },
      },
    },
  },
  
  Input: {
    baseStyle: {
      field: {
        bg: "bg.secondary",
        border: "1px solid",
        borderColor: "border.light",
        borderRadius: "8px",
        fontSize: "14px",
        transition: "all 0.2s ease",
        _focus: {
          borderColor: "brand.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
        },
        _hover: {
          borderColor: "border.medium",
        },
      },
    },
  },
  
  Select: {
    baseStyle: {
      field: {
        bg: "bg.secondary",
        border: "1px solid",
        borderColor: "border.light",
        borderRadius: "8px",
        fontSize: "14px",
        transition: "all 0.2s ease",
        _focus: {
          borderColor: "brand.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
        },
      },
    },
  },
  
  Table: {
    baseStyle: {
      table: {
        borderCollapse: "separate",
        borderSpacing: "0",
      },
      thead: {
        tr: {
          th: { 
            bg: "bg.tertiary",
            color: "text.primary", 
            fontWeight: "600", 
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderBottom: "1px solid",
            borderColor: "border.light",
            py: "12px",
            px: "16px",
          },
        },
      },
      tbody: {
        tr: {
          td: { 
            fontSize: "14px",
            py: "12px",
            px: "16px",
            borderBottom: "1px solid",
            borderColor: "border.light",
            transition: "background-color 0.2s ease",
          },
          _hover: { 
            bg: "bg.tertiary",
          },
          _last: {
            td: { borderBottom: "none" },
          },
        },
      },
    },
  },
  
  Badge: {
    baseStyle: {
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      transition: "all 0.2s ease",
    },
    variants: {
      success: {
        bg: "accent.success",
        color: "white",
      },
      warning: {
        bg: "accent.warning",
        color: "white",
      },
      error: {
        bg: "accent.error",
        color: "white",
      },
      info: {
        bg: "accent.info",
        color: "white",
      },
      brand: {
        bg: "brand.500",
        color: "white",
      },
    },
  },
  
  Heading: {
    baseStyle: {
      color: "text.primary",
      fontWeight: "600",
    },
    variants: {
      h1: {
        fontSize: "32px",
        lineHeight: "1.2",
      },
      h2: {
        fontSize: "24px",
        lineHeight: "1.3",
      },
      h3: {
        fontSize: "20px",
        lineHeight: "1.4",
      },
      h4: {
        fontSize: "16px",
        lineHeight: "1.5",
      },
    },
  },
  
  Text: {
    baseStyle: {
      color: "text.primary",
    },
    variants: {
      secondary: {
        color: "text.secondary",
      },
      tertiary: {
        color: "text.tertiary",
      },
    },
  },
  
  Divider: {
    baseStyle: {
      borderColor: "border.light",
    },
  },
  
  Modal: {
    baseStyle: {
      dialog: {
        bg: "bg.card",
        borderRadius: "12px",
        boxShadow: "shadow.xl",
      },
      header: {
        borderBottom: "1px solid",
        borderColor: "border.light",
        pb: "16px",
      },
      body: {
        py: "20px",
      },
      footer: {
        borderTop: "1px solid",
        borderColor: "border.light",
        pt: "16px",
      },
    },
  },
};

export const theme = extendTheme({
  styles,
  colors,
  fonts: {
    heading: "'Inter', system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif",
    body: "'Inter', system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif",
  },
  config: { 
    initialColorMode: "light", 
    useSystemColorMode: false 
  },
  components,
}); 