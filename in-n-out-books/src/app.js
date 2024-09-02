"use strict";
/* 
Author: Malcolm Abdullah
Date: August 31st, 2024
File Name:app.js

Description: This application will serve as a platform for managing collections of books.
*/

//require the Express module and create an instance of it
const express = require ('express');
const app = express();

//Add a GET route for the root URL ("/"). This route will serve as the landing page of application.
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title> In-N-Out-Books</title>
      </head>
      <body>
        <h1>Welcome to In-N-Out-Books</h1>
        <p>Manage your book collection with ease.</p>
      </body>
    </html>`);
});

//404 Error Middleware: This handles any requests to routes that do not exist
app.use((req, res, next) => {
  res.status(404).send('Page Not Found');
});

//500 Error Middleware: This handles server errors. If the app is in development mode, include the error stack.
app.use((err, req, res, next) => {
  res.status(500).json({
    message: 'Internal Server Error',
    ...app(process.env.NODE_ENV === 'development' && {stack: err.stack})
  });
});

// Export Express  application
module.exports = app;