import React, { useState } from 'react';
import './App.css';
import { Restaurants } from './Restaurants';
import { WeekDaySelector } from './WeekDaySelector';
import { currentWeekDay } from './helpers/date';

const App: React.FC = () => {
  const [weekDay, setWeekDay] = useState(currentWeekDay());

  return (
    <div className="App">
      <header className="App-header">
        <WeekDaySelector weekDay={weekDay} setWeekDay={setWeekDay} />
        <Restaurants weekDay={weekDay} />
      </header>
    </div>
  );
};

export default App;
