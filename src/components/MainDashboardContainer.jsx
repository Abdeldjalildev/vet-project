import React, { useState } from 'react';
import BookingForm from './BookingForm';
import AdminDashboard from './AdminDashboard';

export default function MainDashboardContainer() {
  // Encapsulated state logic hidden away from App.jsx
  const [appointments, setAppointments] = useState([
    { id: 1, petName: "Rex", petType: "dog", service: "vaccine", date: "2026-07-10" },
    { id: 2, petName: "Luna", petType: "cat", service: "checkup", date: "2026-07-12" }
  ]);

  const addAppointment = (newApp) => {
    setAppointments((prev) => [
      ...prev,
      { id: Date.now(), ...newApp }
    ]);
  };

  return (
    <>
      {/* Injecting data dynamic workers seamlessly via hooks */}
      <BookingForm onAddAppointment={addAppointment} />
      <AdminDashboard appointments={appointments} />
    </>
  );
}