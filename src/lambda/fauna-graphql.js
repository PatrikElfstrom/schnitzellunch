import { ApolloServer } from 'apollo-server-lambda';
import { createHttpLink } from 'apollo-link-http';
import { introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools';
import fetch from 'node-fetch';

exports.handler = function(event, context, cb) {
  /** required for Fauna GraphQL auth */
  if (!process.env.FAUNADB_SERVER_SECRET) {
    cb({
      statusCode: 500,
      body: JSON.stringify('Error: FAUNADB_SERVER_SECRET missing')
    });
    return;
  }

  const headers = {
    Authorization: `Bearer ${process.env.FAUNADB_SERVER_SECRET}`
  };

  /** standard creation of apollo-server executable schema */
  const link = createHttpLink({
    uri: 'https://graphql.fauna.com/graphql',
    fetch,
    headers
  });

  introspectSchema(link).then(schema => {
    const executableSchema = makeRemoteExecutableSchema({
      schema,
      link
    });

    const server = new ApolloServer({
      schema: executableSchema
    });

    server.createHandler()(event, context, cb);
  });
};
