import React from 'react';
import Sidebar from './components/Sidebar';
import CreateAppointment from './pages/appointment/Create';
import ListAppointment from './pages/appointment/List';
import TodayAppointment from './pages/appointment/Today';

function App() {
  return (
    <>
      <Sidebar />
      <CreateAppointment />
      <ListAppointment />
      <TodayAppointment />
    </>
  );
}

export default App;
