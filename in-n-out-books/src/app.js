"use strict";
/* 
Author: Malcolm Abdullah
Date: August 31st, 2024
File Name:app.js

Description: This application will serve as a platform for managing collections of books.
*/

//require the Express module and create an instance of it
const express = require ('express');
const bcrypt = require("bcryptjs");
const app = express(); // Creates an Express application
const books= require('../database/books'); // import the "books" collection
const users = require('../database/users'); // import the "users"
const collection = require('../database/collection'); // import collection

//middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

// POST route for user login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email or password is missing
    if (!email || !password) {
      return res.status(400).json({ message: 'Bad Request: Missing email or password' });
    }

    // Find the user by email
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify the password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ message: 'Authentication successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
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


// PUT route to update a book by id
app.put('/api/books/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'ID must be a number' });

    const updatedBook = req.body;
    if (!updatedBook.title) return res.status(400).json({ message: 'Bad Request: Missing Title' });

    const result = await books.updateOne({ id: id }, { $set: updatedBook });
    if (result.modifiedCount === 0) return res.status(404).json({ message: 'Book not found' });

    res.status(204).send();
  } catch (error) {
    next(error);
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