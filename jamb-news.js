/* =========================================================
   MOLAS — JAMB NEWS PAGE
   Loads news from Supabase: jamb_news
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://eidnzebqyxcpxbykybch.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";


/* =========================================================
   SETTINGS
========================================================= */

const NEWS_PER_PAGE = 6;

let jambNews = [];
let visibleNews = 0;


/* =========================================================
   ELEMENTS
========================================================= */

const newsList =
    document.getElementById("jamb-news-list");

const loadMoreButton =
    document.getElementById("jamb-load-more");

const loadMoreWrapper =
    document.getElementById("jamb-load-more-wrapper");


/* =========================================================
   LOAD JAMB NEWS
========================================================= */

async function loadJAMBNews() {

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/jamb_news?select=*&status=eq.published&order=published_at.desc`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );


        if (!response.ok) {
            throw new Error("Unable to load JAMB news.");
        }


        jambNews = await response.json();


        newsList.innerHTML = "";


        /* NO NEWS */

        if (jambNews.length === 0) {

            newsList.innerHTML = `
                <div class="news-empty">
                    <h3>No JAMB news available yet.</h3>
                    <p>Check back soon for the latest updates.</p>
                </div>
            `;

            loadMoreWrapper.style.display = "none";

            return;
        }


        /* SHOW FIRST BATCH */

        showMoreNews();


    } catch (error) {

        console.error("JAMB NEWS ERROR:", error);


        newsList.innerHTML = `
            <div class="news-error">
                <h3>JAMB News Is Temporarily Unavailable</h3>
                <p>
                    Please try again shortly.
                </p>
            </div>
        `;

        loadMoreWrapper.style.display = "none";
    }

}


/* =========================================================
   SHOW MORE NEWS
========================================================= */

function showMoreNews() {

    const nextNews =
        jambNews.slice(
            visibleNews,
            visibleNews + NEWS_PER_PAGE
        );


    nextNews.forEach(article => {

        newsList.insertAdjacentHTML(
            "beforeend",
            createNewsCard(article)
        );

    });


    visibleNews += nextNews.length;


    if (visibleNews >= jambNews.length) {

        loadMoreWrapper.style.display = "none";

    } else {

        loadMoreWrapper.style.display = "flex";

    }

}


/* =========================================================
   CREATE NEWS CARD
========================================================= */

function createNewsCard(article) {

    const title =
        escapeHTML(article.title || "JAMB Update");

    const excerpt =
        escapeHTML(article.excerpt || "");

    const source =
        escapeHTML(article.source || "JAMB");

    const date =
        formatDate(
            article.published_at ||
            article.created_at
        );

    const image =
        article.image_url || "Molas.png";


    return `
        <article class="jamb-news-card">

            <div class="jamb-news-image">

                <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(title)}"
                    loading="lazy"
                >

                ${
                    article.breaking
                        ? `
                            <span class="jamb-breaking-badge">
                                BREAKING
                            </span>
                          `
                        : ""
                }

            </div>


            <div class="jamb-news-content">

                <div class="jamb-news-meta">

                    <span class="jamb-news-source">
                        ${source}
                    </span>

                    <time>
                        ${date}
                    </time>

                </div>


                <h3>
                    ${title}
                </h3>


                ${
                    excerpt
                        ? `<p>${excerpt}</p>`
                        : ""
                }


                <button
                    type="button"
                    class="jamb-news-read-more"
                    data-id="${escapeAttribute(article.id)}"
                >
                    Read More →
                </button>

            </div>

        </article>
    `;
}


/* =========================================================
   READ MORE
========================================================= */

newsList.addEventListener("click", function (event) {

    const button =
        event.target.closest(".jamb-news-read-more");


    if (!button) {
        return;
    }


    const articleId =
        button.getAttribute("data-id");


    if (!articleId) {
        return;
    }


    window.location.href =
        `jamb-article.html?id=${encodeURIComponent(articleId)}`;

});


/* =========================================================
   LOAD MORE BUTTON
========================================================= */

loadMoreButton.addEventListener(
    "click",
    showMoreNews
);


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {
        return "";
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
   SECURITY
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}


/* =========================================================
   START
========================================================= */

loadJAMBNews();