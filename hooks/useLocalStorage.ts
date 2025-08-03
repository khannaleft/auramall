
"use client";

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // State to store our value.
  // Initialize with initialValue to prevent hydration mismatch between server and client.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // This state tracks if the component has mounted, to avoid using browser APIs on the server.
  const [hasMounted, setHasMounted] = useState(false);

  // After the component mounts on the client, set the mounted flag to true.
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // When the component has mounted, read the initial value from localStorage.
  useEffect(() => {
    if (hasMounted) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading localStorage key “${key}”:`, error);
      }
    }
  }, [hasMounted, key]);

  // When storedValue changes (and the component has mounted), update localStorage.
  useEffect(() => {
    if (hasMounted) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
    }
  }, [key, storedValue, hasMounted]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;