// js
const API_URL = "http://mealmate.ddns.net:3221"; // Replace with your real backend

const form = document.getElementById("ingredient-form");
const input = document.getElementById("ingredient-input");
const mealTitle = document.getElementById("meal-title");
const mealDesc = document.getElementById("meal-desc");
const toggleDetailsBtn = document.getElementById("toggle-details");
const dislikeBtn = document.getElementById("dislike-btn");
const likeBtn = document.getElementById("like-btn");
const favoriteList = document.getElementById("favorite-list");
const statusBox = document.getElementById("status"); // 🔹 div สำหรับโหลด/error

let meals = [];
let currentMeal = null;
let favorites = [];

const filterRole = document.getElementById("filter-role");
const filterStyle = document.getElementById("filter-style");
const filterCuisine = document.getElementById("filter-cuisine");

function showLoading() {
  document.getElementById("loading").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

// Load initial global favorites from backend
async function loadFavorites() {
  showLoading();
  try {
    const res = await fetch(`${API_URL}/meals`);
    favorites = await res.json();
    renderFavorites();
  } catch (err) {
    console.error("Error loading favorites:", err);
  }
  finally{
    hideLoading();
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
  mealTitle.textContent = currentMeal.name;
  mealDesc.textContent = currentMeal.desc;
  mealDesc.style.display = "none";
  toggleDetailsBtn.textContent = "Show Details";
  toggleDetailsBtn.style.display = "inline-block";
}

// Fetch meal suggestions from backend
async function fetchMealsFromAPI(ingredients, filters = {}) {
  showLoading();
  try {
    const res = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients, ...filters })
    });
    return await res.json();
  } catch (err) {
    console.error("Error fetching meals:", err);
    return [];
  }
  finally{
    hideLoading();
  }
}

// Favorite a meal globally
async function favoriteMeal(meal) {
  showLoading();
  try {
    const res = await fetch(`${API_URL}/meals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: meal.name, desc: meal.desc })
    });
    return await res.json(); // returns updated meal with global count
  } catch (err) {
    console.error("Error favoriting meal:", err);
    return meal; // fallback
  }
  finally{
    hideLoading();
  }
}

// Render favorites list
function renderFavorites() {
  favoriteList.innerHTML = "";
  favorites.forEach((meal) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong class="meal-title">${meal.name}</strong>
        <span class="actions" style="display:flex; gap:12px; align-items:center;">
          <span class="favorite-count" style="cursor:pointer;">⭐ ${meal.count || 0}</span>
          <span class="delete-text">Delete</span>
        </span>
      </div>
      <button class="toggle-btn">Show Details</button>
      <p class="details" style="display:none">${meal.desc}</p>
    `;

    // toggle details
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

    // delete meal
    const deleteText = li.querySelector(".delete-text");
    deleteText.addEventListener("click", async () => {
      try {
        const res = await fetch(`${API_URL}/meals/${meal.id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete meal");

        favorites = favorites.filter((m) => m.id !== meal.id);
        renderFavorites();
      } catch (err) {
        console.error(err);
        alert("Error deleting meal");
      }
    });

    // favorite (กดดาว)
    const favoriteCount = li.querySelector(".favorite-count");
    favoriteCount.addEventListener("click", async () => {
      try {
        const res = await fetch(`${API_URL}/favorite/${meal.id}`, {
          method: "POST",
        });

        if (!res.ok) throw new Error("Failed to favorite meal");

        meal.count = (meal.count || 0) + 1;
        renderFavorites();
      } catch (err) {
        console.error(err);
        alert("Error favoriting meal");
      }
    });

    favoriteList.appendChild(li);
  });
}

// Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ingredients = input.value.trim();

  const filters = {
    role: filterRole.value,
    style: filterStyle.value,
    cuisine: filterCuisine.value
  };

  // 🔹 Show overlay
  document.getElementById("loading-overlay").classList.add("active");

  meals = [];
  showNextMeal();

  // fetch
  meals = await fetchMealsFromAPI(ingredients, filters);

  // 🔹 Hide overlay
  document.getElementById("loading-overlay").classList.remove("active");

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
    console.log(currentMeal);
    const updatedMeal = await favoriteMeal(currentMeal);

    const existing = favorites.find(m => m.name === updatedMeal.name);
    if (existing) {
  existing.count = updatedMeal.count;
  } else {
    // ถ้า backend ยังไม่ส่ง count มา ให้เริ่มที่ 1
    updatedMeal.count = updatedMeal.count || 1;
    favorites.push(updatedMeal);
  }

    renderFavorites();
  }
  showNextMeal();
});

// Initial load
loadFavorites();
