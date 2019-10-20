import faunadb from 'faunadb';

const query = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
});

exports.handler = event => {
  let restaurants = JSON.parse(event.body);

  // Make data to an array if not an array
  if (!Array.isArray(restaurants)) {
    restaurants = [restaurants];
  }

  return new Promise((resolve, reject) => {
    return Promise.all(
      restaurants.map(async restaurant => {
        return client
          .query(
            query.Create(query.Collection('Restaurant'), { data: restaurant })
          )
          .then(response => {
            console.log('success', response);

            return {
              statusCode: 200,
              body: JSON.stringify(response)
            };
          })
          .catch(error => {
            console.error(error);

            return {
              statusCode: 400,
              body: JSON.stringify(error)
            };
          });
      })
    ).then(result => resolve(result), error => reject(error));
  });
};
