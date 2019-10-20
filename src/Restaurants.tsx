import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

type Restaurant = {
  title: string;
  address: string;
  phone: string;
  menuItems: string[];
};

const GET_RESTAURANTS = gql`
  query getRestaurants($weekDay: Int) {
    restaurants(weekDay: $weekDay) {
      data {
        title
        address
        phone
        menuItems
      }
    }
  }
`;

export const Restaurants = ({ weekDay }: { weekDay: number }) => {
  const { loading, error, data } = useQuery(GET_RESTAURANTS, {
    variables: { weekDay }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{`Error! ${error.message}`}</p>;
  if (data.restaurants.data.length <= 0)
    return <p>No restaurants serves schnitzel this day...</p>;

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
