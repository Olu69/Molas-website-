/* =========================================================
   MOLAS — ADMISSIONS PAGE
   Supabase + Admission Filters
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       SUPABASE CONFIGURATION
    ===================================================== */

    const SUPABASE_URL =
        "https://eidnzebqyxcpxbykybch.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";


    /* =====================================================
       PAGE ELEMENTS
    ===================================================== */

    const admissionsList =
        document.getElementById("admissionsList");

    const filterButtons =
        document.querySelectorAll(
            ".admission-filters button"
        );


    if (!admissionsList) {
        console.error(
            "MOLAS: #admissionsList was not found."
        );
        return;
    }


    /* =====================================================
       STATE
    ===================================================== */

    let allAdmissions = [];


    /* =====================================================
       LOADING
    ===================================================== */

    admissionsList.innerHTML = `
        <div class="news-loading">
            Loading admissions...
        </div>
    `;


    try {

        /* =================================================
           LOAD SUPABASE
        ================================================= */

        const { createClient } =
            await import(
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
            );


        const supabase =
            createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );


        console.log(
            "MOLAS Admissions: Connecting to Supabase..."
        );


        /* =================================================
           FETCH ADMISSIONS
        ================================================= */

        const {
            data,
            error
        } = await supabase
            .from("admission_alerts")
            .select("*")
            .order(
                "published_at",
                {
                    ascending: false
                }
            );


        console.log(
            "MOLAS Admissions data:",
            data
        );

        console.log(
            "MOLAS Admissions error:",
            error
        );


        /* =================================================
           ERROR
        ================================================= */

        if (error) {

            console.error(error);

            showError(
                "We couldn't load the admission updates right now."
            );

            return;
        }


        /* =================================================
           NO DATA
        ================================================= */

        if (
            !data ||
            data.length === 0
        ) {

            admissionsList.innerHTML = `
                <div class="admissions-empty">

                    <div class="admissions-empty-icon">
                        🎓
                    </div>

                    <h3>
                        No admission updates yet
                    </h3>

                    <p>
                        New admission updates will appear here.
                    </p>

                </div>
            `;

            return;
        }


        /* =================================================
           SAVE DATA
        ================================================= */

        allAdmissions = data;


        /* =================================================
           INITIAL DISPLAY
        ================================================= */

        displayAdmissions(allAdmissions);


        /* =================================================
           FILTER BUTTONS
        ================================================= */

        filterButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    /* -----------------------------
                       ACTIVE BUTTON
                    ----------------------------- */

                    filterButtons.forEach(btn => {

                        btn.classList.remove("active");

                    });

                    button.classList.add("active");


                    /* -----------------------------
                       FILTER VALUE
                    ----------------------------- */

                    const filter =
                        button.textContent
                            .trim()
                            .toLowerCase();


                    console.log(
                        "MOLAS Admission filter:",
                        filter
                    );


                    /* -----------------------------
                       ALL
                    ----------------------------- */

                    if (filter === "all") {

                        displayAdmissions(
                            allAdmissions
                        );

                        return;
                    }


                    /* -----------------------------
                       FILTER ADMISSIONS
                    ----------------------------- */

                    const filtered =
                        allAdmissions.filter(
                            admission => {

                                const type =
                                    String(
                                        admission.admission_type || ""
                                    ).toLowerCase();

                                const title =
                                    String(
                                        admission.title || ""
                                    ).toLowerCase();

                                const content =
                                    String(
                                        admission.content || ""
                                    ).toLowerCase();

                                const university =
                                    String(
                                        admission.university || ""
                                    ).toLowerCase();


                                /* =====================
                                   POST-UTME
                                ====================== */

                                if (
                                    filter === "post-utme"
                                ) {

                                    return (
                                        type.includes("post-utme") ||
                                        title.includes("post-utme") ||
                                        content.includes("post-utme")
                                    );

                                }


                                /* =====================
                                   DIRECT ENTRY
                                ====================== */

                                if (
                                    filter === "direct entry"
                                ) {

                                    return (
                                        type.includes("direct entry") ||
                                        title.includes("direct entry") ||
                                        content.includes("direct entry")
                                    );

                                }


                                /* =====================
                                   ADMISSION LISTS
                                ====================== */

                                if (
                                    filter === "admission lists"
                                ) {

                                    return (
                                        type.includes("admission list") ||
                                        title.includes("admission list") ||
                                        content.includes("admission list") ||
                                        title.includes("admission status")
                                    );

                                }


                                /* =====================
                                   SCREENING
                                ====================== */

                                if (
                                    filter === "screening"
                                ) {

                                    return (
                                        type.includes("screening") ||
                                        title.includes("screening") ||
                                        content.includes("screening")
                                    );

                                }


                                return false;

                            }
                        );


                    /* -----------------------------
                       DISPLAY RESULTS
                    ----------------------------- */

                    if (
                        filtered.length === 0
                    ) {

                        showFilteredEmpty(
                            button.textContent.trim()
                        );

                    } else {

                        displayAdmissions(
                            filtered
                        );

                    }

                }
            );

        });


    } catch (error) {

        console.error(
            "MOLAS Admissions JavaScript error:",
            error
        );

        showError(
            "Something went wrong while loading admissions."
        );

    }


    /* =====================================================
       DISPLAY ADMISSIONS
    ===================================================== */

    function displayAdmissions(admissions) {

        admissionsList.innerHTML = "";


        admissions.forEach(
            admission => {

                const card =
                    document.createElement("article");

                card.className =
                    "admission-list-card";


                /* =========================================
                   IMAGE
                ========================================== */

                let imageHTML = "";


                if (admission.image_url) {

                    imageHTML = `
                        <img
                            src="${escapeHTML(
                                admission.image_url
                            )}"
                            alt="${escapeHTML(
                                admission.title ||
                                "Admission update"
                            )}"
                            loading="lazy"
                        >
                    `;

                } else {

                    imageHTML = `
                        <div class="admission-card-placeholder">
                            🎓
                        </div>
                    `;

                }


                /* =========================================
                   CARD
                ========================================== */

                card.innerHTML = `

                    <div class="admission-list-image">
                        ${imageHTML}
                    </div>


                    <div class="admission-list-content">


                        <div class="admission-list-meta">

                            ${
                                admission.status
                                    ? `
                                        <span class="admission-status">
                                            ${escapeHTML(
                                                admission.status
                                            )}
                                        </span>
                                      `
                                    : ""
                            }


                            ${
                                admission.admission_type
                                    ? `
                                        <span class="admission-type">
                                            ${escapeHTML(
                                                admission.admission_type
                                            )}
                                        </span>
                                      `
                                    : ""
                            }

                        </div>


                        ${
                            admission.university
                                ? `
                                    <div class="admission-list-university">
                                        ${escapeHTML(
                                            admission.university
                                        )}
                                    </div>
                                  `
                                : ""
                        }


                        <h2>
                            ${escapeHTML(
                                admission.title ||
                                "Admission Update"
                            )}
                        </h2>


                        ${
                            admission.excerpt
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            admission.excerpt
                                        )}
                                    </p>
                                  `
                                : ""
                        }


                        <div class="admission-list-footer">

                            ${
                                admission.deadline
                                    ? `
                                        <span class="admission-list-deadline">
                                            Deadline:
                                            ${escapeHTML(
                                                admission.deadline
                                            )}
                                        </span>
                                      `
                                    : ""
                            }


                            <span class="admission-list-date">
                                ${formatDate(
                                    admission.published_at ||
                                    admission.created_at
                                )}
                            </span>

                        </div>


                        <a
                            href="admission.html?id=${encodeURIComponent(
                                admission.id
                            )}"
                            class="admission-list-link"
                        >
                            View Admission →
                        </a>

                    </div>

                `;


                admissionsList.appendChild(card);

            }
        );

    }


    /* =====================================================
       NO FILTER RESULTS
    ===================================================== */

    function showFilteredEmpty(filterName) {

        admissionsList.innerHTML = `

            <div class="admissions-empty">

                <div class="admissions-empty-icon">
                    🔎
                </div>

                <h3>
                    No ${escapeHTML(filterName)} updates yet
                </h3>

                <p>
                    New ${escapeHTML(
                        filterName.toLowerCase()
                    )} admission updates will appear here.
                </p>

            </div>

        `;

    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showError(message) {

        admissionsList.innerHTML = `

            <div class="admissions-error">

                <div class="admissions-error-icon">
                    ⚠️
                </div>

                <h3>
                    Admissions Temporarily Unavailable
                </h3>

                <p>
                    ${escapeHTML(message)}
                </p>

                <button
                    type="button"
                    class="primary-button"
                    onclick="location.reload()"
                >
                    Try Again
                </button>

            </div>

        `;

    }


    /* =====================================================
       DATE FORMATTER
    ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "";
        }


        const date =
            new Date(value);


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return value;

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
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


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

});