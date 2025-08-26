export interface Theme {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  isDarkMode?: boolean;
  serious: {
    background: string;
    border: string;
    glow: string;
    text: string;
  };
  fun: {
    background: string;
    border: string;
    gradient: string;
    text: string;
  };
  input: {
    background: string;
    border: string;
    focus: string;
  };
  button: {
    background: string;
    hover: string;
    text: string;
  };
}

export const lightTheme: Theme = {
  background: '#ffffff',
  text: '#333333',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  isDarkMode: false,
  serious: {
    background: '#f8fafc',
    border: '#e2e8f0',
    glow: '#6366f1',
    text: '#1e293b',
  },
  fun: {
    background: '#fef3c7',
    border: '#f59e0b',
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)',
    text: '#92400e',
  },
  input: {
    background: '#ffffff',
    border: '#d1d5db',
    focus: '#6366f1',
  },
  button: {
    background: '#6366f1',
    hover: '#4f46e5',
    text: '#ffffff',
  },
};

export const darkTheme: Theme = {
  background: '#0f172a',
  text: '#f1f5f9',
  primary: '#818cf8',
  secondary: '#a78bfa',
  isDarkMode: true,
  serious: {
    background: '#1e293b',
    border: '#334155',
    glow: '#818cf8',
    text: '#f1f5f9',
  },
  fun: {
    background: '#451a03',
    border: '#f59e0b',
    gradient: 'linear-gradient(135deg, #451a03 0%, #92400e 50%, #f59e0b 100%)',
    text: '#fbbf24',
  },
  input: {
    background: '#1e293b',
    border: '#475569',
    focus: '#818cf8',
  },
  button: {
    background: '#818cf8',
    hover: '#6366f1',
    text: '#0f172a',
  },
};