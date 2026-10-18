
const $ = (id) => document.getElementById(id);

const loginPage = $("loginPage");
const dashboard = $("dashboard");
const loginForm = $("loginForm");
const signupBtn = $("signupBtn");
const logoutBtn = $("logoutBtn");
const loginMessage = $("loginMessage");

const searchForm = $("searchForm");
const queryInput = $("query");
const statusText = $("status");
const resultsContainer = $("results");
const countElement = $("count");
const lowestElement = $("lowest");
const sortSelect = $("sort");

let products = [];
let priceChart = null;
let currentPage = "homePage";

function money(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value));
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

function showLogin() {
  loginPage.hidden = false;
  dashboard.hidden = true;
}

function showDashboard() {
  loginPage.hidden = true;
  dashboard.hidden = false;
  navigateTo("homePage");
}

function navigateTo(pageId) {
  const validPages = [
    "homePage",
    "searchPage",
    "comparePage",
    "reviewsPage"
  ];

  if (!validPages.includes(pageId)) return;

  currentPage = pageId;

  document.querySelectorAll(".page-section").forEach((page) => {
    page.hidden = page.id !== pageId;
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  const headings = {
    homePage: "Home Dashboard",
    searchPage: "Search Products",
    comparePage: "Compare Prices",
    reviewsPage: "Ratings & Reviews"
  };

  $("pageHeading").textContent = headings[pageId];

  if (pageId === "comparePage") {
    renderComparison();
    renderChart();
  }

  if (pageId === "reviewsPage") {
    renderReviews();
  }

  if (pageId === "homePage") {
    renderHomeResults();
  }
}

// LOGIN
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = $("email").value.trim();
  const password = $("password").value;

  loginMessage.textContent = "Logging in...";

  try {
    await apiRequest("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    loginMessage.textContent = "";
    showDashboard();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

// SIGN UP
signupBtn.addEventListener("click", async () => {
  const email = $("email").value.trim();
  const password = $("password").value;

  if (!email || password.length < 8) {
    loginMessage.textContent =
      "Enter a valid email and a password with at least 8 characters.";
    return;
  }

  loginMessage.textContent = "Creating account...";

  try {
    await apiRequest("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    loginMessage.textContent = "";
    showDashboard();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

// LOGOUT
logoutBtn.addEventListener("click", async () => {
  try {
    await apiRequest("/api/logout", { method: "POST" });
  } catch (error) {
    console.error("Logout error:", error);
  }

  products = [];
  loginForm.reset();
  clearResults();
  showLogin();
});

// SIDEBAR NAVIGATION
document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    navigateTo(button.dataset.page);
  });
});

// DASHBOARD QUICK LINKS
document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => {
    navigateTo(button.dataset.go);
  });
});

// HOME SEARCH
$("homeSearchForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  $("query").value = $("homeQuery").value.trim();

  navigateTo("searchPage");
  await searchProducts();
});

// SEARCH
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await searchProducts();
});

sortSelect.addEventListener("change", () => {
  sortProducts();
  renderProducts();
});

async function searchProducts() {
  const query = queryInput.value.trim();

  if (!query) {
    statusText.textContent = "Enter a product name to search.";
    return;
  }

  statusText.textContent = "Searching product offers...";
  resultsContainer.replaceChildren();

  try {
    const data = await apiRequest(
      `/api/search?q=${encodeURIComponent(query)}`
    );

    products = Array.isArray(data.products) ? data.products : [];

    sortProducts();
    renderProducts();
    renderHomeResults();
    renderComparison();
    renderReviews();
    renderChart();

    statusText.textContent = products.length
      ? `Found ${products.length} offers for "${query}".`
      : "No offers found. Try another product name.";
  } catch (error) {
    statusText.textContent = error.message;
  }
}

function sortProducts() {
  const mode = sortSelect.value;

  products.sort((a, b) => {
    if (mode === "price") {
      return (a.extractedPrice ?? Infinity) -
             (b.extractedPrice ?? Infinity);
    }

    if (mode === "rating") {
      return (b.rating ?? -1) - (a.rating ?? -1);
    }

    return 0;
  });
}

function clearResults() {
  [
    "results",
    "homeResults",
    "comparisonResults",
    "reviewsResults"
  ].forEach((id) => {
    const element = $(id);
    if (element) element.replaceChildren();
  });

  ["count", "searchCount"].forEach((id) => {
    if ($(id)) $(id).textContent = "0";
  });

  ["lowest", "searchLowest"].forEach((id) => {
    if ($(id)) $(id).textContent = "—";
  });

  if (priceChart) {
    priceChart.destroy();
    priceChart = null;
  }

  if (statusText) statusText.textContent = "";
}

function updateStats() {
  const prices = products
    .map((product) => product.extractedPrice)
    .filter((price) => Number.isFinite(price) && price >= 0);

  const lowest = prices.length ? money(Math.min(...prices)) : "—";

  $("count").textContent = String(products.length);
  $("lowest").textContent = lowest;
  $("searchCount").textContent = String(products.length);
  $("searchLowest").textContent = lowest;
}

