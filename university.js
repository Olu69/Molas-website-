document.addEventListener("DOMContentLoaded", async function () {

    /* =====================================================
       MOLAS — UNIVERSITY PAGE
       Accordion Information System
    ===================================================== */

    const SUPABASE_URL =
        "https://eidnzebqyxcpxbykybch.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";


    /* =====================================================
       GET UNIVERSITY ID
    ===================================================== */

    const params =
        new URLSearchParams(window.location.search);

    const universityId =
        params.get("id");


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const name =
        document.getElementById("university-name");

    const type =
        document.getElementById("university-type");

    const location =
        document.getElementById("university-location");

    const description =
        document.getElementById("university-description");

    const website =
        document.getElementById("university-website");


    /* =====================================================
       DATA
    ===================================================== */

    let updates = [];


    /* =====================================================
       CHECK UNIVERSITY ID
    ===================================================== */

    if (!universityId) {

        if (name) {
            name.textContent =
                "University not found";
        }

        return;
    }


    try {

        /* =================================================
           LOAD UNIVERSITY
        ================================================= */

        const universityResponse =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/universities" +
                "?id=eq." +
                encodeURIComponent(universityId) +
                "&select=*",
                {
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization":
                            "Bearer " + SUPABASE_KEY
                    }
                }
            );


        if (!universityResponse.ok) {

            throw new Error(
                "University request failed: " +
                universityResponse.status
            );

        }


        const universityData =
            await universityResponse.json();


        if (!universityData.length) {

            throw new Error(
                "University with ID " +
                universityId +
                " was not found."
            );

        }


        const university =
            universityData[0];


        /* =================================================
           DISPLAY UNIVERSITY
        ================================================= */

        if (name) {

            name.textContent =
                university.name ||
                "University";

        }


        if (type) {

            type.textContent =
                formatType(
                    university.type
                );

        }


        if (location) {

            location.textContent =
                university.location ||
                "Nigeria";

        }


        if (description) {

            description.textContent =
                university.description ||
                "University admission and education updates.";

        }


        document.title =
            (university.name || "University") +
            " | MOLAS Educational Consults";


        /* =================================================
           OFFICIAL WEBSITE
        ================================================= */

        if (website) {

            if (university.website_url) {

                website.href =
                    university.website_url;

                website.style.display =
                    "";

            } else {

                website.style.display =
                    "none";

            }

        }


        /* =================================================
           LOAD UNIVERSITY UPDATES
        ================================================= */

        updates =
            await loadUniversityUpdates(
                universityId
            );


        /* =================================================
           SETUP ACCORDION
        ================================================= */

        setupAccordion();


        /* =================================================
           OPEN FROM URL HASH
        ================================================= */

        openFromHash();


    } catch (error) {

        console.error(
            "MOLAS University Error:",
            error
        );


        if (name) {

            name.textContent =
                "Unable to load university.";

        }


        showError(
            error.message
        );

    }



    /* =====================================================
       LOAD UNIVERSITY UPDATES
    ===================================================== */

    async function loadUniversityUpdates(
        id
    ) {

        const response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/university_updates" +
                "?university_id=eq." +
                encodeURIComponent(id) +
                "&select=*" +
                "&order=published_at.desc",

                {
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization":
                            "Bearer " + SUPABASE_KEY
                    }
                }

            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                "University updates request failed: " +
                response.status +
                " — " +
                errorText
            );

        }


        const data =
            await response.json();


        return Array.isArray(data)
            ? data
            : [];

    }



    /* =====================================================
       ACCORDION SETUP
    ===================================================== */

    function setupAccordion() {

        const cards =
            document.querySelectorAll(
                ".university-info-card"
            );


        cards.forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        const category =
                            card.getAttribute(
                                "data-category"
                            );


                        const item =
                            card.closest(
                                ".university-info-item"
                            );


                        const content =
                            item.querySelector(
                                ".university-info-content"
                            );


                        const isOpen =
                            card.getAttribute(
                                "aria-expanded"
                            ) === "true";


                        /* =================================
                           CLOSE ALL OTHER CARDS
                        ================================= */

                        closeAllCards(
                            card
                        );


                        /* =================================
                           CLOSE CURRENT CARD
                        ================================= */

                        if (isOpen) {

                            closeCard(
                                card,
                                content,
                                item
                            );

                            return;

                        }


                        /* =================================
                           OPEN CURRENT CARD
                        ================================= */

                        openCard(
                            card,
                            content,
                            item,
                            category
                        );

                    }
                );

            }
        );

    }



    /* =====================================================
       OPEN CARD
    ===================================================== */

    function openCard(
        card,
        content,
        item,
        category
    ) {

        card.setAttribute(
            "aria-expanded",
            "true"
        );


        item.classList.add(
            "is-open"
        );


        const arrow =
            card.querySelector(
                ".university-info-arrow"
            );


        if (arrow) {

            arrow.textContent =
                "−";

        }


        /* ================================================
           SHOW CONTENT
        ================================================ */

        content.hidden = false;


        content.innerHTML =
            createInformationContent(
                category
            );


        /* ================================================
           UPDATE URL HASH
        ================================================ */

        const hash =
            categoryToHash(
                category
            );


        if (
            history.replaceState
        ) {

            history.replaceState(
                null,
                "",
                window.location.pathname +
                window.location.search +
                hash
            );

        }


        /* ================================================
           SMOOTH SCROLL
        ================================================ */

        setTimeout(
            function () {

                item.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });

            },
            80
        );

    }



    /* =====================================================
       CLOSE CARD
    ===================================================== */

    function closeCard(
        card,
        content,
        item
    ) {

        card.setAttribute(
            "aria-expanded",
            "false"
        );


        item.classList.remove(
            "is-open"
        );


        const arrow =
            card.querySelector(
                ".university-info-arrow"
            );


        if (arrow) {

            arrow.textContent =
                "+";

        }


        content.hidden =
            true;


        content.innerHTML =
            "";

    }



    /* =====================================================
       CLOSE ALL OTHER CARDS
    ===================================================== */

    function closeAllCards(
        currentCard
    ) {

        const cards =
            document.querySelectorAll(
                ".university-info-card"
            );


        cards.forEach(
            function (card) {

                if (
                    card === currentCard
                ) {
                    return;
                }


                const item =
                    card.closest(
                        ".university-info-item"
                    );


                const content =
                    item.querySelector(
                        ".university-info-content"
                    );


                closeCard(
                    card,
                    content,
                    item
                );

            }
        );

    }



    /* =====================================================
       CREATE INFORMATION CONTENT
    ===================================================== */

    function createInformationContent(
        category
    ) {

        let matchingUpdates;


        /* ================================================
           LATEST UPDATES
        ================================================ */

        if (
            normalize(category) ===
            "all"
        ) {

            matchingUpdates =
                updates;

        }

        /* ================================================
           CATEGORY
        ================================================ */

        else {

            matchingUpdates =
                updates.filter(
                    function (item) {

                        return (
                            normalize(
                                item.category
                            ) ===
                            normalize(
                                category
                            )
                        );

                    }
                );

        }


        /* ================================================
           NO INFORMATION
        ================================================ */

        if (
            !matchingUpdates.length
        ) {

            return `

                <div class="university-empty-information">

                    <strong>
                        No information available yet.
                    </strong>

                    <p>
                        MOLAS will display the latest
                        ${escapeHTML(
                            category === "all"
                                ? "university updates"
                                : category + " information"
                        )}
                        here when available.
                    </p>

                </div>

            `;

        }


        /* ================================================
           RENDER ALL MATCHING WRITE-UPS
        ================================================ */

        return `

            <div class="university-information-results">

                ${matchingUpdates
                    .map(
                        createInformationArticle
                    )
                    .join("")}

            </div>

        `;

    }



    /* =====================================================
       INFORMATION ARTICLE
    ===================================================== */

    function createInformationArticle(
        item
    ) {

        const title =
            item.title ||
            "University Update";


        const category =
            item.category ||
            "University Update";


        const date =
            formatDate(
                item.published_at ||
                item.created_at
            );


        /*
         * Keep the COMPLETE write-up.
         * Do not display source_url.
         */

        const content =
            cleanArticleContent(
                item.content || ""
            );


        return `

            <article
                class="university-information-article"
            >

                ${
                    item.image_url
                    ? `

                        <div
                            class="university-information-image"
                        >

                            <img
                                src="${escapeAttribute(
                                    item.image_url
                                )}"
                                alt="${escapeAttribute(
                                    title
                                )}"
                                loading="lazy"
                            >

                        </div>

                    `
                    : ""
                }


                <div
                    class="university-information-meta"
                >

                    <span>
                        ${escapeHTML(
                            category
                        )}
                    </span>

                    <time>
                        ${escapeHTML(
                            date
                        )}
                    </time>

                </div>


                <h3>
                    ${escapeHTML(
                        title
                    )}
                </h3>


                <div
                    class="university-information-body"
                >
                    ${formatArticleText(
                        content
                    )}
                </div>

            </article>

        `;

    }



    /* =====================================================
       CLEAN ARTICLE CONTENT
    ===================================================== */

    function cleanArticleContent(
        value
    ) {

        if (!value) {
            return "";
        }


        const div =
            document.createElement(
                "div"
            );


        div.innerHTML =
            String(value);


        return (
            div.textContent ||
            div.innerText ||
            ""
        ).trim();

    }



    /* =====================================================
       FORMAT ARTICLE TEXT
       Keeps paragraphs / line breaks readable.
    ===================================================== */

    function formatArticleText(
        value
    ) {

        if (!value) {

            return `
                <p>
                    No detailed information available.
                </p>
            `;

        }


        const paragraphs =
            String(value)
                .split(
                    /\n\s*\n|\r\n\r\n/
                )
                .map(
                    function (paragraph) {

                        return paragraph
                            .trim();

                    }
                )
                .filter(
                    Boolean
                );


        /*
         * If Supabase contains normal line breaks
         * rather than blank-line paragraphs,
         * preserve those too.
         */

        if (
            paragraphs.length === 1
        ) {

            return `

                <p>
                    ${escapeHTML(
                        paragraphs[0]
                    ).replace(
                        /\n/g,
                        "<br>"
                    )}
                </p>

            `;

        }


        return paragraphs
            .map(
                function (paragraph) {

                    return `

                        <p>
                            ${escapeHTML(
                                paragraph
                            ).replace(
                                /\n/g,
                                "<br>"
                            )}
                        </p>

                    `;

                }
            )
            .join("");

    }



    /* =====================================================
       OPEN CARD FROM URL HASH
    ===================================================== */

    function openFromHash() {

        const hash =
            window.location.hash;


        if (!hash) {
            return;
        }


        let category = null;


        switch (hash) {

            case "#updates":

                category = "all";
                break;


            case "#post-utme":

                category = "Post-UTME";
                break;


            case "#direct-entry":

                category = "Direct Entry";
                break;


            case "#admission-list":

                category = "Admission List";
                break;


            case "#cutoff":

                category = "Cut-off Mark";
                break;

        }


        if (!category) {
            return;
        }


        const card =
            document.querySelector(
                `.university-info-card[data-category="${cssEscape(category)}"]`
            );


        if (!card) {
            return;
        }


        const item =
            card.closest(
                ".university-info-item"
            );


        const content =
            item.querySelector(
                ".university-info-content"
            );


        openCard(
            card,
            content,
            item,
            category
        );

    }



    /* =====================================================
       CATEGORY → HASH
    ===================================================== */

    function categoryToHash(
        category
    ) {

        switch (
            normalize(category)
        ) {

            case "all":
                return "#updates";


            case "post utme":
                return "#post-utme";


            case "direct entry":
                return "#direct-entry";


            case "admission list":
                return "#admission-list";


            case "cut off mark":
                return "#cutoff";


            default:
                return "";

        }

    }



    /* =====================================================
       CATEGORY NORMALIZER
    ===================================================== */

    function normalize(
        value
    ) {

        return String(
            value || ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /[-_]+/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            );

    }



    /* =====================================================
       UNIVERSITY TYPE
    ===================================================== */

    function formatType(
        value
    ) {

        if (!value) {

            return "UNIVERSITY";

        }


        const text =
            String(value)
                .toLowerCase();


        if (
            text.includes("federal")
        ) {

            return "FEDERAL UNIVERSITY";

        }


        if (
            text.includes("state")
        ) {

            return "STATE UNIVERSITY";

        }


        if (
            text.includes("private")
        ) {

            return "PRIVATE UNIVERSITY";

        }


        return String(
            value
        ).toUpperCase();

    }



    /* =====================================================
       DATE
    ===================================================== */

    function formatDate(
        value
    ) {

        if (!value) {
            return "";
        }


        const date =
            new Date(value);


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



    /* =====================================================
       ERROR DISPLAY
    ===================================================== */

    function showError(
        message
    ) {

        const contents =
            document.querySelectorAll(
                ".university-info-content"
            );


        contents.forEach(
            function (content) {

                content.innerHTML = `

                    <div class="university-empty-information">

                        <strong>
                            Unable to load information.
                        </strong>

                        <p>
                            ${escapeHTML(
                                message
                            )}
                        </p>

                    </div>

                `;

            }
        );

    }



    /* =====================================================
       CSS ESCAPE
    ===================================================== */

    function cssEscape(
        value
    ) {

        if (
            window.CSS &&
            typeof window.CSS.escape === "function"
        ) {

            return window.CSS.escape(
                value
            );

        }


        return String(value)
            .replace(
                /"/g,
                '\\"'
            );

    }



    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
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



    /* =====================================================
       ATTRIBUTE ESCAPE
    ===================================================== */

    function escapeAttribute(
        value
    ) {

        return String(
            value ?? ""
        )
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

});