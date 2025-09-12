import express from "express";
import cors from "cors";

import * as frontEndHandler from "./handler/frontend.js"
import * as requestAIHandler from "./handler/chat.js"

const app = express();
app.use(express.json());
app.use(cors());

// In-memory storage (resets when server restarts)

// Get all meals
app.get("/meals", frontEndHandler.getMeals);
// Create a new meal
app.post("/meals", frontEndHandler.addMeals);
// Increment favorite count by ID
app.post("/favorite/:id", frontEndHandler.addFavorite);
// Delete a meal by ID
app.delete("/meals/:id", frontEndHandler.deleteMeal);
// Create AI response
app.post("/generate", requestAIHandler.requestAI)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));



