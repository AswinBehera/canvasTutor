import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ExportPanel } from './ExportPanel'; // Assuming ExportPanel is needed here
import type { AppState } from '../types';

interface FloatingHeaderProps {
  appState: AppState; // Pass appState for ExportPanel
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({ appState }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-4 bg-white shadow-md flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-primary">CanvasTutor</Link>
      <nav className="space-x-6 hidden md:block">
        <Link to="/features" className="text-sm font-medium hover:text-primary">Features</Link>
        <Link to="/pricing" className="text-sm font-medium hover:text-primary">Pricing</Link>
        <Link to="/about" className="text-sm font-medium hover:text-primary">About Us</Link>
        <Link to="/contact" className="text-sm font-medium hover:text-primary">Contact</Link>
      </nav>
      <div className="space-x-4">
        <Link to="/login"><Button variant="ghost" className="text-sm font-medium">Login</Button></Link>
        <Link to="/get-started"><Button className="text-sm font-medium">Get Started</Button></Link>
        <ExportPanel appState={appState} /> {/* ExportPanel is always shown on canvas page */}
      </div>
    </header>
  );
};