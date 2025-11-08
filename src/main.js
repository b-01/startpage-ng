const LOCALSTORAGE_SEARCHENGINE_KEY = "LOCALSTORAGE_SEARCHENGINE_KEY";
const LOCALSTORAGE_WEATHERPOINTID_KEY = "LOCALSTORAGE_WEATHERPOINTID_KEY";
const LOCALSTORAGE_WEATHERDATA_KEY = "LOCALSTORAGE_WEATHERDATA_KEY";
const LOCALSTORAGE_CARDS_VISIBLE_KEY = "LOCALSTORAGE_CARDS_VISIBLE_KEY";
const LOCALSTORAGE_CARDDATA_KEY = "LOCALSTORAGE_CARDDATA_KEY";

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function () {
    // Initialize clock and date
    updateClock();
    setInterval(updateClock, 1000);
    updateDate();
    // Load Group data from localstorage
    renderLinkGroups(getLinkGroups());
    // Load work toggle button from localstorage and update view 
    document.getElementById("toggle-work").checked = areWorkCardsVisible();
    renderWorkCards(areWorkCardsVisible());
    // Fetch weather data
    fetchAndRenderWeatherData(getWeatherPointID());
    // 
    // Initialize event listeners
    // 
    // Search bar enter
    const searchBar = document.getElementById("search-bar");
    searchBar.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            search(this.value);
        }
    });
    // Settings panel toggle
    document.getElementById("settings-toggle").addEventListener("click", function () {
        document.getElementById("settings-panel").classList.add("active");
        updateExportData();
        // render WeatherPointID from localStorage
        renderWeatherPointID(getWeatherPointID());
        // Load Searchengine data from localstorage
        renderSearchEngineURL(getSearchEngineUrl());
    });
    // Close settings panel
    document.getElementById("close-settings").addEventListener("click", function () {
        document.getElementById("settings-panel").classList.remove("active");
    });
    // Save SearchEngine button
    document.getElementById("save-search-engine-btn").addEventListener("click", function () {
        saveSearchEngineUrl(document.getElementById("search-engine").value);
    });
    // Save WeatherPointID button
    document.getElementById("save-weather-point-btn").addEventListener("click", function () {
        fetchAndRenderWeatherData(saveWeatherPointID(document.getElementById("weather-point").value));
    });
    // Export button
    document.getElementById("export-btn").addEventListener("click", function () {
        updateExportData(true);
    });
    // Import button
    document.getElementById("import-btn").addEventListener("click", function () {
        importData();
    });
    // Work toggle
    document.getElementById("toggle-work").addEventListener("change", function () {
        renderWorkCards(saveWorkCardsVisible(this.checked));
    });
});

/**
 * Check if a string is a URL/Domain 
 * @param {String} str The string to check for an URL
 * @returns true/false
 */
function is_url(str) {
    regexp = /^(?:(?:https?):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(str)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Search function. Either uses the keywords with the defined search engine, directly
 * opens the site in a new tab or uses the default search engine.
 * @param {String} raw_query The raw query entered by the user.
 */
function search(raw_query) {
    const query = raw_query.trim();
    var urlToOpen = "";

    if (query) {
        switch (query.substring(0, 2)) {
            // Duckduckgo - search with DDGO.
            case "-d":
                urlToOpen = `https://duckduckgo.com/?q=${encodeURIComponent(query.substring(3))}`;
                break;
            // Kagi - Translate Text from German to English
            case "-t":
                urlToOpen = `https://translate.kagi.com/?to=en&text=${encodeURIComponent(query.substring(3))}`;
                break;
            // Startpage - search with Startpage
            case "-s":
                urlToOpen = `https://www.startpage.com/do/dsearch?prfe=4fb272a9fd7b618b9a28a5d2ca2896e5833d809fd708caa6aa28761082f8ab66dc198d69e09c17028ae46f98d6d92b81c61756ec7b4f2ba024a855760df61e44557d06214932bd14d869d7d42ebf4f164748&query=${encodeURIComponent(query.substring(3))}`;
                break;
            default:
                if (is_url(query)) {
                    urlToOpen = query;
                    if (!urlToOpen.startsWith("http")) {
                        urlToOpen = "https://" + urlToOpen;
                    }
                } else {
                    urlToOpen = `${getSearchEngineUrl()}${encodeURIComponent(query)}`;
                }
        }
        window.open(urlToOpen, "_blank");
    }
}

/**
 * Returns the locale to format date/time.
 * @returns the locale to use.
 */
function getLocale() {
    return "de-DE";
}

/**
 * Update the clock display with current time
 */
function updateClock() {
    document.getElementById("time").textContent = new Date()
        .toLocaleTimeString(
            getLocale(),
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });
}

/**
 * Update the date display with current date
 */
function updateDate() {
    document.getElementById("date").textContent = new Date()
        .toLocaleDateString(
            getLocale(),
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            });
}

