import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { auth, signInWithGoogle, signInEmail, signUpEmail, logOut } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: any | null;
  signInWithGoogle: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setIsGuest: (v: boolean) => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const fetchProfile = async (uid: string) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfile(docSnap.data());
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchProfile(u.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const handleSignUpEmail = async (email: string, pass: string, name: string) => {
    const res = await signUpEmail(email, pass);
    if (res.user) {
      await firebaseUpdateProfile(res.user, { displayName: name });
      const newProfile = {
        uid: res.user.uid,
        displayName: name,
        email: res.user.email,
        dailyKcalGoal: 2050,
        proteinGoal: 145,
        carbsGoal: 235,
        fatGoal: 56,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setProfile(newProfile);
    }
  };

  const handleSignInGoogle = async () => {
    const res = await signInWithGoogle();
    if (res.user) {
      const docRef = doc(db, 'users', res.user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const newProfile = {
          uid: res.user.uid,
          displayName: res.user.displayName,
          email: res.user.email,
          dailyKcalGoal: 2050,
          proteinGoal: 145,
          carbsGoal: 235,
          fatGoal: 56,
          updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      profile, 
      signInWithGoogle: handleSignInGoogle, 
      signInEmail, 
      signUpEmail: handleSignUpEmail, 
      logOut,
      refreshProfile: () => user ? fetchProfile(user.uid) : Promise.resolve(),
      isGuest,
      setIsGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
