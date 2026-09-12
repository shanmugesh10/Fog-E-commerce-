const API_BASE = "http://localhost:8080/api";
const FOG_CART_KEY = "fog-cart";

async function apiFetch(path, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const headers = new Headers(options.headers);

    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        const tokenResponse = await fetch(`${API_BASE}/users/csrf`, {
            credentials: "include",
            cache: "no-store",
            signal: options.signal
        });

        if (!tokenResponse.ok) {
            throw new Error("Could not start a secure request. Please retry.");
        }

        const csrf = await tokenResponse.json();
        headers.set(csrf.headerName, csrf.token);
    }

    return fetch(`${API_BASE}${path}`, {
        ...options,
        method,
        headers,
        credentials: "include"
    });
}

async function loadCurrentUser() {
    const response = await apiFetch("/users/me", {
        cache: "no-store"
    });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Could not check your login.");
    }

    return response.json();
}

async function updateAccountDisplay() {
    try {
        const user = await loadCurrentUser();

        document.querySelectorAll("[data-user-name]").forEach(element => {
            element.textContent = user ? user.username : "";
        });

        document.querySelectorAll("[data-logged-in]").forEach(element => {
            element.hidden = !user;
        });

        document.querySelectorAll("[data-logged-out]").forEach(element => {
            element.hidden = Boolean(user);
        });

        return user;
    } catch (error) {
        console.error("Unable to check account:", error);
        return null;
    }
}

function initializeAccount() {
    const form = document.getElementById("loginForm");

    if (form && form.dataset.authInitialized !== "true") {
        form.dataset.authInitialized = "true";

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const message = document.getElementById("loginMessage");
            const button = form.querySelector(
                'button[type="submit"], button:not([type])'
            );

            if (form.dataset.submitting === "true") return;

            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");

            if (!emailInput || !passwordInput) return;

            emailInput.value = emailInput.value.trim();

            if (!form.reportValidity()) return;

            form.dataset.submitting = "true";

            if (button) button.disabled = true;
            if (message) message.textContent = "Signing in...";

            try {
                const response = await apiFetch("/users/login", {
                    method: "POST",
                    body: new URLSearchParams({
                        email: emailInput.value,
                        password: passwordInput.value
                    }),
                    signal: AbortSignal.timeout(20000)
                });

                if (!response.ok) {
                    throw new Error(
                        response.status === 401
                            ? "Invalid email or password."
                            : "Login failed. Please refresh and try again."
                    );
                }

                const user = await loadCurrentUser();

                if (!user) {
                    throw new Error(
                        "Session was not saved. Open the frontend using localhost."
                    );
                }

                window.location.href = "index.html";
            } catch (error) {
                if (message) {
                    message.textContent =
                        error.name === "TimeoutError"
                            ? "The server took too long. Please try again."
                            : error.message;
                }
            } finally {
                form.dataset.submitting = "false";
                if (button) button.disabled = false;
            }
        });
    }

    document.querySelectorAll("[data-logout]").forEach(button => {
        if (button.dataset.authInitialized === "true") return;

        button.dataset.authInitialized = "true";

        button.addEventListener("click", async event => {
            event.preventDefault();

            if (button.dataset.submitting === "true") return;

            button.dataset.submitting = "true";
            button.disabled = true;

            try {
                const response = await apiFetch("/users/logout", {
                    method: "POST",
                    signal: AbortSignal.timeout(20000)
                });

                if (!response.ok) {
                    throw new Error("Logout failed. Please try again.");
                }

                window.location.href = "login.html";
            } catch (error) {
                alert(error.message);
            } finally {
                button.dataset.submitting = "false";
                button.disabled = false;
            }
        });
    });

    updateAccountDisplay();
}

