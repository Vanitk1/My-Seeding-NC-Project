const app = require("../api/api");
const { PORT = 3000 } = process.env;

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
})