import React from 'react';
import useAxios from 'axios-hooks';
import logo from './logo.svg';
import './App.css';

type Restaurant = {
  title: string,
  address: string,
  phone: string,
  menuItems: [string]
};

const App: React.FC = () => {
  const [{ data, loading, error }] = useAxios(
    '/.netlify/functions/kvartersmenyn'
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <ul>
        {data.map((restaurant: Restaurant) => (
          <li>
            <h2>{restaurant.title}</h2>
            <small>Address: {restaurant.address}</small>
            <small>Phone: {restaurant.phone}</small>
            <ul>
              {restaurant.menuItems.map(menuItem => (
                <li>{menuItem}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