async function registerUser(username, email, password) {
    const response = await apiFetch("/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password
        }),
        signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
        if (response.status === 409) {
            throw new Error("Email already registered.");
        }

        if (response.status === 400) {
            throw new Error(
                "Check your username, email and password. The password must have at least 8 characters and at most 72 bytes."
            );
        }

        throw new Error("Registration failed. Please try again.");
    }

    return response.json();
}

function initializeRegistration() {
    const form = document.getElementById("registerForm");

    if (!form || form.dataset.authInitialized === "true") return;

    form.dataset.authInitialized = "true";

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (form.dataset.submitting === "true") return;

        const usernameInput = form.querySelector(
            '[name="username"], #registerUsername, #username'
        );
        const emailInput = form.querySelector(
            '[name="email"], #registerEmail, #email'
        );
        const passwordInput = form.querySelector(
            '[name="password"], #registerPassword, #password'
        );
        const confirmInput = form.querySelector(
            '[name="confirmPassword"], #confirmPassword'
        );
        const message = document.getElementById("registerMessage");
        const button = form.querySelector(
            'button[type="submit"], button:not([type])'
        );

        if (!usernameInput || !emailInput || !passwordInput) {
            if (message) {
                message.textContent = "Registration form fields are missing.";
            }

            return;
        }

        usernameInput.value = usernameInput.value.trim();
        emailInput.value = emailInput.value.trim();

        if (!form.reportValidity()) return;

        if (
            confirmInput &&
            confirmInput.value !== passwordInput.value
        ) {
            if (message) {
                message.textContent = "Passwords do not match.";
            }

            return;
        }

        form.dataset.submitting = "true";

        if (button) button.disabled = true;
        if (message) message.textContent = "Creating account...";

        try {
            await registerUser(
                usernameInput.value,
                emailInput.value,
                passwordInput.value
            );

            form.reset();

            if (message) {
                message.textContent = "Account created. You can now sign in.";
            } else {
                window.location.href = "login.html";
            }
        } catch (error) {
            if (message) {
                message.textContent = error.message;
            }
        } finally {
            form.dataset.submitting = "false";
            if (button) button.disabled = false;
        }
    });
}

function linkToGame(element, game) {
    element.style.cursor = "pointer";
    element.tabIndex = 0;
    element.setAttribute("role", "link");
    element.setAttribute("aria-label", `View ${game.name || "game"}`);

    element.onclick = () => {
        window.location.href =
            `sproduct.html?id=${encodeURIComponent(game.id)}`;
    };

    element.onkeydown = event => {
        if (event.key === "Enter") {
            event.preventDefault();
            element.click();
        }
    };
}

async function fetchRawg(path, signal) {
    const response = await apiFetch(`/rawg${path}`, {
        signal
    });

    if (!response.ok) {
        throw new Error(`RAWG request failed: ${response.status}`);
    }

    return response.json();
}

function getGamesFromResponse(data) {
    if (!data || !Array.isArray(data.results)) {
        throw new Error("RAWG response does not contain games");
    }

    return data.results;
}

function shortenDescription(text, limit = 350) {
    const isHomePage = Boolean(document.getElementById("MP"));
    const maxLength = isHomePage ? 150 : limit;
    const cleaned = (text || "").replace(/\s+/g, " ").trim();

    if (!cleaned) {
        return "No description available.";
    }

    return cleaned.length > maxLength
        ? cleaned.slice(0, maxLength).trimEnd() + "…"
        : cleaned;
}

function createGameImage(game) {
    if (!game.background_image) return null;

    const image = document.createElement("img");

    image.src = game.background_image;
    image.alt = game.name || "Game";
    image.loading = "lazy";

    image.onerror = () => {
        image.remove();
    };

    return image;
}

let categoryContainer;
let categoryStatus;
let categoryButtons = [];
let categoryRequest;

function formatCategoryDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getCategoryParams(category) {
    const today = new Date();
    const todayText = formatCategoryDate(today);
    const params = new URLSearchParams();

    switch (category) {
        case "popular": {
            const start = new Date(today);
            start.setDate(start.getDate() - 90);

            params.set("ordering", "-added");
            params.set(
                "dates",
                `${formatCategoryDate(start)},${todayText}`
            );

            break;
        }

        case "rated": {
            params.set("ordering", "-rating");
            params.set("dates", `1900-01-01,${todayText}`);

            break;
        }

        case "upcoming": {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const end = new Date(today);
            end.setFullYear(end.getFullYear() + 1);

            params.set("ordering", "-added");
            params.set(
                "dates",
                `${formatCategoryDate(tomorrow)},${formatCategoryDate(end)}`
            );

            break;
        }

        case "all":
        default: {
            params.set("ordering", "-added");
            params.set("dates", `1900-01-01,${todayText}`);
        }
    }

    return params;
}

async function loadCategoryDescription(id, element, signal) {
    try {
        const details = await fetchRawg(`/games/${id}`, signal);

        if (signal.aborted) return;

        element.textContent = shortenDescription(
            details.description_raw
        );
    } catch (error) {
        if (signal.aborted) return;

        element.textContent = "Description unavailable.";
        console.error("Could not load game description:", error);
    }
}

async function loadCategoryGames(category) {
    if (!categoryContainer || !categoryStatus) return;

    categoryRequest?.abort();

    const request = new AbortController();
    categoryRequest = request;

    categoryButtons.forEach(button => {
        const selected = button.dataset.category === category;

        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });

    categoryContainer.replaceChildren();
    categoryContainer.setAttribute("aria-busy", "true");
    categoryStatus.textContent = "Loading games...";

    try {
        const params = getCategoryParams(category);
        const data = await fetchRawg(
            `/games?${params}`,
            request.signal
        );

        const games = getGamesFromResponse(data).slice(0, 8);

        if (request.signal.aborted) return;

        categoryStatus.textContent = games.length
            ? ""
            : "No games found in this category.";

        games.forEach(game => {
            const card = document.createElement("article");
            card.className = "category-card";

            linkToGame(card, game);

            const image = createGameImage(game);

            if (image) {
                card.append(image);
            }

            const info = document.createElement("div");
            info.className = "game-description";

            const title = document.createElement("h3");
            title.textContent = game.name;

            const rating = document.createElement("p");
            rating.textContent = game.rating
                ? `⭐ ${game.rating} / 5`
                : "Not rated yet";

            const release = document.createElement("p");
            release.textContent = game.released
                ? `Release: ${game.released}`
                : "Release date: TBA";

            const description = document.createElement("p");
            description.textContent = "Loading description...";

            info.append(title, rating, release, description);
            card.append(info);
            categoryContainer.append(card);

            loadCategoryDescription(
                game.id,
                description,
                request.signal
            );
        });
    } catch (error) {
        if (request.signal.aborted) return;

        categoryStatus.textContent =
            "Could not load games. Click a category to retry.";

        console.error("Unable to load category games:", error);
    } finally {
        if (categoryRequest === request) {
            categoryContainer.setAttribute("aria-busy", "false");
        }
    }
}

function initializeCategories() {
    categoryContainer = document.getElementById("category-games");
    categoryStatus = document.getElementById("category-status");
    categoryButtons = document.querySelectorAll(
        "#catg button[data-category]"
    );

    if (!categoryContainer) {
        loadRawgImages();
        return;
    }

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            loadCategoryGames(button.dataset.category);
        });
    });

    const initialCategory = document.querySelector(
        "#catg button.active[data-category]"
    )?.dataset.category || "popular";

    loadCategoryGames(initialCategory);
}

