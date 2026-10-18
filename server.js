
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
app.use(express.json({ limit: "20kb" }));

app.use(session({
  name: "pricewise.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600000
  }
}));

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
// DEMO ONLY: use a persistent database for deployment.
const users = new Map();

function loggedIn(req, res, next) {
  if (!req.session.userEmail) {
    return res.status(401).json({ error: "Please log in first." });
  }
  next();
}

app.post("/api/signup", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: "Check your email and password." });
  }

  if (users.has(email)) {
    return res.status(409).json({ error: "Account already exists." });
  }

  users.set(email, await bcrypt.hash(password, 12));
  req.session.userEmail = email;
  res.json({ success: true });
});

app.post("/api/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const hash = users.get(email);

  if (!hash || !(await bcrypt.compare(password, hash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  req.session.regenerate(error => {
    if (error) return res.status(500).json({ error: "Login failed." });
    req.session.userEmail = email;
    res.json({ success: true });
  });
});

app.get("/api/me", loggedIn, (req, res) => {
  res.json({ email: req.session.userEmail });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("pricewise.sid");
    res.json({ success: true });
  });
});

app.get("/api/search", loggedIn, async (req, res) => {
  const q = String(req.query.q || "").trim();

  if (!q || q.length > 150) {
    return res.status(400).json({ error: "Enter a valid product name." });
  }

  if (!process.env.SERPAPI_KEY) {
    return res.status(503).json({ error: "Configure SERPAPI_KEY in .env." });
  }

  try {
    const params = new URLSearchParams({
      engine: "google_shopping",
      q,
      gl: "in",
      hl: "en",
      location: "India",
      api_key: process.env.SERPAPI_KEY
    });

    const response = await fetch(
      "https://serpapi.com/search.json?" + params.toString(),
      { signal: AbortSignal.timeout(20000) }
    );

    if (!response.ok) {
      return res.status(502).json({ error: "Shopping API request failed." });
    }

    const data = await response.json();

    if (data.error) {
      return res.status(502).json({ error: data.error });
    }

    const products = (data.shopping_results || []).map(p => ({
      title: p.title || "Unknown product",
      source: p.source || "Unknown seller",
      price: p.price || null,
      extractedPrice: Number.isFinite(p.extracted_price)
        ? p.extracted_price : null,
      rating: Number.isFinite(p.rating) ? p.rating : null,
      reviews: Number.isFinite(p.reviews) ? p.reviews : null,
      delivery: p.delivery || null,
      image: p.thumbnail || null,
      link: p.product_link || p.link || null
    }));

    res.json({ products });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(502).json({ error: "Search failed. Please try again." });
  }
});

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET missing from .env");
}


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`PriceWise server started at ${url}`);

  const { exec } = require("child_process");

  const command =
    process.platform === "win32" ? `start "" "${url}"` :
    process.platform === "darwin" ? `open "${url}"` :
    `xdg-open "${url}"`;

  exec(command);
});

