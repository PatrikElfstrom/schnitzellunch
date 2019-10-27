import faunadb from 'faunadb';

const query = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
});

const getRestaurant = restaurant =>
  client
    .query(
      query.Get(
        query.Match(query.Index('restaurant'), [
          restaurant.title,
          restaurant.weekDay,
          restaurant.week
        ])
      )
    )
    .then(response => {
      console.log(`Successfully matched: ${restaurant.title}`);

      return response;
    })
    .catch(error => {
      console.log(
        `Could not match: week: ${restaurant.week}, weekDay: ${restaurant.weekDay} - ${restaurant.title}`
      );

      throw error;
    });

const replaceRestaurant = ({ ref }, restaurant) =>
  client
    .query(query.Replace(ref, { data: restaurant }))
    .then(response => {
      console.log(
        `Successfully replaced: week: ${restaurant.week}, weekDay: ${restaurant.weekDay} - ${restaurant.title}`
      );

      return response;
    })
    .catch(error => {
      console.error(`Failed to replace: ${JSON.stringify(restaurant)}`);
      console.error(`Error: ${error.message}`);

      throw error;
    });

const createRestaurant = restaurant =>
  client
    .query(query.Create(query.Ref('classes/Restaurant'), { data: restaurant }))
    .then(response => {
      console.log(
        `Successfully created: week: ${restaurant.week}, weekDay: ${restaurant.weekDay} - ${restaurant.title}`
      );

      return response;
    })
    .catch(error => {
      console.error(`Failed to create: ${JSON.stringify(restaurant)}`);
      console.error(`Error: ${error.message}`);

      throw error;
    });

export const handler = async event => {
  let { restaurants } = JSON.parse(event.body);

  // Make data to an array if not an array
  if (!Array.isArray(restaurants)) {
    restaurants = [restaurants];
  }

  return Promise.all(
    restaurants.map(async restaurant =>
      getRestaurant(restaurant)
        .then(response => replaceRestaurant(response, restaurant))
        .catch(() => createRestaurant(restaurant))
    )
  ).then(
    () => ({
      statusCode: 200,
      body: ''
    }),
    error => {
      console.error(error);
      return {
        statusCode: error.requestResult.statusCode,
        body: error.requestResult.responseRaw
      };
    }
  );
};