async function loadRawgImages() {
    const images = document.querySelectorAll("#catgs > .s2 > img");

    if (!images.length) return;

    try {
        const pageName = window.location.pathname.split("/").pop();

        const categoryByPage = {
            "store.html": "popular",
            "popularupcoming.html": "upcoming",
            "topgrossing.html": "all"
        };

        const category = categoryByPage[pageName] || "all";
        const params = getCategoryParams(category);
        const data = await fetchRawg(`/games?${params}`);

        const games = getGamesFromResponse(data).filter(
            game => game.background_image
        );

        await Promise.all(
            Array.from(images, async (image, index) => {
                const game = games[index];

                if (!game) return;

                const row = image.parentElement;
                row.classList.add("game-row");

                linkToGame(row, game);
                row.querySelector(".game-description")?.remove();

                const originalImage = image.src;

                image.onerror = () => {
                    image.onerror = null;
                    image.src = originalImage;
                };

                image.src = game.background_image;
                image.alt = game.name;

                const info = document.createElement("div");
                info.className = "game-description";

                const title = document.createElement("h3");
                title.textContent = game.name;

                const description = document.createElement("p");
                description.textContent = "Loading description...";

                info.append(title, description);
                row.append(info);

                try {
                    const details = await fetchRawg(
                        `/games/${game.id}`
                    );

                    description.textContent = shortenDescription(
                        details.description_raw
                    );
                } catch (error) {
                    description.textContent = "Description unavailable.";
                    console.error(error);
                }
            })
        );
    } catch (error) {
        console.error("Unable to load RAWG games:", error);
    }
}

async function loadFeaturedSlider() {
    const section = document.getElementById("MP");

    if (!section) return;

    const image = section.querySelector("img");
    const content = section.querySelector(".bt");
    const title = content?.querySelector("h2");

    if (!image || !content || !title) return;

    const playButton = content.querySelector("button");

    const description = document.createElement("p");
    description.className = "featured-description";
    description.setAttribute("aria-live", "off");

    title.after(description);

    const controls = document.createElement("div");
    controls.className = "featured-controls";

    const previous = document.createElement("button");
    previous.type = "button";
    previous.textContent = "Previous";

    const pause = document.createElement("button");
    pause.type = "button";
    pause.textContent = "Pause";

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Next";

    controls.append(previous, pause, next);
    content.append(controls);

    previous.disabled = true;
    next.disabled = true;
    pause.disabled = true;

    if (playButton) {
        playButton.hidden = true;
    }

    try {
        const data = await fetchRawg("/games");

        const games = getGamesFromResponse(data)
            .filter(game => game.background_image)
            .slice(0, 5);

        if (!games.length) {
            description.textContent = "No featured games available.";
            return;
        }

        const detailsCache = new Map();

        let currentIndex = 0;
        let renderId = 0;
        let timer;

        let paused = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        async function showSlide(index) {
            currentIndex = (index + games.length) % games.length;

            const game = games[currentIndex];
            const currentRender = ++renderId;

            image.src = game.background_image;
            image.alt = game.name;
            title.textContent = game.name;

            linkToGame(image, game);

            if (playButton) {
                playButton.hidden = false;
                playButton.textContent = "View Game";

                playButton.onclick = () => {
                    window.location.href =
                        `sproduct.html?id=${encodeURIComponent(game.id)}`;
                };
            }

            description.textContent = "Loading description...";

            try {
                if (!detailsCache.has(game.id)) {
                    const request = fetchRawg(`/games/${game.id}`);

                    detailsCache.set(game.id, request);

                    request.catch(() => {
                        if (detailsCache.get(game.id) === request) {
                            detailsCache.delete(game.id);
                        }
                    });
                }

                const details = await detailsCache.get(game.id);

                if (currentRender !== renderId) return;

                description.textContent = shortenDescription(
                    details.description_raw,
                    320
                );
            } catch (error) {
                if (currentRender === renderId) {
                    description.textContent = "Description unavailable.";
                }

                console.error(error);
            }
        }

        function startTimer() {
            clearInterval(timer);

            if (!paused && !document.hidden && games.length > 1) {
                timer = setInterval(() => {
                    showSlide(currentIndex + 1);
                }, 6000);
            }
        }

        previous.addEventListener("click", () => {
            showSlide(currentIndex - 1);
            startTimer();
        });

        next.addEventListener("click", () => {
            showSlide(currentIndex + 1);
            startTimer();
        });

        pause.addEventListener("click", () => {
            paused = !paused;
            pause.textContent = paused ? "Resume" : "Pause";

            startTimer();
        });

        document.addEventListener("visibilitychange", startTimer);

        previous.disabled = games.length < 2;
        next.disabled = games.length < 2;
        pause.disabled = games.length < 2;
        pause.textContent = paused ? "Resume" : "Pause";

        showSlide(0);
        startTimer();
    } catch (error) {
        description.textContent = "Unable to load featured games.";
        console.error(error);
    }
}

