import faunadb from 'faunadb';

const query = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
});

export const handler = async event => {
  let body = '';
  let { restaurants } = JSON.parse(event.body);

  const message = message => {
    body += `\n${message}`;
    console.log(message);
    return message;
  };

  // Make data to an array if not an array
  if (!Array.isArray(restaurants)) {
    restaurants = [restaurants];
  }

  return Promise.all(
    restaurants.map(async restaurant => {
      return client
        .query(
          query.Create(query.Ref('classes/Restaurant'), { data: restaurant })
        )
        .then(() => message(`Successfully added: ${restaurant.title}`))
        .catch(error => {
          message(`Failed to add: ${JSON.stringify(restaurant)}`);
          message(`Error: ${error.message}`);

          throw error;
        });
    })
  ).then(
    result => ({
      statusCode: 200,
      body
    }),
    error => ({
      statusCode: error.requestResult.statusCode,
      body: error.requestResult.responseRaw
    })
  );
};
