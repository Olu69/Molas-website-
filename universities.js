/* =========================================================
   MOLAS — UNIVERSITY HUB
   Supabase Universities
   3 cards initially + Slow Load More
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const SUPABASE_URL =
        "https://eidnzebqyxcpxbykybch.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";


    const universityGrid =
        document.querySelector(".university-grid");

    const filterButtons =
        document.querySelectorAll(
            ".university-filters button"
        );


    if (!universityGrid) return;


    const UNIVERSITIES_PER_LOAD = 3;


    let universities = [];

    let currentUniversities = [];

    let displayedCount =
        UNIVERSITIES_PER_LOAD;


    /* =====================================================
       LOAD UNIVERSITIES
    ===================================================== */

    async function loadUniversities() {

        universityGrid.innerHTML = `
            <div class="news-loading">
                Loading universities...
            </div>
        `;


        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/universities?select=id,name,short_name,type,logo_url&order=id.asc`,
                    {
                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Authorization":
                                `Bearer ${SUPABASE_KEY}`
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Supabase Error ${response.status}`
                );

            }


            universities =
                await response.json();


            currentUniversities =
                universities;


            displayedCount =
                UNIVERSITIES_PER_LOAD;


            renderUniversities(true);


        } catch (error) {

            console.error(
                "University Hub Error:",
                error
            );


            universityGrid.innerHTML = `
                <div class="news-loading">
                    Unable to load universities.
                </div>
            `;

        }

    }


    /* =====================================================
       RENDER UNIVERSITIES
    ===================================================== */

    function renderUniversities(
        firstLoad = false
    ) {

        if (
            !currentUniversities.length
        ) {

            universityGrid.innerHTML = `
                <div class="news-loading">
                    No universities found.
                </div>
            `;


            removeLoadMore();

            return;

        }


        const visibleUniversities =
            currentUniversities.slice(
                0,
                displayedCount
            );


        /* ================================================
           REMEMBER HOW MANY WERE SHOWING BEFORE
        ================================================ */

        const oldCount =
            universityGrid.querySelectorAll(
                ".university-card"
            ).length;


        /* ================================================
           RENDER ALL CURRENTLY VISIBLE UNIVERSITIES
        ================================================ */

        universityGrid.innerHTML =
            visibleUniversities
                .map(
                    (university, index) => {

                        return createUniversityCard(
                            university,
                            index >= oldCount
                        );

                    }
                )
                .join("");


        /* ================================================
           ANIMATE ONLY NEW CARDS
        ================================================ */

        const cards =
            universityGrid.querySelectorAll(
                ".university-card.new-university-card"
            );


        cards.forEach(
            (card, index) => {

                card.style.opacity =
                    "0";

                card.style.transform =
                    "translateY(35px) scale(.97)";

                card.style.transition =
                    "opacity .75s cubic-bezier(.16,1,.3,1), " +
                    "transform .75s cubic-bezier(.16,1,.3,1)";


                setTimeout(
                    () => {

                        card.style.opacity =
                            "1";

                        card.style.transform =
                            "translateY(0) scale(1)";

                    },
                    150 + (index * 300)
                );

            }
        );


        updateLoadMore();

    }


    /* =====================================================
       UNIVERSITY CARD
    ===================================================== */

    function createUniversityCard(
        university,
        isNew = false
    ) {

        const id =
            university.id;


        const name =
            university.name ||
            "University";


        const type =
            formatType(
                university.type
            );


        const logo =
            university.logo_url ||
            "";


        return `
            <article
                class="university-card ${
                    isNew
                        ? "new-university-card"
                        : ""
                }"
                data-type="${escapeAttribute(
                    university.type || ""
                )}"
            >

                <div class="university-stripe"></div>


                <div class="university-card-body">

                    ${
                        logo
                            ? `
                                <div class="university-logo">

                                    <img
                                        src="${escapeAttribute(
                                            logo
                                        )}"
                                        alt="${escapeAttribute(
                                            name
                                        )}"
                                        loading="lazy"
                                    >

                                </div>
                            `
                            : ""
                    }


                    <span class="university-type">
                        ${escapeHTML(type)}
                    </span>


                    <h3>
                        ${escapeHTML(name)}
                    </h3>


                    <div class="university-tags">

                        <span>
                            Admission
                        </span>

                        <span>
                            Post-UTME
                        </span>

                    </div>


                    <a
                        href="university.html?id=${encodeURIComponent(
                            id
                        )}"
                    >
                        View Updates →
                    </a>

                </div>

            </article>
        `;

    }


    /* =====================================================
       LOAD MORE
    ===================================================== */

    function updateLoadMore() {

        let button =
            document.querySelector(
                ".load-more-universities"
            );


        /* ================================================
           ALL UNIVERSITIES ALREADY SHOWING
        ================================================ */

        if (
            displayedCount >=
            currentUniversities.length
        ) {

            removeLoadMore();

            return;

        }


        /* ================================================
           CREATE BUTTON
        ================================================ */

        if (!button) {

            button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "load-more-universities";


            button.textContent =
                "Load More Universities →";


            button.addEventListener(
                "click",
                () => {

                    if (
                        button.classList.contains(
                            "loading"
                        )
                    ) {

                        return;

                    }


                    button.classList.add(
                        "loading"
                    );


                    button.textContent =
                        "Loading Universities...";


                    /* =================================
                       SLOW BUTTON RESPONSE
                    ================================= */

                    setTimeout(
                        () => {

                            displayedCount +=
                                UNIVERSITIES_PER_LOAD;


                            renderUniversities();


                            /* =================================
                               RESTORE BUTTON
                            ================================= */

                            const newButton =
                                document.querySelector(
                                    ".load-more-universities"
                                );


                            if (newButton) {

                                newButton.classList.remove(
                                    "loading"
                                );

                                newButton.textContent =
                                    "Load More Universities →";

                            }

                        },
                        500
                    );

                }
            );


            universityGrid.insertAdjacentElement(
                "afterend",
                button
            );

        }

    }


    /* =====================================================
       REMOVE LOAD MORE
    ===================================================== */

    function removeLoadMore() {

        const button =
            document.querySelector(
                ".load-more-universities"
            );


        if (button) {

            button.remove();

        }

    }


    /* =====================================================
       FILTERS
    ===================================================== */

    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    filterButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const filter =
                        button.textContent
                            .trim()
                            .toLowerCase();


                    if (
                        filter === "all"
                    ) {

                        currentUniversities =
                            universities;

                    } else {

                        currentUniversities =
                            universities.filter(
                                university =>

                                    String(
                                        university.type ||
                                        ""
                                    )
                                    .toLowerCase()
                                    .includes(
                                        filter
                                    )
                            );

                    }


                    displayedCount =
                        UNIVERSITIES_PER_LOAD;


                    universityGrid.innerHTML =
                        "";


                    renderUniversities(true);

                }
            );

        }
    );


    /* =====================================================
       HELPERS
    ===================================================== */

    function formatType(type) {

        const value =
            String(type || "")
                .toLowerCase();


        if (
            value.includes("federal")
        ) {

            return "FEDERAL UNIVERSITY";

        }


        if (
            value.includes("state")
        ) {

            return "STATE UNIVERSITY";

        }


        if (
            value.includes("private")
        ) {

            return "PRIVATE UNIVERSITY";

        }


        return "UNIVERSITY";

    }


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


    /* =====================================================
       START
    ===================================================== */

    loadUniversities();

});