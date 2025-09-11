import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const mealSchema = new mongoose.Schema({
  title: String,
  desc: String,
  count: { type: Number, default: 0 }
});
const Meal = mongoose.model("Meal", mealSchema);

// Get all meals
app.get("/meals", async (req, res) => {
  const meals = await Meal.find();
  res.json(meals);
});

// Add or update favorite count
app.post("/favorite", async (req, res) => {
  const { title, desc } = req.body;
  let meal = await Meal.findOne({ title });

  if (meal) {
    meal.count += 1;
  } else {
    meal = new Meal({ title, desc, count: 1 });
  }
  await meal.save();
  res.json(meal);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
