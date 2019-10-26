import React, { useState } from 'react';
import './App.css';
import { Restaurants } from './Restaurants';
import { WeekDaySelector } from './WeekDaySelector';
import { currentWeekDay, currentWeek } from './helpers/date';

const App: React.FC = () => {
  const [weekDay, setWeekDay] = useState(currentWeekDay());
  const [week, setWeek] = useState(currentWeek());

  return (
    <div className="App">
      <header className="App-header">
        <WeekDaySelector weekDay={weekDay} setWeekDay={setWeekDay} />
        <Restaurants weekDay={weekDay} week={week} />
      </header>
    </div>
  );
};

export default App;
