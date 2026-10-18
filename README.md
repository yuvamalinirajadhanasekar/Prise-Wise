# 🛍️ PriceWise – Smart Product Search Platform

## 🚀 Live Demo

**[Visit PriceWise Website](https://prise-wise.onrender.com)**

## 📌 About the Project

PriceWise is a web-based product search platform designed to help users explore product information through a simple and user-friendly interface. It integrates SerpApi to retrieve product-related search results, making it easier for users to discover available products in one place.

## ❗ Problem Statement

Online shoppers often spend time searching across different websites to find products and explore their prices and details. This process can be time-consuming and inconvenient. A simple platform is needed to make product searching easier and more organized.

## 💡 Proposed Solution

PriceWise provides a centralized web interface where users can register, log in, and search for products by entering their names or keywords. The application uses SerpApi to retrieve relevant search results and displays the available information to users.

## 🎯 Objectives

- Simplify product searching through a single interface.
- Provide convenient access to product-related search results.
- Implement user registration and login functionality.
- Integrate an external API with a web application.
- Develop a simple and accessible user experience.

## ✨ Key Features

- **User Registration:** Allows new users to create an account.
- **User Login:** Provides access through an authentication system.
- **Product Search:** Enables users to search using product names or keywords.
- **Search Results:** Displays product-related information returned by the API.
- **Session Management:** Maintains user login sessions.
- **Simple Interface:** Offers an easy-to-use web experience.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Structures the web pages |
| CSS3 | Styles the user interface |
| JavaScript | Handles frontend interactions |
| Node.js | Runs the backend application |
| Express.js | Manages server routes and API requests |
| SerpApi | Retrieves product search results |
| express-session | Manages login sessions |
| bcryptjs | Hashes passwords |
| dotenv | Loads environment variables |
| Git & GitHub | Version control and source code hosting |
| Render | Deploys and hosts the application |

## ⚙️ How It Works

1. The user opens the PriceWise website.
2. The user registers or logs in.
3. The user enters a product name in the search field.
4. The frontend sends a search request to the backend.
5. The backend retrieves relevant results through SerpApi.
6. The application displays the returned results to the user.

## 🏗️ System Architecture

**User → HTML/CSS/JavaScript Frontend → Node.js/Express.js Backend → SerpApi → Search Results → User**

The frontend handles user interactions, the backend processes requests, and SerpApi supplies the relevant search information.

## 👥 Target Users

- Online shoppers searching for products.
- Students looking for convenient product research.
- Budget-conscious consumers exploring available options.
- Users who prefer a simple product-search interface.

## 📚 Key Learnings

- Frontend development using HTML, CSS, and JavaScript.
- Backend development using Node.js and Express.js.
- Integration of external APIs.
- User authentication and session management.
- Password hashing fundamentals.
- Environment variable configuration.
- Source code management using Git and GitHub.
- Deployment using Render.
- Debugging frontend and backend communication.

## ⚠️ Current Limitations

- Search results depend on SerpApi availability and returned data.
- Product information and coverage may vary.
- A complete multi-seller price comparison depends on obtaining comparable prices from multiple sources.
- User accounts are currently stored in temporary server memory and may not persist after a server restart or redeployment.

## 🔮 Future Enhancements

- Integrate additional product data sources.
- Compare verified prices from multiple sellers.
- Add product filters and sorting options.
- Introduce price history and price-drop alerts.
- Add a wishlist and saved searches.
- Integrate a persistent database for user accounts.
- Improve mobile responsiveness and accessibility.
- Add product recommendations based on user preferences.

## 🔐 Security

- Keep API keys and session secrets in environment variables.
- Never upload the `.env` file or private credentials to GitHub.
- Use password hashing and secure session configuration.
- Add a persistent database and further security protections for production use.

## ▶️ Run Locally

### Prerequisites

- Node.js and npm
- A valid SerpApi API key

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/yuvamalinirajadhanasekar/Prise-Wise
   ```

2. Open the project folder:

   ```bash
   cd Monikaa
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory:

   ```env
   SERPAPI_KEY=your_api_key
   SESSION_SECRET=your_random_secret
   PORT=3000
   NODE_ENV=development
   ```

5. Start the server:

   ```bash
   node server.js
   ```

6. Open your browser and visit:

   `http://localhost:3000`


## ☁️ Deployment

PriceWise is hosted on Render and connected to its GitHub repository. Required environment variables must be configured securely in the Render dashboard.

## 📄 License

This project is licensed under the MIT License. Refer to the `LICENSE` file in the repository.

---

**PriceWise — Making product search simpler.**
