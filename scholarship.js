/* =========================================================
   MOLAS — SCHOLARSHIP DETAILS
   SUPABASE-POWERED SCHOLARSHIP PAGE
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

const loading =
    document.getElementById(
        "scholarship-detail-loading"
    );

const errorState =
    document.getElementById(
        "scholarship-detail-error"
    );

const detailSection =
    document.getElementById(
        "scholarship-detail"
    );

const detailImage =
    document.getElementById(
        "detail-image"
    );

const detailStatus =
    document.getElementById(
        "detail-status"
    );

const detailTitle =
    document.getElementById(
        "detail-title"
    );

const detailProvider =
    document.getElementById(
        "detail-provider"
    );

const detailDescription =
    document.getElementById(
        "detail-description"
    );

const detailLevel =
    document.getElementById(
        "detail-level"
    );

const detailLocation =
    document.getElementById(
        "detail-location"
    );

const detailDeadline =
    document.getElementById(
        "detail-deadline"
    );

const detailEligibility =
    document.getElementById(
        "detail-eligibility"
    );

const detailRequirements =
    document.getElementById(
        "detail-requirements"
    );

const detailBenefits =
    document.getElementById(
        "detail-benefits"
    );

const applicationLink =
    document.getElementById(
        "detail-application-link"
    );


/* =========================================================
   GET SCHOLARSHIP ID
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const scholarshipId =
    params.get("id");


/* =========================================================
   HELPERS
========================================================= */

function normalize(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(
            /[_\s]+/g,
            "-"
        );

}


function formatLabel(value) {

    if (!value) {
        return "—";
    }

    return String(value)
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


function formatDeadline(deadline) {

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
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   STATUS
========================================================= */

function getStatus(scholarship) {

    const databaseStatus =
        normalize(
            scholarship.status
        );


    if (
        databaseStatus === "closed"
    ) {

        return {
            key: "closed",
            label: "Closed"
        };

    }


    if (
        databaseStatus === "closing-soon"
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


        if (days < 0) {

            return {
                key: "closed",
                label: "Closed"
            };

        }


        if (days <= 14) {

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
   SHOW / HIDE
========================================================= */

function showLoading() {

    if (loading) {
        loading.hidden = false;
    }

}


function hideLoading() {

    if (loading) {
        loading.hidden = true;
    }

}


function showError() {

    hideLoading();

    if (detailSection) {
        detailSection.hidden = true;
    }

    if (errorState) {
        errorState.hidden = false;
    }

}


function showDetails() {

    hideLoading();

    if (errorState) {
        errorState.hidden = true;
    }

    if (detailSection) {
        detailSection.hidden = false;
    }

}


/* =========================================================
   LOAD SCHOLARSHIP
========================================================= */

async function loadScholarship() {

    showLoading();


    if (!scholarshipId) {

        console.error(
            "No scholarship ID found in URL."
        );

        showError();

        return;

    }


    try {

        const url =
            `${SUPABASE_URL}/rest/v1/scholarships` +
            `?select=*` +
            `&id=eq.${encodeURIComponent(
                scholarshipId
            )}`;


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
                    }
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Supabase error ${response.status}: ${errorText}`
            );

        }


        const data =
            await response.json();


        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            console.error(
                "Scholarship not found:",
                scholarshipId
            );

            showError();

            return;

        }


        const scholarship =
            data[0];


        renderScholarship(
            scholarship
        );


    } catch (error) {

        console.error(
            "SCHOLARSHIP DETAILS ERROR:",
            error
        );

        showError();

    }

}


/* =========================================================
   RENDER SCHOLARSHIP
========================================================= */

function renderScholarship(
    scholarship
) {

    /* IMAGE */

    if (
        detailImage
    ) {

        if (
            scholarship.image_url
        ) {

            detailImage.src =
                scholarship.image_url;

            detailImage.alt =
                scholarship.title ||
                "Scholarship opportunity";

            detailImage.style.display =
                "block";

        } else {

            detailImage.removeAttribute(
                "src"
            );

            detailImage.style.display =
                "none";

        }

    }


    /* STATUS */

    const status =
        getStatus(
            scholarship
        );


    if (
        detailStatus
    ) {

        detailStatus.textContent =
            status.label;

        detailStatus.className =
            `scholarship-detail-status scholarship-detail-status-${status.key}`;

    }


    /* TITLE */

    if (
        detailTitle
    ) {

        detailTitle.textContent =
            scholarship.title ||
            "Scholarship Opportunity";

    }


    /* PROVIDER */

    if (
        detailProvider
    ) {

        detailProvider.textContent =
            scholarship.provider ||
            "MOLAS Scholarship Hub";

    }


    /* DESCRIPTION */

    if (
        detailDescription
    ) {

        detailDescription.textContent =
            scholarship.description ||
            "Scholarship opportunity available for eligible students.";

    }


    /* LEVEL */

    if (
        detailLevel
    ) {

        detailLevel.textContent =
            formatLabel(
                scholarship.level
            );

    }


    /* LOCATION */

    if (
        detailLocation
    ) {

        detailLocation.textContent =
            scholarship.location ||
            "Nigeria";

    }


    /* DEADLINE */

    if (
        detailDeadline
    ) {

        detailDeadline.textContent =
            formatDeadline(
                scholarship.deadline
            );

    }


    /* ELIGIBILITY */

    if (
        detailEligibility
    ) {

        detailEligibility.innerHTML =
            scholarship.eligibility ||
            "Eligibility information is not available.";

    }


    /* REQUIREMENTS */

    if (
        detailRequirements
    ) {

        detailRequirements.innerHTML =
            scholarship.requirements ||
            "Requirement information is not available.";

    }


    /* BENEFITS */

    if (
        detailBenefits
    ) {

        detailBenefits.innerHTML =
            scholarship.benefits ||
            "Benefit information is not available.";

    }


    /* APPLICATION */

    if (
        applicationLink
    ) {

        if (
            scholarship.application_url
        ) {

            applicationLink.href =
                scholarship.application_url;

            applicationLink.style.display =
                "inline-flex";

        } else {

            applicationLink.removeAttribute(
                "href"
            );

            applicationLink.style.display =
                "none";

        }

    }


    /* PAGE TITLE */

    if (
        scholarship.title
    ) {

        document.title =
            `${scholarship.title} — MOLAS Scholarships`;

    }


    showDetails();

}


/* =========================================================
   START
========================================================= */

loadScholarship();