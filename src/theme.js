import { createContext } from 'react'

export const themes = {
  light: {
    colors: {
      primary: '#e15f3a',
      accent: '#2f8f83',
      ink: '#1b1a17',
      muted: '#5b524a',
      surface: '#ffffff',
      border: '#e8d9cc',
      page: '#f8f6f2',
    },
  },
  dark: {
    colors: {
      primary: '#ff7a59',
      accent: '#4ec8b4',
      ink: '#f5f2ee',
      muted: '#c4beb7',
      surface: '#1f1b18',
      border: '#3b332d',
      page: '#14110f',
    },
  },
}

export const ThemeContext = createContext({
  theme: themes.dark,
  mode: 'dark',
  toggleTheme: () => {},
})
