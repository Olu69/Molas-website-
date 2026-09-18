/* =========================================================
   MOLAS — SCHOLARSHIP HUB
   SUPABASE-POWERED SCHOLARSHIP DIRECTORY
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://eidnzebqyxcpxbykybch.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";


/* =========================================================
   ELEMENTS
========================================================= */

const scholarshipGrid =
    document.getElementById("scholarship-grid");

const featuredGrid =
    document.getElementById("featured-scholarship-grid");

const loading =
    document.getElementById("scholarship-loading");

const emptyState =
    document.getElementById("scholarship-empty");

const scholarshipCount =
    document.getElementById("scholarship-count");

const searchInput =
    document.getElementById("scholarship-search");

const searchButton =
    document.getElementById("scholarship-search-button");

const levelFilter =
    document.getElementById("scholarship-level-filter");

const statusFilter =
    document.getElementById("scholarship-status-filter");

const clearFiltersButton =
    document.getElementById("clear-scholarship-filters");

const categoryButtons =
    document.querySelectorAll(
        ".scholarship-filter-button"
    );

const categoryCards =
    document.querySelectorAll(
        ".category-card"
    );

const menuToggle =
    document.querySelector(
        ".scholarship-menu-toggle"
    );

const scholarshipNav =
    document.querySelector(
        ".scholarship-nav"
    );


/* =========================================================
   DATA
========================================================= */

let scholarships = [];

let activeCategory = "all";

let currentSearch = "";


/* =========================================================
   SUPABASE REQUEST
========================================================= */

