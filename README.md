# FOG — Game Store

FOG is a gaming storefront inspired by Steam. I started this project to learn how to build a full-stack application, from designing the pages to connecting a backend, working with a database, and handling user login.

The frontend uses HTML, CSS, and JavaScript. The backend is built with Java and Spring Boot, while MySQL stores user accounts. Game information comes from the RAWG API.

This is a learning project and a storefront demo. It does not sell games or process real payments.

## Features

- Browse games with cover images, descriptions, ratings, and release dates
- Switch between popular, top-rated, and upcoming game categories
- Explore featured games using a slideshow
- Open individual game detail pages
- Create an account and sign in
- Store passwords using BCrypt hashing
- Use session-based login and logout
- Add games to a cart stored in the browser

## Tech Stack

| Part | Tools |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Java, Spring Boot |
| Authentication | Spring Security, BCrypt, HTTP sessions |
| Database | MySQL |
| Database access | Spring Data JPA, Hibernate |
| Game data | RAWG API |
| Build tool | Maven |

## How It Works

The frontend sends requests to the Spring Boot backend to load game information and handle user accounts.

The backend fetches game data from RAWG, so the API key stays on the server. User accounts are stored in MySQL, with passwords hashed before saving.

After login, the browser uses a session cookie to stay signed in. Requests that change data also include a CSRF token.

The cart currently uses local storage. It stays in the same browser and is not yet synced with a user account.

## Project Structure

```text
FOG_frontend/
    index.html
    login.html
    store.html
    sproduct.html
    cart.html
    style.css
    script.js
    images/

FOG_backend/
    fog/
        pom.xml
        mvnw
        mvnw.cmd
        src/
            main/
                java/
                    com/fog/fog/
                        config/
                        controller/
                        dto/
                        model/
                        repository/
                        service/
                        FogApplication.java
                resources/
                    application.properties
```

## Running Locally

### 1. Requirements

- A JDK matching the Java version in `pom.xml`
- MySQL
- A RAWG API key
- VS Code with Live Server, or another local frontend server

The current project configuration targets Java 26. Maven Wrapper is included, so a separate Maven installation is not required.

### 2. Create the Database

Run this in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS fog;
```

### 3. Configure the Backend

Set the following values in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fog
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update

rawg.api.key=${RAWG_API_KEY}
rawg.api.url=https://api.rawg.io/api

server.servlet.session.timeout=30m
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=lax
```

Set `DB_USERNAME`, `DB_PASSWORD`, and `RAWG_API_KEY` in the environment used to start the backend.

Do not commit actual credentials or API keys. The `ddl-auto=update` setting is intended for local development.

### 4. Start Spring Boot

From the repository root, run:

```powershell
cd FOG_backend/fog
.\mvnw.cmd spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

### 5. Start the Frontend

Open `FOG_frontend/index.html` using Live Server.

Use `localhost` in the browser address to match the backend hostname. Mixing `localhost` and `127.0.0.1` can cause problems with session cookies.

The local API base URL in `script.js` is:

```javascript
const API_BASE = "http://localhost:8080/api";
```

## Main API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/rawg/games` | Fetch games |
| GET | `/api/rawg/games/{id}` | Fetch game details |
| POST | `/api/users` | Register a user |
| POST | `/api/users/login` | Sign in |
| GET | `/api/users/me` | Get the signed-in user |
| POST | `/api/users/logout` | Sign out |
| GET | `/api/users/csrf` | Get a CSRF token |

Registration accepts JSON. Login sends the email and password as form-encoded data.

## Current Limitations

- Checkout and payments are not implemented.
- Cart items do not have real purchase prices.
- The cart is browser-specific, not account-specific.
- Discount and top-grossing sections currently display game lists, not verified discount or revenue data.
- Newsletter signup still needs its backend endpoint.
- Some footer pages and social profile links are unfinished.
- Login sessions expire and are lost when the backend restarts.

## What I Learned

Building FOG helped me understand how frontend requests connect to backend endpoints, how data moves between Java and MySQL, and why authentication needs more than a login-page redirect.

It also gave me practice with debugging API errors, configuring CORS, managing dependencies with Maven, and keeping sensitive configuration out of Git.

## Next Steps

- Finish the remaining footer pages
- Complete newsletter subscriptions
- Store carts and wishlists per user
- Add an order flow
- Deploy the application with HTTPS

## Acknowledgements

Game information and images are provided by [RAWG](https://rawg.io/).

FOG is an independent learning project and is not affiliated with Steam, Valve, or RAWG.