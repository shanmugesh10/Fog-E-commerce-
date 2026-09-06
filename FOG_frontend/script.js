document.getElementById("loginForm")?.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("http://localhost:8080/api/users/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        });

      const result = await response.text();

if (response.ok && result === "Login successful") {
    window.location.href = "index.html";
} else {
    document.getElementById("loginMessage").textContent = result;
}

    } catch (error) {

        document.getElementById("loginMessage").textContent =
            "Could not connect to server.";

        console.error(error);
    }
});
const page = window.location.pathname;

if (
    page.endsWith("/store.html") ||
    page.endsWith("/index.html") ||
    page.endsWith("/")
) {
    loadRawgImages();
}

async function loadRawgImages() {
    try {
        const response = await fetch(
            "http://localhost:8080/api/rawg/games"
        );

        if (!response.ok) {
            throw new Error(`RAWG request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.results)) {
            throw new Error("RAWG response does not contain games");
        }

        const games = data.results.filter(game => game.background_image);
        const images = document.querySelectorAll("#catgs > .s2 > img");

        await Promise.all(Array.from(images, async (image, index) => {
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
                const detailsResponse = await fetch(
                    `http://localhost:8080/api/rawg/games/${game.id}`
                );

                if (!detailsResponse.ok) {
                    throw new Error("Could not load description");
                }

                const details = await detailsResponse.json();
                const text = (details.description_raw || "").trim();

                description.textContent = text
                    ? text.length > 350
                        ? text.slice(0, 350) + "…"
                        : text
                    : "No description available.";
            } catch (error) {
                description.textContent = "Description unavailable.";
                console.error(error);
            }
        }));
    } catch (error) {
        console.error("Unable to load RAWG games:", error);
    }
}
if (document.getElementById("MP")) {
    loadFeaturedSlider();
}

async function loadFeaturedSlider() {
    const section = document.getElementById("MP");
    const image = section.querySelector("img");
    const content = section.querySelector(".bt");
    const title = content.querySelector("h2");
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
        const response = await fetch(
            "http://localhost:8080/api/rawg/games"
        );

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.results)) {
            throw new Error("Invalid games response");
        }

        const games = data.results
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
                    const request = fetch(
                        `http://localhost:8080/api/rawg/games/${game.id}`
                    ).then(response => {
                        if (!response.ok) {
                            throw new Error("Description request failed");
                        }

                        return response.json();
                    });

                    detailsCache.set(game.id, request);
                }

                const details = await detailsCache.get(game.id);

                if (currentRender !== renderId) return;

                const text = (details.description_raw || "")
                    .replace(/\s+/g, " ")
                    .trim();

                description.textContent = text
                    ? text.length > 320
                        ? text.slice(0, 320) + "…"
                        : text
                    : "No description available.";
            } catch (error) {
                detailsCache.delete(game.id);

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