import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const FirebaseContext = createContext();

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <FirebaseContext.Provider value={{ currentUser, loading, signOut }}>
      {children}
    </FirebaseContext.Provider>
  );
};
