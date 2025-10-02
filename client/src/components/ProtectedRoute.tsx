import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { token, loading } = useAuth();

    // Mientras se carga la información del localStorage, mostrar nada
    if (loading) {
        return <div>Loading...</div>;
    }

    // Si no hay token después de cargar, redirigir al login
    if (!token) return <Navigate to="/login" replace />;

    return children;
}