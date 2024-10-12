/*
Author: Malcolm Abdullah
Date:September 8th, 2024
Filename:app.spec.js

Description:TDD tests to test app.js
*/

/*
Write unit tests for this route using Jest in your app.spec.js file. You should write the tests before you implement the routes, following TDD principles. Create a test suite named “Chapter [Number]: API Tests”. Use the following test cases:

  a. It should return a 200 status with ‘Security questions successfully answered’ message.

  b. It should return a 400 status code with ‘Bad Request’ message when the request body fails ajv validation.
  
  c. It should return a 401 status code with ‘Unauthorized’ message when the security questions are incorrect.
*/
const request = require('supertest');
const app = require('../src/app');
const bcrypt = require('bcryptjs');
const users = require('../database/users');


describe(' Chapter 3: API Tests', () => {

  // Test for /api/books
  it('Should return an array of books', async ()=> {
    const response = await request(app).get('/api/books');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  //test for /api/books/:id
  it('Should return a single book', async ()=> {
    const response = await request(app).get('/api/books/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('author');
  });

  //Test for invalid ID
  it('should return a 400 error if the id is not a number', async() => {
    const response = await request(app).get('/api/books/abc');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'ID must be a number');
  });
});

describe('Chapter 4: API Tests pt 2', ()=> {
  it('Should return a 201-status code when adding a new book', async () =>{
    const response = await request(app)
      .post('/api/books')
      .send({
        id: 7,
        title : 'Percy Jackson and the Lightning Thief',
        author: 'Rick Riordan'
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id')
  });

  it('should return a 400-status code when adding a new book with missing title', async () =>{
    const response = await request(app)
      .post('/api/books')
      .send({
        id: 6,
        author: 'Rick Riordan'
      });

    expect(response.status).toBe(400);
    expect(response.body.type).toBe('error');
    expect(response.body.status).toBe(400);
    expect(response.body.message).toBe('Bad Request');
  });

  it('should return a 204-status code when deleting a book', async () =>{
    const res = await request(app).delete("/api/books/99");
  }, 10000);
});

describe('Chapter 5: API Tests for PUT Route', () => {
  // Test for successful book update
  it('Should update a book and return a 204-status code', async () => {
    const response = await request(app)
      .put('/api/books/1')
      .send({
        title: 'Updated Book Title',
        author: 'New Author'
      });

    expect(response.status).toBe(204);
  });

  // Test for non-numeric id
  it('Should return a 400-status code when using a non-numeric id', async () => {
    const response = await request(app)
      .put('/api/books/foo')
      .send({
        title: 'Valid Title',
        author: 'Valid Author'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'ID must be a number');
  });

  // Test for missing title in the update
  it('Should return a 400-status code when updating a book with a missing title', async () => {
    const response = await request(app)
      .put('/api/books/1')
      .send({
        author: 'Valid Author'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Bad Request: Missing Title');
  });
});

describe('Chapter 6: API Tests', () => {
  
  beforeAll(async () => {
    // Prepare your test data in the database
    const testUser = {
      email: 'test@example.com',
      password: bcrypt.hashSync('password123', 8) // Create a hashed password
    };

    // Insert the test user into the database
    await users.insertOne(testUser);
  });

  afterAll(async () => {
    // Cleanup: Remove the test user after tests
    await users.deleteOne({ email: 'test@example.com' });
  });

  it('It should log a user in and return a 200 status with "Authentication successful" message', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'password123' }); // Correct credentials

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Authentication successful');
  });

  it('It should return a 401 status with "Unauthorized" message when logging in with incorrect credentials', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' }); // Incorrect password

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('It should return a 400 status code with "Bad Request" when missing email or password', async () => {
    let response = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com' }); // Missing password

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Bad Request: Missing email or password');

    response = await request(app)
      .post('/api/login')
      .send({ password: 'password123' }); // Missing email

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Bad Request: Missing email or password');
  });
});

// Tests written to test the security questions
describe('Chapter 7: API Tests', () => {
  it("should return a 200 status code with a message of 'Security questions successfully answered' when answering the questions", async() => {
    const res = await request(app)
    .post("/api/users/hermione@hogwarts.edu/verify-security-question")
    .send({
      securityQuestions: [
        {answer: "Crookshanks"},
        {answer: "Hogwarts: A History"},
        {answer: "Wilkins"}
      ]
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Security questions successfully answered")
  });

  it("should return a 400 status code with a message of 'Bad Request: Invalid security questions format' when the request body fails ajv validation", async() => {
      // Invalid request missing "answer" property
  const res = await request(app)
  .post("/api/users/hermione@hogwarts.edu/verify-security-question")
  .send({
    securityQuestions: [
      {ans: "Crookshanks"},
      {answer: "Hogwarts: A History"},
      {answer: "Wilkins"}
    ]
  });

  expect(res.statusCode).toEqual(400);
  expect(res.body.message).toEqual("Bad Request: Invalid security questions format");
  });

  it("should return a 401 status code with 'Unauthorized' message when the security questions are incorrect.", async()=> {
  // Invalid request missing "answer" property
  const res = await request(app)
  .post("/api/users/hermione@hogwarts.edu/verify-security-question")
  .send({
    securityQuestions: [
      {answer: "Crooks"},
      {answer: "A History"},
      {answer: "Watkins"}
    ]
  });

  expect(res.statusCode).toEqual(401);
  expect(res.body.message).toEqual("Unauthorized: Incorrect")
  })
});