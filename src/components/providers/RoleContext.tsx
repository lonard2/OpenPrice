'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/types/user';

export interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isContributor: boolean;
  isAdmin: boolean;
  isPublic: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const STORAGE_KEY = 'openprice_user_role';

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('public');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as UserRole;
      if (saved && (saved === 'public' || saved === 'contributor' || saved === 'admin')) {
        setRoleState(saved);
      }
    } catch {
      // Gracefully handle storage access restrictions
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(STORAGE_KEY, newRole);
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isContributor: role === 'contributor',
        isAdmin: role === 'admin',
        isPublic: role === 'public',
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleView(): RoleContextType {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleView must be used within a RoleProvider');
  }
  return context;
}
