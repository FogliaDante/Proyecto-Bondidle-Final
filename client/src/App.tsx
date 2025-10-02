import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GameSelector from './components/GameSelector';
import ClassicGame from './components/ClassicGame';
import RecorridoGame from './components/RecorridoGame';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import './styles.css';


export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<ProtectedRoute><GameSelector /></ProtectedRoute>} />
                <Route path="/classic" element={<ProtectedRoute><ClassicGame /></ProtectedRoute>} />
                <Route path="/recorrido" element={<ProtectedRoute><RecorridoGame /></ProtectedRoute>} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
            </Routes>
        </BrowserRouter>
    );
}
