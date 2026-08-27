/* =========================================================
   MOLAS — JAMB NEWS ARTICLE
   Single Article + Full Animation System
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://eidnzebqyxcpxbykybch.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";


/* =========================================================
   PAGE READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadJambArticle();

});


/* =========================================================
   LOAD ARTICLE
========================================================= */

async function loadJambArticle() {

    const container =
        document.getElementById("jamb-article");


    if (!container) {

        console.error(
            "JAMB article container not found."
        );

        return;
    }


    /* Get ID from URL */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const articleId =
        params.get("id");


    if (!articleId) {

        showArticleError(
            container,
            "This JAMB news article could not be found."
        );

        return;
    }


    /* Loading */

    container.innerHTML = `
        <div class="jamb-news-loading">
            Loading JAMB news...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/jamb_news?id=eq.${encodeURIComponent(articleId)}&select=*`,
                {
                    method: "GET",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "SUPABASE ERROR:",
                errorText
            );

            throw new Error(
                "Unable to load article."
            );
        }


        const articles =
            await response.json();


        if (
            !Array.isArray(articles) ||
            articles.length === 0
        ) {

            showArticleError(
                container,
                "This JAMB news article is no longer available."
            );

            return;
        }


        const article =
            articles[0];


        displayJambArticle(
            container,
            article
        );

    }

    catch (error) {

        console.error(
            "JAMB ARTICLE ERROR:",
            error
        );


        showArticleError(
            container,
            "Unable to load this JAMB news right now."
        );

    }

}


/* =========================================================
   DISPLAY ARTICLE
========================================================= */

function displayJambArticle(
    container,
    article
) {


    /* TITLE */

    const title =
        escapeHTML(
            article.title ||
            "JAMB News"
        );


    /* EXCERPT */

    const excerpt =
        escapeHTML(
            article.excerpt ||
            ""
        );


    /* CONTENT */

    const content =
        formatArticleContent(
            article.content ||
            ""
        );


    /* SOURCE */

    const source =
        escapeHTML(
            article.source ||
            "MOLAS"
        );


    /* DATE */

    const date =
        formatJambDate(
            article.published_at ||
            article.created_at
        );


    /* =====================================================
       BREAKING
    ===================================================== */

    let breakingHTML = "";


    if (
        article.breaking === true ||
        article.breaking === "true"
    ) {

        breakingHTML = `
            <span class="article-breaking">
                BREAKING
            </span>
        `;

    }


    /* =====================================================
       IMAGE
    ===================================================== */

    let imageHTML = "";


    if (article.image_url) {

        imageHTML = `

            <div class="article-image-wrapper">

                <img
                    src="${escapeAttribute(
                        article.image_url
                    )}"
                    alt="${title}"
                >

            </div>

        `;

    }


    /* =====================================================
       SOURCE
       DIRECTLY UNDER ARTICLE
    ===================================================== */

    let sourceHTML = `
        <strong>Source:</strong>
        ${source}
    `;


    if (article.source_url) {

        sourceHTML = `

            <strong>Source:</strong>

            <a
                href="${escapeAttribute(
                    article.source_url
                )}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ${source}
            </a>

        `;

    }


    /* =====================================================
       ARTICLE HTML
    ===================================================== */

    container.innerHTML = `

        <article class="jamb-article-page">


            <!-- CATEGORY -->

            <div class="article-category-row">

                <span class="article-category">
                    JAMB
                </span>

                ${breakingHTML}

            </div>


            <!-- TITLE -->

            <h1 class="article-title">
                ${title}
            </h1>


            <!-- EXCERPT -->

            ${
                excerpt
                    ? `
                        <p class="article-excerpt">
                            ${excerpt}
                        </p>
                    `
                    : ""
            }


            <!-- META -->

            <div class="article-meta">

                <strong>
                    MOLAS Educational Consults
                </strong>

                <span class="article-meta-divider"></span>

                <span>
                    ${date}
                </span>

            </div>


            <!-- IMAGE -->

            ${imageHTML}


            <!-- ARTICLE CONTAINER -->

            <div class="article-content-card">


                <!-- STORY -->

                <div class="article-content">

                    ${content}

                </div>


                <!-- SOURCE DIRECTLY BELOW STORY -->

                <div class="article-source">

                    ${sourceHTML}

                </div>


            </div>


        </article>

    `;


    /* =====================================================
       START ANIMATIONS
    ===================================================== */

    requestAnimationFrame(() => {

        initializeArticleAnimations();

    });

}


