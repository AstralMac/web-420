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
const books= require('./database/books'); // import the "books" collection

//middleware to parse JSON bodies
app.use(express.json());

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

// GET route that returns an array of books
app.get('/api/books', async (req, res) => {
  try {
    const allBooks= await books.find(); // Find all books in the mock database
    res.status(200).json(allBooks);
  } catch (error) {
    res.status(500).json({message: 'Error retrieving books'});
  }
});

// GET route that returns a single book by id
app.get('/api/books/:id', async (req, res)=> {
  try{
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({message: 'ID must be a number'});
    }

    const book = await books.findOne({ id: id});
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving book'});
  }
});

// POST route that adds a new book to the database and returns 201-status code
app.post('/api/books', async (req, res, next) => {
  try {
    const addBook = req.body;
    console.log('Added New Book:', addBook);
    const expectedKeys = ['id', 'title', 'author'];
    const receivedKeys = Object.keys(addBook);

    if (!expectedKeys.every(key => receivedKeys.includes(key)) || receivedKeys.length !== expectedKeys.length) {
      console.error('Bad Request: Missing Keys or Extra Key', receivedKeys);
      return res.status(400).json({
        type: "error",
        status: 400,
        message: 'Bad Request'
      });
    }

    const result = await books.insertOne(addBook);
    console.log('Result:', result);
    res.status(201).send({ id: result.ops[0].id}); // corrected
  } catch (err) {
    console.error('Error', err.message);
    next(err);
  }
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