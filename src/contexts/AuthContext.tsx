import React, { createContext, useContext, useState, useEffect } from 'react';
import { PartnerAccount } from '../types/partner';

export type UserRole = 'landowner' | 'operator' | 'farmer' | 'expert' | 'gov_officer' | 'researcher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  farmId?: string;
  farmName?: string;
  compensation?: {
    type: 'salary' | 'commission' | 'hybrid';
    salaryMonthly?: number; // e.g. ₹40,000
    commissionPercent?: number; // e.g. 8%
  };
}

export const DEMO_PROFILES: Record<'rohan' | 'hariom', User> = {
  rohan: {
    id: 'usr_rohan_pune',
    email: 'rohan.creations@gmail.com',
    name: 'Rohan Deshmukh (Landowner)',
    role: 'landowner',
    location: 'Pune, Maharashtra (Remote Supervised)',
    bio: 'Digital Content Creator & Video Editor residing in Pune. Primary owner of 14.5-acre agricultural land in Nanded.',
    farmId: 'farm-nanded-01',
    farmName: 'Sahyadri Bio-Farms (Nanded)',
    phone: '+91 98230 45678',
  },
  hariom: {
    id: 'usr_hariom_nanded',
    email: 'hariom.operator@agrigpt.farm',
    name: 'Hariom Shinde (On-Field Partner)',
    role: 'operator',
    location: 'Nanded Farm, Maharashtra',
    bio: '30-year-old on-field operator managing daily field operations on Rohan’s land. Receives ₹40,000/mo salary + 8% yield commission.',
    farmId: 'farm-nanded-01',
    farmName: 'Sahyadri Bio-Farms (Nanded)',
    phone: '+91 94220 89123',
    compensation: {
      type: 'hybrid',
      salaryMonthly: 40000,
      commissionPercent: 8,
    },
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  switchUser: (target: 'rohan' | 'hariom') => void;
  switchRole: (role: UserRole) => void;
  partnerAccounts: PartnerAccount[];
  issuePartnerCredentials: (account: Omit<PartnerAccount, 'id' | 'createdAt'>) => PartnerAccount;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getUserIdFromEmail = (email: string): string => {
  return 'usr_' + email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
};

const DEFAULT_PARTNERS: PartnerAccount[] = [
  {
    id: 'part_hariom_01',
    ownerId: 'usr_rohan_pune',
    name: 'Hariom Shinde',
    username: 'HARIOM_NANDED_01',
    password: 'Farmer@Nanded2026',
    phone: '+91 94220 89123',
    farmId: 'farm-nanded-01',
    farmName: 'Sahyadri Bio-Farms (Nanded)',
    compensationType: 'hybrid',
    salaryMonthly: 40000,
    commissionPercent: 8,
    status: 'active',
    createdAt: '2026-09-01T08:00:00Z',
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_PROFILES.rohan);
  const [isLoading, setIsLoading] = useState(true);
  const [partnerAccounts, setPartnerAccounts] = useState<PartnerAccount[]>(DEFAULT_PARTNERS);

  useEffect(() => {
    // Check saved session on mount
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('agrigpt_user');
        const storedPartners = localStorage.getItem('agrigpt_partners');

        if (storedPartners) {
          try {
            setPartnerAccounts(JSON.parse(storedPartners));
          } catch {}
        } else {
          localStorage.setItem('agrigpt_partners', JSON.stringify(DEFAULT_PARTNERS));
        }

        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } else {
          // Default to Rohan (Landowner) for instant interactive experience
          setUser(DEMO_PROFILES.rohan);
          localStorage.setItem('agrigpt_user', JSON.stringify(DEMO_PROFILES.rohan));
        }
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (emailOrUsername: string, password?: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    const normalized = emailOrUsername.trim().toLowerCase();

    // Check if logging in as Rohan or Landowner
    if (normalized.includes('rohan') || normalized === 'rohan.creations@gmail.com') {
      setUser(DEMO_PROFILES.rohan);
      localStorage.setItem('agrigpt_user', JSON.stringify(DEMO_PROFILES.rohan));
      setIsLoading(false);
      return;
    }

    // Check if logging in as Hariom or partner credentials
    const foundPartner = partnerAccounts.find(
      p => p.username.toLowerCase() === normalized || p.name.toLowerCase().includes(normalized)
    );

    if (foundPartner || normalized.includes('hariom')) {
      const operatorUser: User = {
        ...DEMO_PROFILES.hariom,
        name: foundPartner ? foundPartner.name : DEMO_PROFILES.hariom.name,
        compensation: foundPartner
          ? {
              type: foundPartner.compensationType,
              salaryMonthly: foundPartner.salaryMonthly,
              commissionPercent: foundPartner.commissionPercent,
            }
          : DEMO_PROFILES.hariom.compensation,
      };
      setUser(operatorUser);
      localStorage.setItem('agrigpt_user', JSON.stringify(operatorUser));
      setIsLoading(false);
      return;
    }

    // Standard user fallback
    const userId = getUserIdFromEmail(emailOrUsername);
    const mockUser: User = {
      id: userId,
      email: emailOrUsername,
      name: emailOrUsername.split('@')[0],
      role: 'landowner',
      farmName: 'Family Agricultural Plot',
      location: 'Pune / Maharashtra',
    };

    setUser(mockUser);
    localStorage.setItem('agrigpt_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    await login('rohan.creations@gmail.com');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agrigpt_user');
  };

  const switchUser = (target: 'rohan' | 'hariom') => {
    const selected = DEMO_PROFILES[target];
    setUser(selected);
    localStorage.setItem('agrigpt_user', JSON.stringify(selected));
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem('agrigpt_user', JSON.stringify(updated));
  };

  const issuePartnerCredentials = (accountData: Omit<PartnerAccount, 'id' | 'createdAt'>): PartnerAccount => {
    const newAccount: PartnerAccount = {
      ...accountData,
      id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setPartnerAccounts(prev => {
      const next = [newAccount, ...prev];
      localStorage.setItem('agrigpt_partners', JSON.stringify(next));
      return next;
    });

    return newAccount;
  };

  const activeRole: UserRole = user?.role || 'landowner';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeRole,
        login,
        loginWithGoogle,
        logout,
        switchUser,
        switchRole,
        partnerAccounts,
        issuePartnerCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

