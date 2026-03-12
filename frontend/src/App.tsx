import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import EventsList from './pages/EventsList';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent'; // <-- НОВИЙ ІМПОРТ
import MyEvents from './pages/MyEvents';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<EventsList />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="events/:id" element={<EventDetails />} />
        
        {/* НОВИЙ МАРШРУТ ДЛЯ РЕДАГУВАННЯ */}
        <Route path="events/:id/edit" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
        
        <Route path="create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
        <Route path="my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}