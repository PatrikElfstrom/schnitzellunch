const { Client, query: q } = require('faunadb');
const db = new Client({ secret: process.env.FAUNADB_SERVER_SECRET });

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const restaurants = JSON.parse(event.body);

  try {
    await restaurants.map(async function(restaurant) {
      await db.query(
        q.Create(q.Ref('classes/Restaurant'), {
          data: restaurant
        })
      );
    });

    return {
      statusCode: 200,
      body: JSON.stringify('success')
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };
  }
};
