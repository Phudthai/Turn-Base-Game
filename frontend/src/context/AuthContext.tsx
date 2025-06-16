import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { User, AuthResponse, UserProfile } from "../types/types";
import { authAPI } from "../services/api";

// Auth state interface
interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  addCurrency: (gems: number, coins: number) => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("token"),
    isLoading: false,
    error: null,
  });

  // Auto-load profile if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      if (authState.token && !authState.user) {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        try {
          const response = await authAPI.getProfile(authState.token);
          if (response.success) {
            setAuthState((prev) => ({
              ...prev,
              user: response.user,
              isLoading: false,
              error: null,
            }));
          } else {
            throw new Error("Failed to load profile");
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          // Invalid token, clear it
          localStorage.removeItem("token");
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            error: "Session expired. Please login again.",
          });
        }
      }
    };

    initializeAuth();
  }, [authState.token, authState.user]);

  const login = async (username: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data: AuthResponse = await authAPI.login({ username, password });
      console.log("Login successful:", data);

      localStorage.setItem("token", data.token);

      // Get full profile after login
      const profileResponse = await authAPI.getProfile(data.token);
      if (profileResponse.success) {
        setAuthState({
          user: profileResponse.user,
          token: data.token,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error("Failed to load profile after login");
      }
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Login failed",
      }));
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data: AuthResponse = await authAPI.register({ username, password });
      localStorage.setItem("token", data.token);

      // Get full profile after registration
      const profileResponse = await authAPI.getProfile(data.token);
      if (profileResponse.success) {
        setAuthState({
          user: profileResponse.user,
          token: data.token,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error("Failed to load profile after registration");
      }
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Registration failed",
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  };

  const refreshProfile = async () => {
    if (!authState.token) return;

    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await authAPI.getProfile(authState.token);
      if (response.success) {
        setAuthState((prev) => ({
          ...prev,
          user: response.user,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error("Failed to refresh profile");
      }
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to refresh profile",
      }));
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.token) throw new Error("Not authenticated");

    try {
      const response = await authAPI.updateProfile(authState.token, updates);
      if (response.success) {
        await refreshProfile(); // Refresh to get updated data
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        error: error.message || "Failed to update profile",
      }));
      throw error;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!authState.token) throw new Error("Not authenticated");

    try {
      const response = await authAPI.changePassword(authState.token, {
        oldPassword,
        newPassword,
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        error: error.message || "Failed to change password",
      }));
      throw error;
    }
  };

  const addCurrency = async (gems: number, coins: number) => {
    if (!authState.token) throw new Error("Not authenticated");

    try {
      const response = await authAPI.addCurrency(authState.token, {
        gems,
        coins,
      });
      if (response.success) {
        await refreshProfile(); // Refresh to get updated currency
      } else {
        throw new Error(response.message || "Failed to add currency");
      }
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        error: error.message || "Failed to add currency",
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
    changePassword,
    addCurrency,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
