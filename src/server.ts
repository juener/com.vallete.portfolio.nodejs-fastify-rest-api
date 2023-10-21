import { app } from './app';
import { env } from './env';

app.listen({
    port: env.APP_PORT
}).then(() => {
    console.log(`The server is running on the ${env.APP_PORT} port.`);
});

