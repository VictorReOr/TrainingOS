import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { registerUser } from '../services/sheets';

// ══════════════════════════════════════════════════════
// AuthContext — TrainingOS (Firebase Auth)
// Maneja el estado global del usuario (Atleta o Coach)
// ══════════════════════════════════════════════════════

const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Escuchar cambios de sesión en Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // En Firebase, si el usuario hace login, recuperamos su metadata de localStorage 
        // O lo ideal sería traer su info de la base de datos (sheets).
        // Por ahora lo guardamos igual en localStorage para mantener el rol y el nombre a mano.
        const localData = localStorage.getItem('trainingos_user_meta');
        if (localData) {
          setCurrentUser({ ...user, ...JSON.parse(localData) });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('trainingos_user_meta');
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  /**
   * Iniciar sesión
   */
  const login = async (email, password) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Registrar nueva cuenta
   */
  const register = async (email, password, name, role) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Guardar info extra localmente para no tener que consultarla constantemente
      const meta = { name, role, uid: user.uid };
      localStorage.setItem('trainingos_user_meta', JSON.stringify(meta));
      
      // Registrar el usuario en nuestro backend (Google Sheets) para enlazar UID
      await registerUser(user.uid, email, name, role);
      
      setCurrentUser({ ...user, ...meta });
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoading,
      error,
      login,
      register,
      logout
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
