import fastify from 'fastify';
import { transactionRoutes } from './routes/transactions';
import cookie from '@fastify/cookie'

export const app = fastify();

app.register(cookie)

app.register(transactionRoutes, {
    prefix: 'transactions'
})

app.get('/ok', () => {
    return `That's OK!`;
});