/**
 * Store weather data in localstorage together with the current timestamp.
 * This ensures, that old weather data can be discarded and reloaded if needed.
 * @param {*} weatherData the weather data to store
 * @returns the `weatherData`
 */
function saveWeatherData(weatherData) {
    localStorage.setItem(LOCALSTORAGE_WEATHERDATA_KEY, JSON.stringify({
        date: Date.now(),
        weatherData: weatherData
    }));
    return weatherData;
}

/**
 * Returns the weather data stored in localStorage if the current day is the same
 * day as the stored timestamp. if not, return null
 * @returns {object|null} weather data or null
 */
function getDailyWeatherStats() {
    try {
        const parsedData = JSON.parse(localStorage.getItem(LOCALSTORAGE_WEATHERDATA_KEY));
        const today = new Date();
        const parsed = new Date(parsedData.date);
        if (parsed.getDate() === today.getDate()
            && parsed.getMonth() === today.getMonth()
            && parsed.getFullYear() === today.getFullYear()
            && typeof parsedData.weatherData === 'object'
        ) {
            return parsedData.weatherData;
        }
    } catch (e) {
        console.error("Failed to parse weather data:", e);
    }
    return null;
}

/**
 * Returns true if work cards should be visible else false.
 * @returns true if work cards should be visible else false.
 */
function areWorkCardsVisible() {
    return localStorage.getItem(LOCALSTORAGE_CARDS_VISIBLE_KEY) === "true";
}

/**
 * Save info if work cards should be visible to localStorage.
 * @param {boolean} value Any value that evaluates to true/false.
 * @returns the `value`
 */
function saveWorkCardsVisible(value) {
    localStorage.setItem(LOCALSTORAGE_CARDS_VISIBLE_KEY, value ? "true" : "false");
    return value;
}

/**
 * Show or Hide work cards depending on the param.
 * @param {boolean} workCardsVisible true/false -> show/hide work cards
 */
function renderWorkCards(workCardsVisible) {
    document
        .querySelectorAll('.card[data-work-group="true"]')
        .forEach(group => {
            group.style.display = workCardsVisible ? "block" : "none";
        });
}

/**
 * Load weather point id from localstorage.
 * If no point is present, load and save the default point.
 * @returns {String} the pointID as string
 */
function getWeatherPointID() {
    // ID for vienna
    const default_pointID = 2193;
    const localStorageUrl = localStorage.getItem(LOCALSTORAGE_WEATHERPOINTID_KEY);
    if (localStorageUrl) {
        try {
            return JSON.parse(localStorageUrl);
        } catch (e) {
            console.error("Failed to parse saved Weather Point ID:", e);
        }
    }
    return saveWeatherPointID(default_pointID);

}

/**
 * Render the weather point in the settings input field
 * @param {String|int} pointID the point id
 */
function renderWeatherPointID(pointID) {
    document.getElementById("weather-point").value = pointID;
}

/**
 * Saves the provided `pointID` to localStorage
 * @param {*} pointID the point id to save
 * @returns the provided point id
 */
function saveWeatherPointID(pointID) {
    localStorage.setItem(LOCALSTORAGE_WEATHERPOINTID_KEY, JSON.stringify(pointID));
    return pointID;
}

/**
 * Load search engine url from localStorage. 
 * If no url is present load and save the default url.
 * @returns {String} the searchengine url as string
 */
function getSearchEngineUrl() {
    const default_url = "https://duckduckgo.com/?q=";
    const localStorageUrl = localStorage.getItem(LOCALSTORAGE_SEARCHENGINE_KEY);
    if (localStorageUrl) {
        try {
            return JSON.parse(localStorageUrl);
        } catch (e) {
            console.error("Failed to parse saved Searchengine URL:", e);
        }
    }
    return saveSearchEngineUrl(default_url);
}

/**
 * Render the searchengine url in the settings input field
 */