/* =========================================================
   ARTICLE ANIMATIONS
========================================================= */

function initializeArticleAnimations() {

    const article =
        document.querySelector(
            ".jamb-article-page"
        );


    if (!article) {
        return;
    }


    /* -----------------------------------------------------
       MAIN PAGE ELEMENTS
    ----------------------------------------------------- */

    const mainElements = [

        ".article-category-row",

        ".article-title",

        ".article-excerpt",

        ".article-meta",

        ".article-image-wrapper",

        ".article-content-card"

    ];


    mainElements.forEach(
        (selector, index) => {

            const element =
                article.querySelector(
                    selector
                );


            if (!element) {
                return;
            }


            element.classList.add(
                "molas-reveal"
            );


            element.style.setProperty(
                "--animation-delay",
                `${index * 100}ms`
            );

        }
    );


    /* -----------------------------------------------------
       ARTICLE TEXT
    ----------------------------------------------------- */

    const contentElements =
        article.querySelectorAll(

            ".article-content p, " +

            ".article-content h2, " +

            ".article-content h3, " +

            ".article-content blockquote, " +

            ".article-content ul, " +

            ".article-content ol, " +

            ".article-content li"

        );


    contentElements.forEach(
        (element, index) => {

            element.classList.add(
                "molas-scroll-reveal"
            );


            element.style.setProperty(
                "--animation-delay",
                `${Math.min(
                    index * 40,
                    300
                )}ms`
            );

        }
    );


    /* -----------------------------------------------------
       SOURCE
    ----------------------------------------------------- */

    const source =
        article.querySelector(
            ".article-source"
        );


    if (source) {

        source.classList.add(
            "molas-source-reveal"
        );

    }


    /* -----------------------------------------------------
       SCROLL OBSERVER
    ----------------------------------------------------- */

    setupArticleScrollAnimations();

}


/* =========================================================
   SCROLL ANIMATION OBSERVER
========================================================= */

function setupArticleScrollAnimations() {

    const elements =
        document.querySelectorAll(

            ".molas-scroll-reveal, " +

            ".molas-source-reveal"

        );


    if (!elements.length) {
        return;
    }


    /* Browser doesn't support observer */

    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            element => {

                element.classList.add(
                    "molas-visible"
                );

            }
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        entry.target.classList.add(
                            "molas-visible"
                        );


                        observer.unobserve(
                            entry.target
                        );

                    }
                );

            },
            {

                threshold: 0.12,

                rootMargin:
                    "0px 0px -50px 0px"

            }
        );


    elements.forEach(
        element => {

            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   FORMAT ARTICLE CONTENT
========================================================= */

function formatArticleContent(
    content
) {

    if (!content) {

        return `
            <p>
                No article content is available.
            </p>
        `;

    }


    /* Existing HTML */

    if (

        content.includes("<p>") ||

        content.includes("<div>") ||

        content.includes("<h2>") ||

        content.includes("<h3>") ||

        content.includes("<br")

    ) {

        return content;

    }


    /* Plain text */

    return content

        .split(/\n\s*\n/)

        .map(
            paragraph => {

                const clean =
                    escapeHTML(
                        paragraph.trim()
                    );


                if (!clean) {
                    return "";
                }


                return `
                    <p>
                        ${clean.replace(
                            /\n/g,
                            "<br>"
                        )}
                    </p>
                `;

            }
        )

        .join("");

}


/* =========================================================
   DATE
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

            month: "long",

            year: "numeric"

        }
    );

}


/* =========================================================
   ERROR
========================================================= */

function showArticleError(
    container,
    message
) {

    container.innerHTML = `

        <div class="jamb-news-loading">

            <div class="error-icon">
                !
            </div>

            <h2>
                JAMB News Unavailable
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

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

function escapeAttribute(
    value
) {

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