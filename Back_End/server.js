import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());
app.use(cors());

// In-memory storage (resets when server restarts)
let meals = [];

// Get all meals
app.get("/meals", (req, res) => {
  res.json(meals);
});

// Create a new meal
app.post("/meals", (req, res) => {
  const { title, desc } = req.body;
  if (!title || !desc) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  const newMeal = { id: randomUUID(), title, desc, count: 0 };
  meals.push(newMeal);
  res.status(201).json(newMeal);
});

// Increment favorite count by ID
app.post("/favorite/:id", (req, res) => {
  const { id } = req.params;
  const meal = meals.find(m => m.id === id);

  if (!meal) {
    return res.status(404).json({ message: "Meal not found" });
  }

  meal.count += 1;
  res.json(meal);
});

// Delete a meal by ID
app.delete("/meals/:id", (req, res) => {
  const { id } = req.params;
  const index = meals.findIndex(m => m.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Meal not found" });
  }

  const deletedMeal = meals.splice(index, 1)[0];
  res.json({ message: "Meal deleted", meal: deletedMeal });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));



