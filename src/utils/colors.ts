export const colors = {
  primary: {
    50: '#f7f3ef',
    100: '#efe7df',
    200: '#decfbf',
    300: '#cdb79e',
    400: '#bc9f7e',
    500: '#ab875d',
    600: '#8B4513', // primary brown
    700: '#704e32',
    800: '#5e3c28',
    900: '#4c2c1e',
  },
  secondary: {
    50: '#edf6f3',
    100: '#dbeee7',
    200: '#b7dccf',
    300: '#93cab7',
    400: '#6fb89f',
    500: '#4ba687',
    600: '#2E8B57', // secondary green
    700: '#276745',
    800: '#214f37',
    900: '#1b3729',
  },
  accent: {
    50: '#f0f4f8',
    100: '#e1e9f1',
    200: '#c3d2e3',
    300: '#a6bcd5',
    400: '#88a5c7',
    500: '#6a8fb9',
    600: '#4682B4', // accent blue
    700: '#3b5d87',
    800: '#304967',
    900: '#253546',
  },
  success: {
    500: '#10B981',
    600: '#059669',
  },
  warning: {
    500: '#F59E0B',
    600: '#D97706',
  },
  error: {
    500: '#EF4444',
    600: '#DC2626',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

export const curveColors = [
  '#4682B4', // Steel Blue
  '#8B4513', // Saddle Brown
  '#2E8B57', // Sea Green
  '#800000', // Maroon
  '#4B0082', // Indigo
  '#556B2F', // Dark Olive Green
  '#8B008B', // Dark Magenta
  '#2F4F4F', // Dark Slate Gray
  '#8B0000', // Dark Red
  '#191970', // Midnight Blue
  '#006400', // Dark Green
  '#8B4500', // Dark Orange
  '#5F9EA0', // Cadet Blue
  '#6B8E23', // Olive Drab
  '#BC8F8F', // Rosy Brown
  '#483D8B', // Dark Slate Blue
];

export const getColorForCurve = (index: number): string => {
  return curveColors[index % curveColors.length];
};

export const trackBackgroundColors = [
  'rgba(245, 245, 245, 0.9)', // Light Gray
  'rgba(240, 248, 255, 0.9)', // Alice Blue
  'rgba(245, 255, 250, 0.9)', // Mint Cream
  'rgba(255, 250, 240, 0.9)', // Floral White
  'rgba(240, 255, 240, 0.9)', // Honeydew
];

export const getTrackBackgroundColor = (index: number): string => {
  return trackBackgroundColors[index % trackBackgroundColors.length];
};