function renderSearchEngineURL(url) {
    document.getElementById("search-engine").value = url;
}

/**
 * Saves the provided `url` to localStorage
 * @param {String} url the search engine url to save
 * @returns {String} the provided url
 */
function saveSearchEngineUrl(url) {
    localStorage.setItem(LOCALSTORAGE_SEARCHENGINE_KEY, JSON.stringify(url));
    return url;
}

/**
 * Load link groups from localStorage. 
 * If no groups are present load and save the default groups.
 * @returns {Array} linkGroups List of linkGroups
 */
function getLinkGroups() {
    const linkGroups = localStorage.getItem(LOCALSTORAGE_CARDDATA_KEY);
    if (linkGroups) {
        try {
            return JSON.parse(linkGroups);
        } catch (e) {
            console.error("Failed to parse saved link groups:", e);
        }
    }
    return saveLinkGroups(initializeDefaultGroups());
}

/**
 * Initialize default link groups if none exist
 */
function initializeDefaultGroups() {
    return [
        {
            id: "group1",
            name: "General",
            isWorkGroup: false,
            links: [
                { name: "Google", url: "https://www.google.com", icon: "🔍" },
                { name: "YouTube", url: "https://www.youtube.com", icon: "📺" },
                { name: "Wikipedia", url: "https://www.wikipedia.org", icon: "📚" }
            ]
        },
        {
            id: "group2",
            name: "Work",
            isWorkGroup: true,
            links: [
                { name: "Gmail", url: "https://mail.google.com", icon: "📧" },
                { name: "Drive", url: "https://drive.google.com", icon: "📁" },
                { name: "Calendar", url: "https://calendar.google.com", icon: "📅" }
            ]
        }
    ];
}

/**
 * Render link groups in the main UI
 * @param {Array} linkGroups List of linkGroups
 */
function renderLinkGroups(linkGroups) {
    const container = document.getElementById("link-container");
    container.innerHTML = "";

    linkGroups.forEach(group => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.id = group.id;
        if (group.isWorkGroup) {
            card.dataset.workGroup = "true";
        }

        // Card title
        const cardTitle = document.createElement("div");
        cardTitle.className = "card-title";
        cardTitle.innerHTML = `<span>${group.name}</span>`;

        // Card body
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        // Links
        group.links.forEach(link => {
            const linkItem = document.createElement("a");
            linkItem.className = "link-item";
            linkItem.href = link.url;
            linkItem.target = "_blank";
            linkItem.innerHTML = `
                <span class="link-icon noto-color-emoji-regular">${link.icon}</span>
                <span>${link.name}</span>
            `;

            cardBody.appendChild(linkItem);
        });

        card.appendChild(cardTitle);
        card.appendChild(cardBody);
        container.appendChild(card);
    });

    renderWorkCards(areWorkCardsVisible());
}

/**
 * Save link groups to localStorage
 * @param linkGroups the groups object to save
 * @returns the `linkGroups`
 */
function saveLinkGroups(linkGroups) {
    localStorage.setItem(LOCALSTORAGE_CARDDATA_KEY, JSON.stringify(linkGroups));
    return linkGroups;
}

/**
 * Fetches and renders weather data
 */
