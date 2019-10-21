'use strict';

var faunadb = require('faunadb');

var query = faunadb.query;
var client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
});

exports.handler = async function(event) {
  try {
    var restaurants = JSON.parse(event.body);
  } catch (error) {
    console.log('Invalid JSON');
    return {
      statusCode: 400,
      body: ''
    };
  }

  // Make data to an array if not an array
  if (!Array.isArray(restaurants)) {
    restaurants = [restaurants];
  }

  return new Promise(function(resolve, reject) {
    return Promise.all(
      restaurants.map(async function(restaurant) {
        return client
          .query(
            query.Create(query.Ref('classes/Restaurant'), {
              data: restaurant
            })
          )
          .then(function(response) {
            console.log('success', response);
            return {
              statusCode: 200,
              body: JSON.stringify(response)
            };
          })
          .catch(function(error) {
            console.error(error);
            return {
              statusCode: 400,
              body: JSON.stringify(error)
            };
          });
      })
    ).then(
      function(result) {
        return resolve(result);
      },
      function(error) {
        return reject(error);
      }
    );
  });
};
