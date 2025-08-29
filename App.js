import React, { useState, useEffect } from "react";
import {
  Search,
  Clock,
  ChefHat,
  Users,
  Filter,
  X,
  ExternalLink,
  Heart,
  Star,
  Timer,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";

const RecipeFinderApp = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchType, setSearchType] = useState("ingredient");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    area: "",
  });

  // Categories and areas for filtering
  const categories = [
    "Beef",
    "Chicken",
    "Dessert",
    "Lamb",
    "Miscellaneous",
    "Pasta",
    "Pork",
    "Seafood",
    "Side",
    "Starter",
    "Vegan",
    "Vegetarian",
  ];
  const areas = [
    "American",
    "British",
    "Canadian",
    "Chinese",
    "Croatian",
    "Dutch",
    "Egyptian",
    "French",
    "Greek",
    "Indian",
    "Irish",
    "Italian",
    "Jamaican",
    "Japanese",
    "Kenyan",
    "Malaysian",
    "Mexican",
    "Moroccan",
    "Polish",
    "Portuguese",
    "Russian",
    "Spanish",
    "Thai",
    "Tunisian",
    "Turkish",
    "Vietnamese",
  ];

  // Helper functions for enhanced features
  const getDifficultyLevel = (instructions) => {
    if (!instructions) return { level: "Unknown", color: "gray" };
    const steps = instructions
      .split(/[.!]/)
      .filter((step) => step.trim().length > 10).length;
    if (steps <= 5) return { level: "Easy", color: "green" };
    if (steps <= 10) return { level: "Medium", color: "yellow" };
    return { level: "Hard", color: "red" };
  };

  const getEstimatedTime = (instructions) => {
    if (!instructions) return "30 min";
    const words = instructions.split(" ").length;
    const minutes = Math.max(15, Math.min(120, Math.round(words * 0.3)));
    return `${minutes} min`;
  };

  const getDietaryTags = (recipe) => {
    const tags = [];
    const name = recipe.strMeal?.toLowerCase() || "";
    const category = recipe.strCategory?.toLowerCase() || "";

    if (category.includes("vegetarian"))
      tags.push({ text: "Vegetarian", color: "green" });
    if (category.includes("vegan"))
      tags.push({ text: "Vegan", color: "green" });
    if (category.includes("seafood"))
      tags.push({ text: "Seafood", color: "blue" });
    if (name.includes("spicy") || name.includes("hot"))
      tags.push({ text: "Spicy", color: "red" });
    if (category.includes("dessert"))
      tags.push({ text: "Sweet", color: "pink" });

    return tags;
  };
  const popularIngredients = [
    "chicken",
    "beef",
    "pasta",
    "rice",
    "tomato",
    "cheese",
    "potato",
    "salmon",
    "mushroom",
    "onion",
  ];

  const searchRecipes = async (type, term) => {
    if (!term.trim()) return;

    setLoading(true);
    setError("");

    try {
      let url = "";

      switch (type) {
        case "ingredient":
          url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
            term
          )}`;
          break;
        case "name":
          url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
            term
          )}`;
          break;
        case "category":
          url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(
            term
          )}`;
          break;
        case "area":
          url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
            term
          )}`;
          break;
        default:
          url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
            term
          )}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.meals) {
        setRecipes(data.meals.slice(0, 12)); // Limit to 12 results for better UX
      } else {
        setRecipes([]);
        setError("No recipes found. Try a different search term!");
      }
    } catch (err) {
      setError(
        "Failed to fetch recipes. Please check your connection and try again."
      );
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const getRecipeDetails = async (id) => {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
      );
      const data = await response.json();
      if (data.meals && data.meals[0]) {
        setSelectedRecipe(data.meals[0]);
      }
    } catch (err) {
      setError("Failed to fetch recipe details.");
    }
  };

  const toggleFavorite = (recipe) => {
    setFavorites((prev) => {
      const isFavorite = prev.some((fav) => fav.idMeal === recipe.idMeal);
      if (isFavorite) {
        return prev.filter((fav) => fav.idMeal !== recipe.idMeal);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const getRandomRecipes = async () => {
    setLoading(true);
    setError("");

    try {
      const randomRecipes = [];
      for (let i = 0; i < 8; i++) {
        const response = await fetch(
          "https://www.themealdb.com/api/json/v1/1/random.php"
        );
        const data = await response.json();
        if (data.meals && data.meals[0]) {
          randomRecipes.push(data.meals[0]);
        }
      }
      setRecipes(randomRecipes);
    } catch (err) {
      setError("Failed to fetch random recipes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    searchRecipes(searchType, searchTerm);
  };

  const handleQuickSearch = (ingredient) => {
    setSearchTerm(ingredient);
    setSearchType("ingredient");
    searchRecipes("ingredient", ingredient);
  };

  useEffect(() => {
    getRandomRecipes(); // Load random recipes on initial load
  }, []);

  const RecipeModal = ({ recipe, onClose }) => {
    if (!recipe) return null;

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({ ingredient, measure });
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              className="w-full h-64 object-cover rounded-t-2xl"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900">
                {recipe.strMeal}
              </h2>
              <button
                onClick={() => toggleFavorite(recipe)}
                className="ml-4 p-2 rounded-full hover:bg-red-50 transition-colors"
              >
                <Heart
                  className={`w-6 h-6 ${
                    favorites.some((fav) => fav.idMeal === recipe.idMeal)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.strCategory && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {recipe.strCategory}
                </span>
              )}
              {recipe.strArea && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {recipe.strArea}
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <ChefHat className="w-5 h-5 mr-2 text-orange-500" />
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {ingredients.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-orange-600 min-w-0 flex-shrink-0 mr-2">
                        {item.measure}
                      </span>
                      <span className="text-gray-700">{item.ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Instructions</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {recipe.strInstructions}
                  </p>
                </div>

                {recipe.strYoutube && (
                  <a
                    href={recipe.strYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Watch Video Tutorial
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ChefHat className="w-8 h-8 text-orange-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Taylor's Kitchen
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-orange-500 transition-colors"
              >
                <Heart className="w-5 h-5 mr-1" />
                Favorites ({favorites.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What's cooking today, Taylor?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Find the perfect recipe based on your ingredients, mood, or cuisine
            preference
          </p>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="ingredient">By Ingredient</option>
                <option value="name">By Recipe Name</option>
                <option value="category">By Category</option>
                <option value="area">By Cuisine</option>
              </select>

              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                  placeholder={`Search ${
                    searchType === "ingredient"
                      ? "ingredients like chicken, pasta..."
                      : searchType === "name"
                      ? "recipe names..."
                      : searchType === "category"
                      ? "categories like dessert, vegetarian..."
                      : "cuisines like Italian, Chinese..."
                  }`}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>

          {/* Quick Search Ingredients */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-3">
              Quick ingredient search:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularIngredients.map((ingredient) => (
                <button
                  key={ingredient}
                  onClick={() => handleQuickSearch(ingredient)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-orange-500 hover:text-orange-500 transition-colors text-sm"
                >
                  {ingredient}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={getRandomRecipes}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Surprise Me
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Results */}
        {showFavorites ? (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Your Favorite Recipes ({favorites.length})
            </h3>
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No favorites yet. Start exploring recipes!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((recipe) => (
                  <div
                    key={recipe.idMeal}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => getRecipeDetails(recipe.idMeal)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={recipe.strMealThumb}
                        alt={recipe.strMeal}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(recipe);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                      >
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </button>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {recipe.strMeal}
                      </h3>

                      {/* Enhanced recipe card info */}
                      <div className="flex items-center justify-between mb-2">
                        {recipe.strCategory && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {recipe.strCategory}
                          </span>
                        )}
                        <div className="flex items-center text-gray-500 text-xs">
                          <Timer className="w-4 h-4 mr-1" />
                          {getEstimatedTime(recipe.strInstructions)}
                        </div>
                      </div>

                      {/* Dietary tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {getDietaryTags(recipe).map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded-full ${
                              tag.color === "green"
                                ? "bg-green-100 text-green-800"
                                : tag.color === "blue"
                                ? "bg-blue-100 text-blue-800"
                                : tag.color === "red"
                                ? "bg-red-100 text-red-800"
                                : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {tag.text}
                          </span>
                        ))}
                      </div>

                      {/* Difficulty indicator */}
                      {recipe.strInstructions && (
                        <div className="flex items-center text-xs">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              getDifficultyLevel(recipe.strInstructions)
                                .color === "green"
                                ? "bg-green-500"
                                : getDifficultyLevel(recipe.strInstructions)
                                    .color === "yellow"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-gray-600">
                            {getDifficultyLevel(recipe.strInstructions).level}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          recipes.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Recipe Results ({recipes.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map((recipe) => (
                  <div
                    key={recipe.idMeal}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => getRecipeDetails(recipe.idMeal)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={recipe.strMealThumb}
                        alt={recipe.strMeal}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(recipe);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites.some(
                              (fav) => fav.idMeal === recipe.idMeal
                            )
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {recipe.strMeal}
                      </h3>

                      {/* Enhanced recipe card info */}
                      <div className="flex items-center justify-between mb-2">
                        {recipe.strCategory && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {recipe.strCategory}
                          </span>
                        )}
                        <div className="flex items-center text-gray-500 text-xs">
                          <Timer className="w-4 h-4 mr-1" />
                          Est. 25 min
                        </div>
                      </div>

                      {/* Dietary tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {getDietaryTags(recipe).map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded-full ${
                              tag.color === "green"
                                ? "bg-green-100 text-green-800"
                                : tag.color === "blue"
                                ? "bg-blue-100 text-blue-800"
                                : tag.color === "red"
                                ? "bg-red-100 text-red-800"
                                : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {tag.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Empty State */}
        {!loading && recipes.length === 0 && !error && !showFavorites && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Search for recipes to get started!
            </p>
          </div>
        )}
      </main>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
};

export default RecipeFinderApp;
