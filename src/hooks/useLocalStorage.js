import { useState } from "react";

const useLocalStorage = (key, initialValue, saveInitialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
      try {
        const item = window.sessionStorage.getItem(key);
        !item && saveInitialValue && window.sessionStorage.setItem(key, JSON.stringify(initialValue))
        return item ? JSON.parse(item) : initialValue;

      } catch (error) {
        console.log(error);
        return initialValue;
      }
    });
  
    const setValue = (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
  
        setStoredValue(valueToStore);
  
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.log(error);
      }
    };
    return [storedValue, setValue];
  };

export default useLocalStorage