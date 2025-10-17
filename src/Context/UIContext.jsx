import { createContext, useContext, useMemo, useState } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [isContactOpen, setIsContactOpen] = useState(false);

  // useMemo so the object identity is stable unless the value changes
  const value = useMemo(() => ({ isContactOpen, setIsContactOpen }), [isContactOpen]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export const useUI = () => useContext(UIContext);
