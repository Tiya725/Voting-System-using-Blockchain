import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/api/client';
import toast from 'react-hot-toast';
import { ethers } from "ethers";

interface User {
  id: string;
  username: string;
  role: 'voter' | 'admin';
  address: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, voterId: string, village:string, district:string, state:string, country:string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('http://localhost:4000/api/login', { username, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return false;
    }
  };

  const register = async (username: string, password: string, voterId: string, village:string, district:string, state:string, country:string): Promise<boolean> => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      // Request user to connect MetaMask
      const [userAddress] = await window.ethereum.request({ method: "eth_requestAccounts" });
          console.log(userAddress)

      const response = await api.post('http://localhost:4000/api/register', { username, password,address:userAddress, voterId, village, district, state, country });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Registration successful!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
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
