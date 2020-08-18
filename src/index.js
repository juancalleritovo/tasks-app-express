const app = require('./app');

const APP_PORT = process.env.PORT || 3000;

app.listen(APP_PORT, () => {
    console.log(`-> Server up and running on PORT: ${APP_PORT}`);
});
