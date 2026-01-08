import { createContext, useEffect, useState, PropsWithChildren } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorSchemeType = 'light' | 'dark';

export const ThemeContext = createContext<{
  colorScheme: ColorSchemeType;
  setColorScheme: (scheme: ColorSchemeType) => void;
}>({
  colorScheme: 'light',
  setColorScheme: () => {},
});

export function ThemeProvider({ children }: PropsWithChildren<{}>) {
  const systemScheme = useSystemColorScheme() as ColorSchemeType;
  const [colorScheme, setScheme] = useState<ColorSchemeType>(systemScheme);

  useEffect(() => {
    AsyncStorage.getItem('theme').then((value) => {
      if (value === 'light' || value === 'dark') {
        setScheme(value);
      }
    });
  }, []);

  const setColorScheme = (scheme: ColorSchemeType) => {
    setScheme(scheme);
    AsyncStorage.setItem('theme', scheme);
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}