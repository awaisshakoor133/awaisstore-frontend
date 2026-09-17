import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("awais-token") || null);
  const [loading, setLoading] = useState(true);

  // Set axios default auth header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API}/auth/me`);
        setUser(res.data.user);
      } catch (err) {
        console.error("Auth fetch error:", err);
        localStorage.removeItem("awais-token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  // Signup
  const signup = async (data) => {
    const res = await axios.post(`${API}/auth/signup`, data);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("awais-token", newToken);
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  // Login
  const login = async (data) => {
    const res = await axios.post(`${API}/auth/login`, data);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("awais-token", newToken);
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("awais-token");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully 👋");
  };

  // Update profile
  const updateProfile = async (data) => {
    const res = await axios.put(`${API}/auth/profile`, data);
    setUser(res.data.user);
    return res.data;
  };

  const value = {
    user,
    token,
    loading,
    signup,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}