function createProductCard(product, index) {
  const card = document.createElement("article");
  card.className = "product-card";

  if (product.image) {
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.title || "Product image";
    image.loading = "lazy";
    image.className = "product-image";
    image.onerror = () => image.remove();
    card.appendChild(image);
  }

  const title = document.createElement("h3");
  title.textContent = product.title || "Unknown product";
  card.appendChild(title);

  const seller = document.createElement("p");
  seller.textContent = `Seller: ${product.source || "Unknown"}`;
  card.appendChild(seller);

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = product.price || money(product.extractedPrice);
  card.appendChild(price);

  const rating = document.createElement("p");
  rating.textContent = product.rating != null
    ? `★ ${product.rating} / 5`
    : "Rating unavailable";
  card.appendChild(rating);

  const reviews = document.createElement("p");
  reviews.textContent = product.reviews != null
    ? `Reviews: ${product.reviews}`
    : "Review count unavailable";
  card.appendChild(reviews);

  const delivery = document.createElement("p");
  delivery.textContent = product.delivery || "Delivery details unavailable";
  card.appendChild(delivery);

  if (product.link) {
    try {
      const url = new URL(product.link);

      if (url.protocol === "https:" || url.protocol === "http:") {
        const link = document.createElement("a");
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View Offer →";
        card.appendChild(link);
      }
    } catch {
      // Ignore invalid seller links.
    }
  }

  return card;
}

function renderProducts() {
  resultsContainer.replaceChildren();
  updateStats();

  if (!products.length) {
    resultsContainer.textContent = "Search for a product to see available offers.";
    return;
  }

  products.forEach((product, index) => {
    resultsContainer.appendChild(createProductCard(product, index));
  });
}

function renderHomeResults() {
  const container = $("homeResults");
  if (!container) return;

  container.replaceChildren();

  if (!products.length) {
    container.textContent = "Your latest product offers will appear here.";
    return;
  }

  products.slice(0, 4).forEach((product, index) => {
    container.appendChild(createProductCard(product, index));
  });
}

function renderComparison() {
  const container = $("comparisonResults");
  if (!container) return;

  container.replaceChildren();

  if (!products.length) {
    container.textContent = "Search for a product to compare seller prices.";
    return;
  }

  const sorted = [...products].sort((a, b) =>
    (a.extractedPrice ?? Infinity) - (b.extractedPrice ?? Infinity)
  );

  sorted.forEach((product, index) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${product.title || "Product"}`;
    card.appendChild(title);

    const seller = document.createElement("p");
    seller.textContent = `Seller: ${product.source || "Unknown"}`;
    card.appendChild(seller);

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = product.price || money(product.extractedPrice);
    card.appendChild(price);

    if (index === 0 && product.extractedPrice != null) {
      const note = document.createElement("p");
      note.textContent = "Lowest listed price among returned offers";
      card.appendChild(note);
    }

    container.appendChild(card);
  });
}

function renderReviews() {
  const container = $("reviewsResults");
  if (!container) return;

  container.replaceChildren();

  if (!products.length) {
    container.textContent = "Search for a product to see available ratings.";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const title = document.createElement("h3");
    title.textContent = product.title || "Unknown product";
    card.appendChild(title);

    const seller = document.createElement("p");
    seller.textContent = `Seller: ${product.source || "Unknown"}`;
    card.appendChild(seller);

    const rating = document.createElement("p");
    rating.className = "product-price";
    rating.textContent = product.rating != null
      ? `★ ${product.rating} / 5`
      : "Rating unavailable";
    card.appendChild(rating);

    const reviews = document.createElement("p");
    reviews.textContent = product.reviews != null
      ? `Review count: ${product.reviews}`
      : "Review count unavailable";
    card.appendChild(reviews);

    const note = document.createElement("p");
    note.textContent =
      "Full customer review text is not available from the current search data.";
    card.appendChild(note);

    container.appendChild(card);
  });
}

function renderChart() {
  const canvas = $("chart");
  if (!canvas || typeof Chart === "undefined") return;

  if (priceChart) {
    priceChart.destroy();
    priceChart = null;
  }

  const chartProducts = [...products]
    .filter((product) =>
      Number.isFinite(product.extractedPrice) &&
      product.extractedPrice >= 0
    )
    .sort((a, b) => a.extractedPrice - b.extractedPrice)
    .slice(0, 10);

  if (!chartProducts.length) return;

  priceChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: chartProducts.map((product) => {
        const seller = product.source || "Seller";
        return seller.length > 18 ? seller.slice(0, 18) + "…" : seller;
      }),
      datasets: [{
        label: "Price (INR)",
        data: chartProducts.map((product) => product.extractedPrice),
        backgroundColor: "#4569e8",
        borderRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => money(context.raw)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Price (₹)" }
        }
      }
    }
  });
}

async function checkSession() {
  try {
    await apiRequest("/api/me");
    showDashboard();
  } catch {
    showLogin();
  }
}

checkSession();
