import fastify from 'fastify';
import { transactionRoutes } from './routes/transactions';
import cookie from '@fastify/cookie'

const app = fastify();

app.register(cookie)

app.register(transactionRoutes, {
    prefix: 'transactions'
})

app.get('/ok', () => {
    return `That's OK!`;
});

const port = 3333;
app.listen({
    port: port
}).then(() => {
    console.log(`The server is running on the ${port} port.`);
});