async function fetchAndRenderWeatherData(point) {
    let weatherData = getDailyWeatherStats();

    try {
        if (weatherData === null) {
            // Load data
            const corsProxy = "https://corsproxy.io/?url=";
            const apiUrl = `https://www.geosphere.at/data/forecasts/flexi/${point}`;
            const response = await fetch(corsProxy + encodeURIComponent(apiUrl));

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            weatherData = processWeatherData(await response.json());
            saveWeatherData(weatherData);
        }
        renderWeatherUI(weatherData);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

/**
 * Update the weather UI with the fetched data
 */
function renderWeatherUI(weatherData) {
    if (!weatherData) return;

    for (let index = 0; index < 4; index++) {
        const date = new Date();
        date.setDate(date.getDate() + index);

        const weekday = date.toLocaleString(getLocale(), { weekday: "long" });
        const dateStr = date.toLocaleDateString(getLocale(), {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });

        if (weatherData[dateStr]) {
            document.getElementById(`weather-date-${index}`).textContent = dateStr;
            document.getElementById(`weather-day-${index}`).textContent = weekday;
            document.getElementById(`min-temp-${index}`).textContent = weatherData[dateStr].minTemp.toFixed(1);
            document.getElementById(`max-temp-${index}`).textContent = weatherData[dateStr].maxTemp.toFixed(1);
            document.getElementById(`rainfall-${index}`).textContent = weatherData[dateStr].totalRain.toFixed(1);
            document.getElementById(`wind-${index}`).textContent = weatherData[dateStr].maxWind.toFixed(1);
        }
    }
}

/**
 * Processes the raw data into a more usable format and 
 * groups the data by day and calculates min/max values.
 * 
 * @param {Object} jsonData - Raw data from the API
 * @returns {Object} Daily statistics by date
 */
function processWeatherData(jsonData) {
    if (!jsonData || !jsonData.timestamps || !jsonData.features || jsonData.features.length === 0) {
        return [];
    }
    const dailyStats = {};

    const timestamps = jsonData.timestamps;
    const parameters = jsonData.features[0].properties.parameters;

    // Map the data into an array of objects with timestamps and values
    processedWeatherData = timestamps.map((timestamp, index) => {
        return {
            timestamp: new Date(timestamp),
            temp: parameters.t2m.data[index],
            rain: parameters.rr.data[index],
            wind: parameters.ff.data[index],
            windMax: parameters.fx.data[index]
        };
    });

    processedWeatherData.forEach(item => {
        const dateStr = item.timestamp.toLocaleDateString(getLocale(), {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });

        if (!dailyStats[dateStr]) {
            dailyStats[dateStr] = {
                date: new Date(dateStr),
                minTemp: Infinity,
                maxTemp: -Infinity,
                totalRain: 0,
                maxWind: 0
            };
        }
        // Update min/max temperature
        dailyStats[dateStr].minTemp = Math.min(dailyStats[dateStr].minTemp, item.temp || 0);
        dailyStats[dateStr].maxTemp = Math.max(dailyStats[dateStr].maxTemp, item.temp || 0);
        // Add rain (accumulating)
        dailyStats[dateStr].totalRain += item.rain || 0;
        // wind
        dailyStats[dateStr].maxWind = Math.max(dailyStats[dateStr].maxWind, item.windMax || 0);
    });

    return dailyStats;
}

/**
 * Update the export data textarea with the current settings
 * @param {boolean} andCopy (optional; default=false) if the updated ExportData should also be copied into the users clipboard.
 */
function updateExportData(andCopy=false) {
    const exportData = {
        version: 1,
        timestamp: Date.now(),
        searchEngineURL: getSearchEngineUrl(),
        workCardsVisible: areWorkCardsVisible(),
        weatherPointID: getWeatherPointID(),
        linkGroups: getLinkGroups()
    };

    json_data = JSON.stringify(exportData, null, 2);
    document.getElementById("export-data").value = json_data;
    // write to clipboard
    if(andCopy) {
        navigator.clipboard.write([
            new ClipboardItem(
                {
                    ["text/plain"]: json_data
                }
            )
        ]);
    }
}

/**
 * Import data from the import textarea
 */
function importData() {
    const importText = document.getElementById("import-data").value.trim();

    if (!importText) {
        alert("Please paste your exported data first.");
        return;
    }

    try {
        const importData = JSON.parse(importText);

        if (!Object.hasOwn(importData, "linkGroups") ||
            !Array.isArray(importData.linkGroups) ||
            !Object.hasOwn(importData, "searchEngineURL") ||
            !Object.hasOwn(importData, "workCardsVisible") ||
            !Object.hasOwn(importData, "weatherPointID")) {
            throw new Error("Invalid import data format");
        }

        // Validate each group and link
        importData.linkGroups.forEach(group => {
            if (!group.id || !group.name || !Array.isArray(group.links)) {
                throw new Error("Invalid group format");
            }

            group.links.forEach(link => {
                if (!link.name || !link.url || !link.icon) {
                    throw new Error("Invalid link format");
                }
            });
        });

        // Import successful, update linkGroups
        if (confirm("This will replace all your current groups and links. Continue?")) {
            renderLinkGroups(saveLinkGroups(importData.linkGroups));
            renderSearchEngineURL(saveSearchEngineUrl(importData.searchEngineURL));
            renderWorkCards(saveWorkCardsVisible(importData.workCardsVisible));
            renderWeatherPointID(saveWeatherPointID(importData.weatherPointID));
            alert("Import successful!");
        }
    } catch (e) {
        console.error("Import error:", e);
        alert("Error importing data: " + e.message);
    }
}