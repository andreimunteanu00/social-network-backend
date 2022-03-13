const express = require('express');

const app = express();

const port = 8080;
app.listen(port, () => {
    console.log(`App running on port: \x1b[32m${port}\x1b[0m`);
});
