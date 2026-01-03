// server.js

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Endpoint to fetch environment variables and rewrite environment.prod.ts
app.get('/api/environment', (req, res) => {
  // Fetch environment variables
  const websiteUrl = process.env.WEBSITE_URL || 'https://default-website-url.com';

  // Create environment.prod.ts content
  const environmentFileContent = `
    export const environment = {
      production: true,
      basePath: '${websiteUrl}',
    };
  `;

  // Write environment.prod.ts file
  const filePath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
  fs.writeFileSync(filePath, environmentFileContent);

  // Response
  res.status(200).json({ message: 'Environment file updated successfully' });
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve Angular app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
