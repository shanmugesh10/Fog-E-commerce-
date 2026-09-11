const API_BASE = "http://localhost:8080/api";


document.getElementById("loginForm")?.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");

        try {
            const response = await fetch(`${API_BASE}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.text();

            if (response.ok && result.trim() === "Login successful") {
                window.location.href = "index.html";
            } else if (message) {
                message.textContent = result;
            }
        } catch (error) {
            if (message) {
                message.textContent = "Could not connect to server.";
            }

            console.error("Login failed:", error);
        }
    }
);


async function fetchRawg(path, signal) {
    const response = await fetch(`${API_BASE}/rawg${path}`, {
        signal
    });

    if (!response.ok) {
        throw new Error(`RAWG request failed: ${response.status}`);
    }

    return response.json();
}

function getGamesFromResponse(data) {
    if (!Array.isArray(data.results)) {
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

// CATEGORY GAMES
const categoryContainer = document.getElementById("category-games");
const categoryStatus = document.getElementById("category-status");
const categoryButtons = document.querySelectorAll(
    "#catg button[data-category]"
);

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

if (categoryContainer) {
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

if (!categoryContainer) {
    loadRawgImages();
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
            description.textContent = "Loading description...";

            try {
                if (!detailsCache.has(game.id)) {
                    const request = fetchRawg(`/games/${game.id}`);

                    detailsCache.set(game.id, request);

                    // Remove a failed request so it can be retried.
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

if (document.getElementById("MP")) {
    loadFeaturedSlider();
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

if (document.getElementById("discount-container")) {
    loadDiscountGames();
}