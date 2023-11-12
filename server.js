// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simple endpoint to handle form submissions
app.post('/submit-form', (req, res) => {
  const formData = req.body;
  console.log('Received form data:', formData);
  // You can process the data here as needed

  res.json({ message: 'Form data received successfully!' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
