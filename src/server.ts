import fastify from 'fastify';

const app = fastify();

app.get('/ok', () => {
    return `That's OK!`;
});

const port = 3333;
app.listen({
    port: port
}).then(() => {
    console.log(`The server is running on the ${port} port.`);
});

