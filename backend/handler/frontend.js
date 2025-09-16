import { randomUUID } from "crypto";

let meals = [];

export const getMeals = async (req, res) => {
    res.json(meals);
}

export const addMeals = async (req, res) => {
    const { name, desc } = req.body;
    if (!name || !desc) {
        return res.status(400).json({ message: "Name and description are required" });
    }

    const newMeal = { id: randomUUID(), name, desc, count: 1 };
    meals.push(newMeal);
    res.status(201).json(newMeal);
}

export const addFavorite = async (req, res) => {
    const { id } = req.params;
    const meal = meals.find(m => m.id === id);

    if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
    }

    meal.count += 1;
    res.json(meal);
}

export const deleteMeal = async (req, res) => {
    const { id } = req.params;
    const index = meals.findIndex(m => m.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Meal not found" });
    }

    const deletedMeal = meals.splice(index, 1)[0];
    res.json({ message: "Meal deleted", meal: deletedMeal });
}

