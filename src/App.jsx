import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import VetTips from './components/VetTips';
import Faq from './components/Faq';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import MainDashboardContainer from './components/MainDashboardContainer';
import ClinicLogin from './components/ClinicLogin';
import ClinicDashboard from './components/ClinicDashboard';
import { useAuth } from './auth/AuthProvider';

function ClinicRoute() {
  const { user, authLoading } = useAuth();
  const path = window.location.pathname;

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <p className="text-sm font-semibold text-slate-600 dark:text-gray-300">Checking clinic session…</p>
      </main>
    );
  }

  if (path === '/clinic/login') {
    if (user) {
      window.location.replace('/clinic/dashboard');
      return null;
    }

    return <ClinicLogin />;
  }

  if (path === '/clinic/dashboard') {
    if (!user) {
      window.location.replace('/clinic/login');
      return null;
    }

    return <ClinicDashboard />;
  }

  return null;
}

function PublicApp() {
  return (
    <div className="min-h-screen antialiased transition-colors duration-300 bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      <main>
        <Hero />
        <MainDashboardContainer />
        <Services />
        <About />
        <VetTips />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const isClinicRoute = window.location.pathname.startsWith('/clinic/');

  return isClinicRoute ? <ClinicRoute /> : <PublicApp />;
}
