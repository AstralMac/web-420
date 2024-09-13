/*
Author:Malcolm Abdullah
Date: September 11th, 2024
Filename: app.spec.js

Description: TDD tests to build API
*/

const app = require("../src/app"); // Correct path to your app file
const request = require("supertest"); // For making HTTP requests

describe("Chapter 3: API Tests", () => {

  // Test for the /api/recipes endpoint
  it("should return an array of recipes", async () => {
    const res = await request(app).get("/api/recipes");
    expect(res.statusCode).toEqual(200); // Expect status code 200
    expect(res.body).toBeInstanceOf(Array); // Expect body to be an array

    // Ensure each recipe in the array has 'id', 'name', and 'ingredients'
    res.body.forEach((recipe) => {
      expect(recipe).toHaveProperty("id");
      expect(recipe).toHaveProperty("name");
      expect(recipe).toHaveProperty("ingredients");
    });
  });


  // Test for the /api/recipes/:id endpoint
  it("should return a single recipe", async () => {
    const res = await request(app).get("/api/recipes/1"); // Request for recipe with id 1
    expect(res.statusCode).toEqual(200); // Expect status code 200
    expect(res.body).toHaveProperty("id", 1); // Check for correct id
    expect(res.body).toHaveProperty("name", "Pancakes"); // Check for correct name
    expect(res.body).toHaveProperty("ingredients", ["flour", "milk", "eggs"]); // Check for correct ingredients
  });

  it("Should return a 400 error if the id is not a number", async() => {
    const res = await request(app).get("/api/recipes/foo");
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Input must be a number");
  });

});

describe("Chapter 4: API Tests", () => {
  it("should return a 201 code when adding a new recipe", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .send({
        id: 99,
        name: "Grilled Cheese",
        ingredients: ["bread", "cheese", "butter"],
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
  });

  it("should return a 400 status code when adding a new recipe with missing name", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .send({
        id: 100,
        ingredients: ["bread", "cheese", "butter"]
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.type).toEqual("error");
    expect(res.body.status).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

  it("Should return a 204 status code when deleting a recipe", async () => {
    const res = await request(app).delete("/api/recipes/99");

    expect(res.statusCode).toEqual(204);
  }, 10000);
});