async function fetchScholarships() {

    try {

        showLoading();

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                10000
            );


        const url =
            `${SUPABASE_URL}/rest/v1/scholarships` +
            `?select=*` +
            `&order=created_at.desc`;


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    signal:
                        controller.signal
                }
            );


        clearTimeout(timeout);


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Supabase error ${response.status}: ${errorText}`
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Supabase returned an unexpected response."
            );

        }


        scholarships =
            data;


        console.log(
            "MOLAS scholarships loaded:",
            scholarships
        );


        renderFeaturedScholarships();

        applyFilters();


    } catch (error) {

        console.error(
            "SCHOLARSHIP LOAD ERROR:",
            error
        );


        scholarships = [];


        hideLoading();


        if (
            error.name ===
            "AbortError"
        ) {

            showEmptyState(
                "The scholarship service took too long to respond."
            );

        } else {

            showEmptyState(
                "Unable to load scholarships right now."
            );

        }

    }

}


/* =========================================================
   SHOW LOADING
========================================================= */

function showLoading() {

    if (!loading) {
        return;
    }

    loading.hidden = false;

}


/* =========================================================
   HIDE LOADING
========================================================= */

function hideLoading() {

    if (!loading) {
        return;
    }

    loading.hidden = true;

}


/* =========================================================
   RENDER FEATURED SCHOLARSHIPS
========================================================= */

function renderFeaturedScholarships() {

    if (!featuredGrid) {
        return;
    }


    const featured =
        scholarships
            .filter(
                scholarship =>
                    scholarship.featured === true
            )
            .slice(0, 3);


    featuredGrid.innerHTML = "";


    if (featured.length === 0) {

        featuredGrid.innerHTML = `
            <div class="featured-empty">
                <p>
                    Featured scholarship opportunities
                    will appear here.
                </p>
            </div>
        `;

        return;

    }


    featured.forEach(
        scholarship => {

            featuredGrid.appendChild(
                createScholarshipCard(
                    scholarship,
                    true
                )
            );

        }
    );

}


/* =========================================================
   APPLY FILTERS
========================================================= */

function applyFilters() {

    if (!scholarshipGrid) {
        return;
    }


    const searchValue =
        currentSearch
            .trim()
            .toLowerCase();


    const selectedLevel =
        levelFilter
            ? levelFilter.value
            : "all";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    const filtered =
        scholarships.filter(
            scholarship => {

                const categoryMatch =
                    activeCategory === "all" ||
                    normalize(
                        scholarship.category
                    ) ===
                    normalize(
                        activeCategory
                    );


                const searchableText = [

                    scholarship.title,

                    scholarship.provider,

                    scholarship.description,

                    scholarship.location,

                    scholarship.category,

                    scholarship.level

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const searchMatch =
                    !searchValue ||
                    searchableText.includes(
                        searchValue
                    );


                const levelMatch =
                    selectedLevel === "all" ||
                    normalize(
                        scholarship.level
                    ) ===
                    normalize(
                        selectedLevel
                    );


                const statusMatch =
                    selectedStatus === "all" ||
                    normalize(
                        scholarship.status
                    ) ===
                    normalize(
                        selectedStatus
                    );


                return (
                    categoryMatch &&
                    searchMatch &&
                    levelMatch &&
                    statusMatch
                );

            }
        );


    renderScholarships(filtered);

}


/* =========================================================
   RENDER DIRECTORY
========================================================= */

function renderScholarships(data) {

    hideLoading();


    if (!scholarshipGrid) {
        return;
    }


    scholarshipGrid.innerHTML = "";


    if (scholarshipCount) {

        scholarshipCount.textContent =
            `${data.length} ${
                data.length === 1
                    ? "opportunity"
                    : "opportunities"
            }`;

    }


    if (data.length === 0) {

        showEmptyState();

        return;

    }


    hideEmptyState();


    data.forEach(
        scholarship => {

            scholarshipGrid.appendChild(
                createScholarshipCard(
                    scholarship,
                    false
                )
            );

        }
    );

}


/* =========================================================
   CREATE SCHOLARSHIP CARD
========================================================= */

function createScholarshipCard(
    scholarship,
    featured = false
) {

    const card =
        document.createElement("article");


    card.className =
        featured
            ? "scholarship-card scholarship-card-featured"
            : "scholarship-card";


    const status =
        getScholarshipStatus(
            scholarship
        );


    const deadline =
        formatDeadline(
            scholarship.deadline
        );


    const countdown =
        getCountdown(
            scholarship.deadline
        );


    const level =
        formatLabel(
            scholarship.level
        );


    const category =
        formatLabel(
            scholarship.category
        );


    const location =
        scholarship.location ||
        "Nigeria";


    const provider =
        scholarship.provider ||
        "MOLAS Scholarship Hub";


    const description =
        scholarship.description ||
        "Scholarship opportunity available for eligible students.";


    const image =
        scholarship.image_url ||
        "";


    /* =====================================================
       IMAGE
    ===================================================== */

    const imageBox =
        document.createElement("div");

    imageBox.className =
        "scholarship-card-image";


    if (image) {

        const imageElement =
            document.createElement("img");


        imageElement.src =
            image;


        imageElement.alt =
            scholarship.title ||
            "Scholarship opportunity";


        imageElement.loading =
            "lazy";


        imageElement.onerror =
            function () {

                imageBox.classList.add(
                    "image-fallback"
                );

                imageElement.remove();

            };


        imageBox.appendChild(
            imageElement
        );

    } else {

        imageBox.classList.add(
            "image-fallback"
        );

    }


    /* =====================================================
       STATUS
    ===================================================== */

    const statusBadge =
        document.createElement("span");


    statusBadge.className =
        `scholarship-status scholarship-status-${status.key}`;


    statusBadge.textContent =
        status.label;


    imageBox.appendChild(
        statusBadge
    );


    /* =====================================================
       CONTENT
    ===================================================== */

    const content =
        document.createElement("div");


    content.className =
        "scholarship-card-content";


    /* PROVIDER */

    const providerElement =
        document.createElement("span");


    providerElement.className =
        "scholarship-provider";


    providerElement.textContent =
        provider;


    /* TITLE */

    const title =
        document.createElement("h3");


    title.className =
        "scholarship-card-title";


    title.textContent =
        scholarship.title ||
        "Scholarship Opportunity";


    /* DESCRIPTION */

    const descriptionElement =
        document.createElement("p");


    descriptionElement.className =
        "scholarship-card-description";


    descriptionElement.textContent =
        description;


    /* META */

    const meta =
        document.createElement("div");


    meta.className =
        "scholarship-card-meta";


    const levelElement =
        document.createElement("span");


    levelElement.className =
        "scholarship-meta-item";


    levelElement.textContent =
        level;


    const locationElement =
        document.createElement("span");


    locationElement.className =
        "scholarship-meta-item";


    locationElement.textContent =
        location;


    meta.appendChild(
        levelElement
    );


    meta.appendChild(
        locationElement
    );


    /* CATEGORY */

    const categoryElement =
        document.createElement("span");


    categoryElement.className =
        "scholarship-category";


    categoryElement.textContent =
        category;


    /* BOTTOM */

    const bottom =
        document.createElement("div");


    bottom.className =
        "scholarship-card-bottom";


    /* DEADLINE */

    const deadlineBox =
        document.createElement("div");


    deadlineBox.className =
        "scholarship-deadline";


    const deadlineLabel =
        document.createElement("span");


    deadlineLabel.className =
        "scholarship-deadline-label";


    deadlineLabel.textContent =
        "Deadline";


    const deadlineValue =
        document.createElement("strong");


    deadlineValue.textContent =
        deadline;


    deadlineBox.appendChild(
        deadlineLabel
    );


    deadlineBox.appendChild(
        deadlineValue
    );


    /* COUNTDOWN */

    const countdownBox =
        document.createElement("div");


    countdownBox.className =
        "scholarship-countdown";


    const countdownRing =
        document.createElement("div");


    countdownRing.className =
        "countdown-ring";


    const countdownText =
        document.createElement("span");


    countdownText.textContent =
        countdown;


    countdownRing.appendChild(
        countdownText
    );


    countdownBox.appendChild(
        countdownRing
    );


    bottom.appendChild(
        deadlineBox
    );


    bottom.appendChild(
        countdownBox
    );


    /* VIEW DETAILS */

    const detailsLink =
        document.createElement("a");


    detailsLink.className =
        "scholarship-view-details";


    detailsLink.href =
        `scholarship.html?id=${encodeURIComponent(
            scholarship.id
        )}`;


    detailsLink.textContent =
        "View Details →";


    /* ASSEMBLE */

    content.appendChild(
        providerElement
    );


    content.appendChild(
        title
    );


    content.appendChild(
        descriptionElement
    );


    content.appendChild(
        meta
    );


    content.appendChild(
        categoryElement
    );


    content.appendChild(
        bottom
    );


    content.appendChild(
        detailsLink
    );


    card.appendChild(
        imageBox
    );


    card.appendChild(
        content
    );


    return card;

}


/* =========================================================
   SCHOLARSHIP STATUS
========================================================= */

function getScholarshipStatus(
    scholarship
) {

    const databaseStatus =
        normalize(
            scholarship.status
        );


    if (
        databaseStatus ===
        "closed"
    ) {

        return {
            key: "closed",
            label: "Closed"
        };

    }


    if (
        databaseStatus ===
        "closing-soon"
    ) {

        return {
            key: "closing-soon",
            label: "Closing Soon"
        };

    }


    if (
        scholarship.deadline
    ) {

        const deadline =
            new Date(
                `${scholarship.deadline}T23:59:59`
            );


        const now =
            new Date();


        const difference =
            deadline.getTime() -
            now.getTime();


        const days =
            Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
            );


        if (
            days < 0
        ) {

            return {
                key: "closed",
                label: "Closed"
            };

        }


        if (
            days <= 14
        ) {

            return {
                key: "closing-soon",
                label: "Closing Soon"
            };

        }

    }


    return {
        key: "open",
        label: "Open"
    };

}


/* =========================================================
   COUNTDOWN
========================================================= */

function getCountdown(
    deadline
) {

    if (!deadline) {
        return "—";
    }


    const target =
        new Date(
            `${deadline}T23:59:59`
        );


    const now =
        new Date();


    const difference =
        target.getTime() -
        now.getTime();


    if (
        difference <= 0
    ) {

        return "Closed";

    }


    const days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    if (
        days === 1
    ) {

        return "1 day";

    }


    return `${days} days`;

}


/* =========================================================
   FORMAT DEADLINE
========================================================= */

function formatDeadline(
    deadline
) {

    if (!deadline) {
        return "No deadline";
    }


    const date =
        new Date(
            `${deadline}T00:00:00`
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "No deadline";

    }


    return date.toLocaleDateString(
        "en-NG",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================================
   FORMAT LABEL
========================================================= */

function formatLabel(
    value
) {

    if (!value) {
        return "";
    }


    return value
        .replace(
            /[-_]/g,
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


/* =========================================================
   NORMALIZE
========================================================= */

function normalize(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /[_\s]+/g,
            "-"
        );

}


/* =========================================================
   SHOW EMPTY STATE
========================================================= */

function showEmptyState(
    message
) {

    if (!emptyState) {
        return;
    }


    emptyState.hidden =
        false;


    if (message) {

        const emptyText =
            emptyState.querySelector(
                "p"
            );


        if (emptyText) {

            emptyText.textContent =
                message;

        }

    }

}


/* =========================================================
   HIDE EMPTY STATE
========================================================= */

function hideEmptyState() {

    if (!emptyState) {
        return;
    }


    emptyState.hidden =
        true;

}


/* =========================================================
   SEARCH
========================================================= */

function performSearch() {

    currentSearch =
        searchInput
            ? searchInput.value
            : "";


    applyFilters();


    const directory =
        document.getElementById(
            "scholarships"
        );


    if (
        directory &&
        currentSearch.trim()
    ) {

        directory.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   SEARCH BUTTON
========================================================= */

if (searchButton) {

    searchButton.addEventListener(
        "click",
        performSearch
    );

}


/* =========================================================
   SEARCH ENTER
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                performSearch();

            }

        }
    );

}


/* =========================================================
   LIVE SEARCH
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            currentSearch =
                searchInput.value;

            applyFilters();

        }
    );

}


/* =========================================================
   CATEGORY FILTER BUTTONS
========================================================= */

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                activeCategory =
                    button.dataset.category ||
                    "all";


                applyFilters();

            }
        );

    }
);


/* =========================================================
   CATEGORY CARDS
========================================================= */

categoryCards.forEach(
    card => {

        card.addEventListener(
            "click",
            () => {

                const category =
                    card.dataset.category ||
                    "all";


                activeCategory =
                    category;


                categoryButtons.forEach(
                    button => {

                        button.classList.toggle(
                            "active",
                            normalize(
                                button.dataset.category
                            ) ===
                            normalize(
                                category
                            )
                        );

                    }
                );


                applyFilters();


                const directory =
                    document.getElementById(
                        "scholarships"
                    );


                if (directory) {

                    directory.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    }
);


/* =========================================================
   LEVEL FILTER
========================================================= */

if (levelFilter) {

    levelFilter.addEventListener(
        "change",
        applyFilters
    );

}


/* =========================================================
   STATUS FILTER
========================================================= */

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        applyFilters
    );

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

if (clearFiltersButton) {

    clearFiltersButton.addEventListener(
        "click",
        () => {

            activeCategory =
                "all";


            currentSearch =
                "";


            if (searchInput) {

                searchInput.value =
                    "";

            }


            if (levelFilter) {

                levelFilter.value =
                    "all";

            }


            if (statusFilter) {

                statusFilter.value =
                    "all";

            }


            categoryButtons.forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.category ===
                        "all"
                    );

                }
            );


            applyFilters();

        }
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

if (
    menuToggle &&
    scholarshipNav
) {

    menuToggle.addEventListener(
        "click",
        () => {

            const isOpen =
                scholarshipNav.classList.toggle(
                    "open"
                );


            menuToggle.setAttribute(
                "aria-expanded",
                isOpen
                    ? "true"
                    : "false"
            );

        }
    );


    scholarshipNav
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        scholarshipNav.classList.remove(
                            "open"
                        );


                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   START
========================================================= */

fetchScholarships();