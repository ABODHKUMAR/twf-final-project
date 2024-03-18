const express = require('express');
const mincostRoute = require('./routes/mincostRoute'); // Correct import path
const app = express();
const port = 3001;
app.use(express.json())
// Define a route
app.get('/', (req, res) => {
  res.send('https://twf-final-project.vercel.app/api/minroute/mincostCalculate    and make a post request on postman');
});

// Use the mincostRoute middleware
app.use("/api/minroute", mincostRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
