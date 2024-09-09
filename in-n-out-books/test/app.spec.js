/*
Author: Malcolm Abdullah
Date:September 8th, 2024
Filename:app.spec.js

Description:TDD tests to test app.js
*/

const request = require('supertest');
const app = require('../src/app');

describe(' Chapter 4: API Tests', () => {

  // Test for /api/books
  test('Should return an array of books', async ()=> {
    const response = await request(app).get('/api/books');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  //test for /api/books/:id
  test('Should return a single book', async ()=> {
    const response = await request(app).get('/api/books/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('author');
  });

  //Test for invalid ID
  test('should return a 400 error if the id is not a number', async() => {
    const response = await request(app).get('/api/books/abc');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'ID must be a number');
  });
});