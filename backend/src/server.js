import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './graphql/schema/schema.js';
import { resolvers } from './graphql/resolvers/resolvers.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
    },
});

const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async ({ req }) => ({
        token: req.headers.authorization,
    }),
});

console.log(`🚀 Server running at ${url}`);