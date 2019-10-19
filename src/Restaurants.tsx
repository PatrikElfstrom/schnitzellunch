import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

type Restaurant = {
  title: string;
  address: string;
  phone: string;
  menuItems: [string];
};

const GET_RESTAURANTS = gql`
  {
    restaurants {
      data {
        title
        address
        phone
        menuItems
      }
    }
  }
`;

export const Restaurants = () => {
  const { loading, error, data } = useQuery(GET_RESTAURANTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{`Error! ${error.message}`}</p>;

  return (
    <ul>
      {data.restaurants.data.map((restaurant: Restaurant, index: number) => (
        <li key={index}>
          <h2>{restaurant.title}</h2>
          <small>Address: {restaurant.address}</small>
          <small>Phone: {restaurant.phone}</small>
          <ul>
            {restaurant.menuItems.map((menuItem, index) => (
              <li key={index}>{menuItem}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};
