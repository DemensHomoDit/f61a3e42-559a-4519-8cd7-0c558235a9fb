import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  colors: {
    brand: {
      50: '#f0f7f4',
      100: '#dcebe3',
      200: '#c3dccf',
      300: '#9fc6b3',
      400: '#7aad95',
      500: '#5f947c',
      600: '#487364',
      700: '#395b51',
      800: '#2f4a42',
      900: '#283d37',
    },
  },
});

export default theme;


