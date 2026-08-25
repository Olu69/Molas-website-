/* =========================================================
   MOLAS JAMB HUB
   COMPLETE JAVASCRIPT
   ---------------------------------------------------------
   JAMB NEWS SOURCE:
   Supabase → public.jamb_news

   IMPORTANT:
   This is completely separate from the main MOLAS news.
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://eidnzebqyxcpxbykybch.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";


/* =========================================================
   SUPABASE REQUEST
========================================================= */

async function supabaseRequest(endpoint) {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${endpoint}`,
        {
            method: "GET",

            headers: {
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json"
            }
        }
    );


    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            "SUPABASE ERROR:",
            response.status,
            errorText
        );

        throw new Error(
            `Supabase error ${response.status}: ${errorText}`
        );
    }


    return await response.json();
}


/* =========================================================
   PAGE READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupJambNewsToggle();

    }
);


/* =========================================================
   JAMB NEWS TOGGLE
   ---------------------------------------------------------
   News stays hidden until the user clicks
   the JAMB NEWS box.
========================================================= */

function setupJambNewsToggle() {

    const newsBanner =
        document.querySelector(
            ".jamb-news-banner"
        );


    const newsList =
        document.getElementById(
            "jamb-news-list"
        );


    if (!newsBanner || !newsList) {

        console.warn(
            "JAMB NEWS elements not found."
        );

        return;
    }


    /* Hide news when page first loads */

    newsList.style.display = "none";


    /* Make banner clickable */

    newsBanner.style.cursor = "pointer";


    newsBanner.addEventListener(
        "click",
        async function () {


            /* =====================================
               CLOSE NEWS
            ===================================== */

            if (
                newsList.style.display === "block"
            ) {

                newsList.style.display = "none";

                newsBanner.classList.remove(
                    "jamb-news-open"
                );

                return;
            }


            /* =====================================
               OPEN NEWS
            ===================================== */

            newsList.style.display = "block";

            newsBanner.classList.add(
                "jamb-news-open"
            );


            /* Load JAMB news */

            await loadJambNews();

        }
    );
}


/* =========================================================
   LOAD JAMB NEWS
   ---------------------------------------------------------
   ONLY public.jamb_news is used here.

   Nothing is pulled from the main MOLAS
   news table.
========================================================= */

async function loadJambNews() {

    const newsList =
        document.getElementById(
            "jamb-news-list"
        );


    if (!newsList) {
        return;
    }


    /* Loading message */

    newsList.innerHTML = `
        <div class="jamb-news-loading">
            Loading latest JAMB news...
        </div>
    `;


    try {

        console.log(
            "Loading JAMB news from Supabase..."
        );


        /*
         * IMPORTANT:
         * Only the jamb_news table is queried.
         */

        const news =
            await supabaseRequest(
                "jamb_news?select=*&order=published_at.desc"
            );


        console.log(
            "JAMB NEWS FROM SUPABASE:",
            news
        );


        /* =====================================
           NO NEWS
        ===================================== */

        if (
            !Array.isArray(news) ||
            news.length === 0
        ) {

            newsList.innerHTML = `
                <div class="jamb-news-loading">
                    No JAMB news available yet.
                </div>
            `;

            return;
        }


        /* =====================================
           CREATE NEWS CARDS
        ===================================== */

        newsList.innerHTML =
            news
                .map(
                    createJambNewsCard
                )
                .join("");


        /* Make cards clickable */

        attachJambNewsLinks();

    }


    catch (error) {

        console.error(
            "JAMB NEWS LOAD FAILED:",
            error
        );


        newsList.innerHTML = `
            <div class="jamb-news-loading">
                Unable to load JAMB news right now.
            </div>
        `;
    }
}


/* =========================================================
   CREATE JAMB NEWS CARD
========================================================= */

function createJambNewsCard(article) {


    const id =
        escapeHTML(
            article.id || ""
        );


    const title =
        escapeHTML(
            article.title ||
            "JAMB Update"
        );


    const excerpt =
        escapeHTML(
            article.excerpt ||
            ""
        );


    const source =
        escapeHTML(
            article.source ||
            "MOLAS"
        );


    const date =
        formatJambDate(
            article.published_at ||
            article.created_at
        );


    /* =====================================
       IMAGE
    ===================================== */

    let imageHTML = "";


    if (article.image_url) {

        imageHTML = `
            <div class="jamb-news-image">

                <img
                    src="${escapeAttribute(
                        article.image_url
                    )}"
                    alt="${title}"
                    loading="lazy"
                >

            </div>
        `;
    }


    /* =====================================
       BREAKING LABEL
    ===================================== */

    let breakingHTML = "";


    if (
        article.breaking === true ||
        article.breaking === "true"
    ) {

        breakingHTML = `
            <span class="jamb-news-breaking">
                BREAKING
            </span>
        `;
    }


    /* =====================================
       NEWS CARD
    ===================================== */

    return `

        <article
            class="jamb-news-item jamb-news-card"
            data-news-id="${id}"
        >

            ${imageHTML}


            <div class="jamb-news-card-content">


                <div class="jamb-news-meta">

                    <span class="news-category">
                        JAMB
                    </span>

                    ${breakingHTML}

                </div>


                <h3>
                    ${title}
                </h3>


                ${
                    excerpt
                        ? `
                            <p>
                                ${excerpt}
                            </p>
                          `
                        : ""
                }


                ${
                    source
                        ? `
                            <small class="jamb-news-source">
                                ${source}
                            </small>
                          `
                        : ""
                }

            </div>


            <time>
                ${date}
            </time>


        </article>

    `;
}


/* =========================================================
   NEWS CARD CLICK
   ---------------------------------------------------------
   Opens the individual JAMB news article.
========================================================= */

function attachJambNewsLinks() {


    const articles =
        document.querySelectorAll(
            ".jamb-news-card"
        );


    articles.forEach(
        function (article) {


            article.style.cursor =
                "pointer";


            article.addEventListener(
                "click",
                function () {


                    const id =
                        article.dataset.newsId;


                    if (!id) {

                        console.warn(
                            "JAMB news ID missing."
                        );

                        return;
                    }


                    window.location.href =
                        `jamb-news-article.html?id=${encodeURIComponent(id)}`;

                }
            );

        }
    );
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatJambDate(
    dateString
) {


    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }


    return date.toLocaleDateString(
        "en-NG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        );
}