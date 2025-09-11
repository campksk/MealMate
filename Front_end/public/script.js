const API_URL = "https://localhost:5000"; // Replace with your real backend

const form = document.getElementById("ingredient-form");
const input = document.getElementById("ingredient-input");
const mealTitle = document.getElementById("meal-title");
const mealDesc = document.getElementById("meal-desc");
const toggleDetailsBtn = document.getElementById("toggle-details");
const dislikeBtn = document.getElementById("dislike-btn");
const likeBtn = document.getElementById("like-btn");
const favoriteList = document.getElementById("favorite-list");

let meals = [];
let currentMeal = null;
let favorites = [];

// Load initial global favorites from backend
async function loadFavorites() {
  try {
    const res = await fetch(`${API_URL}/favorites`);
    favorites = await res.json();
    renderFavorites();
  } catch (err) {
    console.error("Error loading favorites:", err);
  }
}

// Show next meal suggestion
function showNextMeal() {
  if (meals.length === 0) {
    mealTitle.textContent = "No more suggestions!";
    mealDesc.textContent = "";
    mealDesc.style.display = "none";
    toggleDetailsBtn.style.display = "none";
    currentMeal = null;
    return;
  }
  currentMeal = meals.shift();
  mealTitle.textContent = currentMeal.title;
  mealDesc.textContent = currentMeal.desc;
  mealDesc.style.display = "none";
  toggleDetailsBtn.textContent = "Show Details";
  toggleDetailsBtn.style.display = "inline-block";
}

// Fetch meal suggestions from backend
async function fetchMealsFromAPI(ingredients) {
  try {
    const res = await fetch(`${API_URL}/meals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients })
    });
    return await res.json();
  } catch (err) {
    console.error("Error fetching meals:", err);
    return [];
  }
}

// Favorite a meal globally
async function favoriteMeal(meal) {
  try {
    const res = await fetch(`${API_URL}/favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: meal.title })
    });
    return await res.json(); // returns updated meal with global count
  } catch (err) {
    console.error("Error favoriting meal:", err);
    return meal; // fallback
  }
}

// Render favorites list
function renderFavorites() {
  favoriteList.innerHTML = "";
  favorites.forEach((meal) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong class="meal-title">${meal.title}</strong> 
      <span class="favorite-count">⭐ ${meal.count || 0}</span>
      <button class="toggle-btn">Show Details</button>
      <p class="details">${meal.desc}</p>
    `;

    const toggleBtn = li.querySelector(".toggle-btn");
    const details = li.querySelector(".details");

    toggleBtn.addEventListener("click", () => {
      if (details.style.display === "none") {
        details.style.display = "block";
        toggleBtn.textContent = "Hide Details";
      } else {
        details.style.display = "none";
        toggleBtn.textContent = "Show Details";
      }
    });

    favoriteList.appendChild(li);
  });
}

// Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ingredients = input.value.trim();
  if (!ingredients) return;

  meals = await fetchMealsFromAPI(ingredients);
  input.value = "";
  showNextMeal();
});

// Toggle meal details
toggleDetailsBtn.addEventListener("click", () => {
  if (mealDesc.style.display === "none") {
    mealDesc.style.display = "block";
    toggleDetailsBtn.textContent = "Hide Details";
  } else {
    mealDesc.style.display = "none";
    toggleDetailsBtn.textContent = "Show Details";
  }
});

// Dislike button
dislikeBtn.addEventListener("click", () => showNextMeal());

// Like button
likeBtn.addEventListener("click", async () => {
  if (currentMeal) {
    const updatedMeal = await favoriteMeal(currentMeal);

    const existing = favorites.find(m => m.title === updatedMeal.title);
    if (existing) {
      existing.count = updatedMeal.count;
    } else {
      favorites.push(updatedMeal);
    }

    renderFavorites();
  }
  showNextMeal();
});

// Initial load
loadFavorites();