async function loadDiscountGames() {
    const container = document.getElementById("discount-container");

    if (!container) return;

    try {
        const data = await fetchRawg("/games");
        const games = getGamesFromResponse(data).slice(0, 4);

        container.replaceChildren();

        if (!games.length) {
            container.textContent = "No games available.";
            return;
        }

        games.forEach(game => {
            const box = document.createElement("div");
            box.className = "dbox";

            linkToGame(box, game);

            const image = createGameImage(game);

            if (image) {
                box.append(image);
            }

            const title = document.createElement("h3");
            title.textContent = game.name;

            const rating = document.createElement("p");
            rating.textContent = game.rating
                ? `⭐ ${game.rating}`
                : "Not rated yet";

            box.append(title, rating);
            container.append(box);
        });
    } catch (error) {
        container.textContent = "Unable to load games.";
        console.error("Unable to load discount section:", error);
    }
}

function getCart() {
    const saved = localStorage.getItem(FOG_CART_KEY);

    if (!saved) return [];

    const cart = JSON.parse(saved);

    if (!Array.isArray(cart)) {
        throw new Error("Invalid saved cart.");
    }

    return cart;
}

function saveCart(cart) {
    localStorage.setItem(FOG_CART_KEY, JSON.stringify(cart));
}

function addGameToCart(game) {
    const cart = getCart();

    const existing = cart.find(
        item => String(item.id) === String(game.id)
    );

    if (existing) return false;

    cart.push({
        id: game.id,
        name: game.name,
        image: game.background_image || "",
        price: null,
        quantity: 1
    });

    saveCart(cart);

    return true;
}

function initializeNewsletter() {
    const form = document.getElementById("newsletter-form");

    if (!form || form.dataset.initialized === "true") return;

    const emailInput = document.getElementById("newsletter-email");
    const message = document.getElementById("newsletter-message");
    const button = form.querySelector('button[type="submit"]');

    if (!emailInput || !message || !button) return;

    form.dataset.initialized = "true";

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (button.disabled) return;

        emailInput.value = emailInput.value.trim();

        if (!form.reportValidity()) return;

        button.disabled = true;
        button.textContent = "Signing up...";
        message.textContent = "";

        try {
            const response = await apiFetch("/newsletter/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: emailInput.value
                }),
                signal: AbortSignal.timeout(20000)
            });

            if (!response.ok) {
                throw new Error("Subscription failed");
            }

            message.textContent =
                "You're subscribed! Thanks for joining FOG.";

            message.style.color = "#a7f3d0";
            form.reset();
        } catch (error) {
            message.textContent =
                "Couldn't subscribe right now. Please try again later.";

            message.style.color = "#fecaca";
        } finally {
            button.disabled = false;
            button.textContent = "Sign up";
        }
    });
}

let fogInitialized = false;

function initializeFog() {
    if (fogInitialized) return;

    fogInitialized = true;

    initializeAccount();
    initializeRegistration();
    initializeNewsletter();
    initializeCategories();
    loadFeaturedSlider();
    loadDiscountGames();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeFog);
} else {
    initializeFog();
}