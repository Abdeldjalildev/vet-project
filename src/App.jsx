import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import VetTips from './components/VetTips';
import Faq from './components/Faq';
import Footer from './components/Footer';
import i18n from './i18n/config';
import { Toaster } from 'react-hot-toast';
import MainDashboardContainer from './components/MainDashboardContainer';

export default function App() {
  return (
    <div className="min-h-screen antialiased transition-colors duration-300 bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      
      <main>
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