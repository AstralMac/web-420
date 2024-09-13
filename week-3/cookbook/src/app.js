/*
Author: Malcolm Abdullah
Date: September 11th, 2024
Filename:app.js

Description: API driven application for a cookbook and the cooking community
*/

const express = require ("express");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const recipes = require ("../database/recipes")
const app = express(); // Creates an Express application

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.get("/", async(req,res,next) => {
  next(createError(501)); //Creates a 501 error

  //HTML content for landing page
  const html = `
  <html>
  <head>
    <title> Cookbook App </title>
    <style>
    body, h1, h2, h3 {margin:0; padding:0; border: 0;}
    body {
      background: #424242;
      color: #fff;
      margin: 1.25rem;
      font-size: 1.25rem;
    }
    h1,h2,h3 {color:#EF5350; font-family: "Emblema One", cursive;}
    h1, h2 {text-align: center}
    h2 {color: #fff;}
    .container{width: 50%; margin: 0 auto; font-family: "lora", serif;}
    .recipe {border: 1px solid #EF5350; padding: 1rem; margin: 1rem 0;}
    .recipe h3 {margin-top: 0;}

    main a{color: #fff; text-decoration:none;}
    main a:hover {color: #ef5350; text-decoration: underline;}
    </style>
    </head>
    <body>
      <div class ="container">
        <header> 
          <h1> Cookbook App</h1>
          <h2> Discover and Share Amazing Recipes </h2>
        </header>
        
        <br/>
        
        <main>
          <div class = "recipe">
            <h3> Classic Beef Tacos</h3>
            <p> <p>1. Brown the ground beef in a skillet.<br>2. Warm the taco shells in the oven.<br>3. Fill the taco shells with beef, lettuce, and cheese.</p>
          </div>
          <div class="recipe">
            <h3>Vegetarian Lasagna</h3>
            <p>1. Layer lasagna noodles, marinara sauce, and cheese in a baking dish.<br>2. Bake at 375 degrees for 45 minutes.<br>3. Let cool before serving.</p>
          </div> 
        </main>
      </div>
    </body>
  </html>`; // end HTML content for the landing page

res.send(html); // Sends the HTML content to the client 
});

// Route to get all recipes
app.get("/api/recipes", async (req, res, next) => {
  try {
    const allRecipes = await recipes.find();
    console.log("All Recipes:", allRecipes); // Logs all recipes
    res.status(200).send(allRecipes); // sends the response with all recipes
  } catch (err) {
    console.error("Error:", err.message); // Logs error message
    next(err); // Passes error to the next middleware
  }
});

// Route to get a single recipe by id
app.get("/api/recipes/:id", async (req, res, next) => {
  try {

    let {id} = req.params;
    id = parseInt(id);

    if(isNaN(id)){
      return next(createError(400, "Input must be a number"));
    };
    
    const recipe = await recipes.findOne({ id: Number(req.params.id) });
    if (recipe) {
      console.log("Recipe:", recipe);
      res.status(200).send(recipe);
    } else {
      res.status(404).send({ message: "Recipe not found" });
    }
  } catch (err) {
    console.error("Error:", err.message);
    next(err);
  }
});

// Duplicate route 

 /*// Catch unexpected error and return one recipe
app.get("/api/recipes/:id", async (req, res, next) => {
  try{
    let {id} = req.params;
    id = parseInt(id);

    if(isNaN(id)){
      return next(createError(400, "Input must be a number"));
    };

    const recipe = await recipes.findOne({id: Number(req.params.id)});
    console.log("Recipe", recipe);
    res.send(recipe);
  }catch(err){
    console.err("Error", err.message);
    next(err);
  }
});
*/

app.post("/api/recipes", async (req, res, next) => {
  try {
    const newRecipe = req.body;
    console.log("Received Recipe:", newRecipe);
    const expectedKeys = ["id", "name", "ingredients"];
    const receivedKeys = Object.keys(newRecipe);

    if (!expectedKeys.every(key => receivedKeys.includes(key)) || receivedKeys.length !== expectedKeys.length) {
      console.error("Bad Request: Missing Keys or extra key", receivedKeys);
      return res.status(400).json({
        type: "error",
        status: 400,
        message: "Bad Request"
      });
    }

    const result = await recipes.insertOne(newRecipe);
    console.log("Result:", result);
    res.status(201).send({ id: result.ops[0].id});
  } catch (err) {
    console.error("Error", err.message);
    next(err);
  }
});

app.delete("/api/recipes/:id", async (req, res, next) => {
  try {
    const{id} = req.params;
    console.log("Deleting Recipe ID:", id);
    const result = await recipes.deleteOne({ id: parseInt(id)});
    console.log("Delete Result:", result);

    res.status(204).send();
  } catch(err) {
    if(err.message === "No matching item found") {
      return next(createError(404, "Recipe not found"));
    }
    console.error("Error", err.message);
    next(err);
  };
});

// Error handler for 404
app.use((req, res, next) => {
  next(createError(404));
});

// Global error handler
app.use((err, req, res, _next) => {
  res.status(err.status || 500);
  res.json({
    type: "error",
    status: err.status,
    message: err.message,
    stack: req.app.get("env") === "development" ? err.stack : undefined,
  });
});

module.exports = app;
