import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// In-memory storage (resets when server restarts)
let meals = [
  { title: "Spaghetti Bolognese", desc: "A classic Italian pasta dish.", count: 0 },
  { title: "Chicken Curry", desc: "Spicy and flavorful chicken curry.", count: 0 },
  { title: "Vegetable Stir Fry", desc: "Quick and healthy mixed veggie dish.", count: 0 }
];

// Get all meals
app.get("/meals", (req, res) => {
  res.json(meals);
});

// Add or update favorite count
app.post("/favorite", (req, res) => {
  const { title, desc } = req.body;
  let meal = meals.find(m => m.title === title);

  if (meal) {
    meal.count += 1;
  } else {
    meal = { title, desc, count: 1 };
    meals.push(meal);
  }

  res.json(meal);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

