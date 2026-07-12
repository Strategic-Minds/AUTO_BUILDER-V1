'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
type Theme = 'dark'|'light';
interface ThemeCtx { theme: Theme; toggleTheme:()=>void; setTheme:(t:Theme)=>void; }
const ThemeContext = createContext<ThemeCtx>({theme:'dark',toggleTheme:()=>{},setTheme:()=>{}});
export function ThemeProvider({children}:{children:ReactNode}) {
  const [theme,setThemeState] = useState<Theme>('dark');
  const setTheme = (t:Theme) => {
    setThemeState(t);
    if(typeof window!=='undefined'){
      localStorage.setItem('xab-theme',t);
      document.documentElement.setAttribute('data-theme',t);
    }
  };
  useEffect(()=>{
    const s=localStorage.getItem('xab-theme') as Theme;
    if(s) { setThemeState(s); document.documentElement.setAttribute('data-theme',s); }
    else { document.documentElement.setAttribute('data-theme','dark'); }
  },[]);
  return <ThemeContext.Provider value={{theme,toggleTheme:()=>setTheme(theme==='dark'?'light':'dark'),setTheme}}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);

