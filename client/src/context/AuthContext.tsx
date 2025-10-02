import React, { createContext, useContext, useEffect, useState } from 'react';


type AuthCtx = {
    user: any | null;
    token: string | null;
    login: (u: any, t: string) => void;
    logout: () => void;
};
const Ctx = createContext<AuthCtx>({ user: null, token: null, login: () => { }, logout: () => { } });
export const useAuth = () => useContext(Ctx);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        const t = localStorage.getItem('token');
        const u = localStorage.getItem('user');
        if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    }, []);
    const login = (u: any, t: string) => { setUser(u); setToken(t); localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); };
    const logout = () => { setUser(null); setToken(null); localStorage.removeItem('token'); localStorage.removeItem('user'); };
    return <Ctx.Provider value={{ user, token, login, logout }}>{children}</Ctx.Provider>;
};