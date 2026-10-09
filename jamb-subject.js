/* =========================================================
   MOLAS — JAMB SUBJECT SYLLABUS
   Device-Based Paid Access
========================================================= */


/* =========================================================
   SUBJECT INFORMATION
========================================================= */

const SUBJECT_INFO = {

    mathematics: {
        name: "Mathematics",
        description:
            "Explore the JAMB UTME Mathematics syllabus, including all topics, contents and learning objectives."
    },

    english: {
        name: "Use of English",
        description:
            "Explore the JAMB UTME Use of English syllabus, including all topics, contents and learning objectives."
    },

    biology: {
        name: "Biology",
        description:
            "Explore the JAMB UTME Biology syllabus, including all topics, contents and learning objectives."
    },

    chemistry: {
        name: "Chemistry",
        description:
            "Explore the JAMB UTME Chemistry syllabus, including all topics, contents and learning objectives."
    },

    physics: {
        name: "Physics",
        description:
            "Explore the JAMB UTME Physics syllabus, including all topics, contents and learning objectives."
    },

    government: {
        name: "Government",
        description:
            "Explore the JAMB UTME Government syllabus, including all topics, contents and learning objectives."
    },

    economics: {
        name: "Economics",
        description:
            "Explore the JAMB UTME Economics syllabus, including all topics, contents and learning objectives."
    },

    geography: {
        name: "Geography",
        description:
            "Explore the JAMB UTME Geography syllabus, including all topics, contents and learning objectives."
    },

    literature: {
        name: "Literature in English",
        description:
            "Explore the JAMB UTME Literature in English syllabus, including all topics, contents and learning objectives."
    },

    commerce: {
        name: "Commerce",
        description:
            "Explore the JAMB UTME Commerce syllabus, including all topics, contents and learning objectives."
    }

};


/* =========================================================
   SUBJECTS CURRENTLY AVAILABLE IN DATABASE
========================================================= */

const AVAILABLE_SYLLABUS_SUBJECTS = [

    "Mathematics",

    "Use of English",

    "Biology",

    "Chemistry",

    "Physics"

];


/* =========================================================
   DEVICE STORAGE
========================================================= */

const JAMB_DEVICE_TOKEN_KEY =
    "molas_jamb_device_token";


/* =========================================================
   GET SUBJECT FROM URL
========================================================= */

function getSubjectFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("subject") ||
        "mathematics"
    )
        .toLowerCase()
        .trim();

}


/* =========================================================
   UPDATE PAGE INFORMATION
========================================================= */

function updateSubjectInformation(subjectKey) {

    const info =
        SUBJECT_INFO[subjectKey];


    if (!info) {
        return;
    }


    const title =
        document.getElementById(
            "subject-title"
        );


    const description =
        document.getElementById(
            "subject-description"
        );


    const name =
        document.getElementById(
            "subject-name"
        );


    const code =
        document.getElementById(
            "subject-code"
        );


    if (title) {

        title.textContent =
            info.name;

    }


    if (description) {

        description.textContent =
            info.description;

    }


    if (name) {

        name.textContent =
            info.name;

    }


    if (code) {

        code.textContent =
            "JAMB UTME SYLLABUS";

    }


    document.title =
        `${info.name} Syllabus — MOLAS Educational Consults`;

}


/* =========================================================
   DEVICE TOKEN
========================================================= */

function getDeviceToken() {

    let token =
        localStorage.getItem(
            JAMB_DEVICE_TOKEN_KEY
        );


    if (!token) {

        const randomValues =
            new Uint8Array(32);


        crypto.getRandomValues(
            randomValues
        );


        token =
            Array.from(
                randomValues
            )
                .map(
                    byte =>
                        byte
                            .toString(16)
                            .padStart(2, "0")
                )
                .join("");


        localStorage.setItem(
            JAMB_DEVICE_TOKEN_KEY,
            token
        );

    }


    return token;

}


/* =========================================================
   HASH DEVICE TOKEN
========================================================= */

async function hashDeviceToken(token) {

    const encoder =
        new TextEncoder();


    const data =
        encoder.encode(token);


    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );


    const hashArray =
        Array.from(
            new Uint8Array(
                hashBuffer
            )
        );


    return hashArray
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");

}


/* =========================================================
   DEVICE NAME
========================================================= */

function getDeviceName() {

    const userAgent =
        navigator.userAgent;


    if (/iPhone/i.test(userAgent)) {
        return "iPhone";
    }


    if (/iPad/i.test(userAgent)) {
        return "iPad";
    }


    if (/Android/i.test(userAgent)) {
        return "Android device";
    }


    if (/Windows/i.test(userAgent)) {
        return "Windows device";
    }


    if (/Macintosh/i.test(userAgent)) {
        return "Mac device";
    }


    return "Web device";

}


/* =========================================================
   REGISTER CURRENT DEVICE
========================================================= */

async function registerCurrentDevice() {

    const deviceToken =
        getDeviceToken();


    const deviceTokenHash =
        await hashDeviceToken(
            deviceToken
        );


    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "register_jamb_device",
            {
                p_device_token_hash:
                    deviceTokenHash,

                p_device_name:
                    getDeviceName()
            }
        );


    if (error) {

        throw new Error(
            error.message ||
            "Unable to register this device."
        );

    }


    if (!data) {

        throw new Error(
            "The device could not be registered."
        );

    }


    return data;

}


/* =========================================================
   GET CURRENT USER
========================================================= */

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        throw new Error(
            error.message ||
            "Unable to verify your account."
        );

    }


    if (!data.user) {

        throw new Error(
            "No authenticated user found."
        );

    }


    return data.user;

}


/* =========================================================
   LOAD SYLLABUS
========================================================= */

async function loadSyllabus(subjectKey) {

    const container =
        document.getElementById(
            "syllabus-content"
        );


    if (!container) {
        return;
    }


    showLoading();


    const subjectName =
        SUBJECT_INFO[subjectKey]?.name ||
        subjectKey;


    /* =====================================================
       CHECK SUBJECT AVAILABILITY
    ===================================================== */

    if (
        !AVAILABLE_SYLLABUS_SUBJECTS.includes(
            subjectName
        )
    ) {

        showEmptyState(
            subjectName
        );

        return;

    }


    try {

        /* =================================================
           CHECK LOGIN
        ================================================= */

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth.getSession();


        if (sessionError) {

            throw new Error(
                sessionError.message
            );

        }


        if (!sessionData.session) {

            window.location.replace(
                "account.html?resource=jamb"
            );

            return;

        }


        /* =================================================
           GET USER
        ================================================= */

        await getCurrentUser();


        /* =================================================
           REGISTER / IDENTIFY DEVICE
        ================================================= */

        const deviceAccessId =
            await registerCurrentDevice();


        /* =================================================
           GET SUBJECT SYLLABUS FROM SECURE RPC
        ================================================= */

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "get_jamb_syllabus",
                {
                    p_subject:
                        subjectName,

                    p_device_access_id:
                        deviceAccessId
                }
            );


        /* =================================================
           NO PURCHASE
        ================================================= */

        if (error) {

            const message =
                String(
                    error.message || ""
                )
                    .toLowerCase();


            if (
                message.includes(
                    "has not been purchased"
                )
            ) {

                showPremiumMessage(
                    subjectName
                );

                return;

            }


            if (
                message.includes(
                    "invalid device access"
                )
            ) {

                showError(
                    "This device could not be verified. Please try again."
                );

                return;

            }


            throw new Error(
                error.message ||
                "Unable to load the syllabus."
            );

        }


        /* =================================================
           NO SYLLABUS DATA
        ================================================= */

        if (
            !data ||
            data.length === 0
        ) {

            showEmptyState(
                subjectName
            );

            return;

        }


        /* =================================================
           SORT TOPICS
        ================================================= */

        data.sort(
            (a, b) => {

                const sectionCompare =
                    String(
                        a.section_number
                    ).localeCompare(
                        String(
                            b.section_number
                        ),
                        undefined,
                        {
                            numeric: true
                        }
                    );


                if (
                    sectionCompare !== 0
                ) {

                    return sectionCompare;

                }


                return (
                    Number(
                        a.topic_number
                    ) -
                    Number(
                        b.topic_number
                    )
                );

            }
        );


        /* =================================================
           FULL ACCESS
        ================================================= */

        renderSyllabus(
            data,
            true
        );

    }

    catch (error) {

        console.error(
            "JAMB syllabus error:",
            error
        );


        showError(
            error.message ||
            "Something went wrong while loading the syllabus."
        );

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    const container =
        document.getElementById(
            "syllabus-content"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="syllabus-loading">

            <div class="loading-spinner"></div>

            <p>
                Loading syllabus...
            </p>

        </div>

    `;

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    const container =
        document.getElementById(
            "syllabus-content"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="syllabus-no-results">

            <strong>
                Syllabus unavailable
            </strong>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================================================
   LOCKED SUBJECT MESSAGE
========================================================= */

function showPremiumMessage(subject) {

    const container =
        document.getElementById(
            "syllabus-content"
        );


    if (!container) {
        return;
    }


    const subjectKey =
        Object.keys(
            SUBJECT_INFO
        ).find(
            key =>
                SUBJECT_INFO[key].name ===
                subject
        );


    const upgradeURL =
        subjectKey
            ? `jamb-upgrade.html?type=syllabus&subject=${encodeURIComponent(subjectKey)}`
            : "jamb-upgrade.html";


    container.innerHTML = `

        <div class="syllabus-no-results">

            <strong>
                Unlock ${escapeHTML(subject)} Syllabus
            </strong>

            <p>
                Get the complete JAMB ${escapeHTML(subject)}
                syllabus for ₦500 on this device.
            </p>

            <a
                href="${upgradeURL}"
                class="study-note-button"
            >
                Unlock for ₦500 →
            </a>

        </div>

    `;

}


/* =========================================================
   EMPTY STATE
========================================================= */

function showEmptyState(subject) {

    const container =
        document.getElementById(
            "syllabus-content"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="syllabus-no-results">

            <strong>
                ${escapeHTML(subject)}
                syllabus is not available yet.
            </strong>

            <p>
                We're still preparing this subject.
                Please check back soon.
            </p>

        </div>

    `;

}


/* =========================================================
   RENDER SYLLABUS
========================================================= */

function renderSyllabus(
    rows,
    isPaid
) {

    const container =
        document.getElementById(
            "syllabus-content"
        );


    if (!container) {
        return;
    }


    const sections = {};


    rows.forEach(
        row => {

            const sectionKey =
                row.section_number;


            if (
                !sections[sectionKey]
            ) {

                sections[sectionKey] = {

                    sectionNumber:
                        row.section_number,

                    sectionTitle:
                        row.section_title,

                    topics: []

                };

            }


            sections[
                sectionKey
            ].topics.push(
                row
            );

        }
    );


    let html = "";


    Object.values(sections).forEach(
        (
            section,
            sectionIndex
        ) => {

            html += `

                <section
                    class="syllabus-section"
                    data-section="${sectionIndex + 1}"
                >

                    <div class="syllabus-section-header">

                        <div class="syllabus-section-number">

                            ${escapeHTML(
                                section.sectionNumber
                            )}

                        </div>

                        <div>

                            <span class="section-eyebrow">

                                SECTION
                                ${escapeHTML(
                                    section.sectionNumber
                                )}

                            </span>

                            <h2>

                                ${escapeHTML(
                                    section.sectionTitle
                                )}

                            </h2>

                        </div>

                    </div>

                    <div class="syllabus-topics">

            `;


            /* =================================================
               FULLY PAID SUBJECT
            ================================================= */

            if (isPaid) {

                section.topics.forEach(
                    (
                        topic,
                        topicIndex
                    ) => {

                        html +=
                            renderTopic(
                                topic,
                                topicIndex
                            );

                    }
                );

            }


            html += `

                    </div>

                </section>

            `;

        }
    );


    container.innerHTML =
        html;


    addTopicInteractions();

}


/* =========================================================
   RENDER NORMAL TOPIC
========================================================= */

function renderTopic(
    topic,
    index
) {

    const contents =
        normalizeArray(
            topic.contents
        );


    const objectives =
        normalizeArray(
            topic.objectives
        );


    return `

        <article
            class="syllabus-topic"
            data-topic="${escapeHTML(
                topic.topic_number
            )}"
        >

            <div class="syllabus-topic-header">

                <div class="syllabus-topic-number">

                    ${escapeHTML(
                        topic.topic_number
                    )}

                </div>


                <div class="syllabus-topic-title">

                    <span>

                        TOPIC
                        ${escapeHTML(
                            topic.topic_number
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            topic.topic_title
                        )}

                    </h3>

                </div>

            </div>


            <div class="syllabus-topic-body">

                ${
                    contents.length
                        ? `

                            <div class="syllabus-topic-column">

                                <span class="syllabus-column-label">

                                    CONTENT

                                </span>


                                <ul>

                                    ${contents
                                        .map(
                                            item => `

                                            <li>
                                                ${escapeHTML(
                                                    item
                                                )}
                                            </li>

                                        `
                                        )
                                        .join("")}

                                </ul>

                            </div>

                        `
                        : ""
                }


                ${
                    objectives.length
                        ? `

                            <div class="syllabus-topic-column">

                                <span class="syllabus-column-label">

                                    OBJECTIVES

                                </span>


                                <ul>

                                    ${objectives
                                        .map(
                                            item => `

                                            <li>
                                                ${escapeHTML(
                                                    item
                                                )}
                                            </li>

                                        `
                                        )
                                        .join("")}

                                </ul>

                            </div>

                        `
                        : ""
                }

            </div>

        </article>

    `;

}


/* =========================================================
   NORMALIZE CONTENT / OBJECTIVES
========================================================= */

function normalizeArray(value) {

    if (!value) {
        return [];
    }


    if (Array.isArray(value)) {
        return value;
    }


    if (typeof value === "string") {

        try {

            const parsed =
                JSON.parse(value);


            if (
                Array.isArray(parsed)
            ) {

                return parsed;

            }

        }

        catch (error) {

            return [
                value
            ];

        }

    }


    return [];

}


/* =========================================================
   TOPIC INTERACTION
========================================================= */

function addTopicInteractions() {

    const topics =
        document.querySelectorAll(
            ".syllabus-topic"
        );


    topics.forEach(
        topic => {

            const header =
                topic.querySelector(
                    ".syllabus-topic-header"
                );


            const body =
                topic.querySelector(
                    ".syllabus-topic-body"
                );


            if (!header || !body) {
                return;
            }


            body.style.display =
                "none";


            topic.classList.remove(
                "is-open"
            );


            header.addEventListener(
                "click",
                function () {

                    const isOpen =
                        body.style.display ===
                        "grid";


                    if (isOpen) {

                        body.style.display =
                            "none";

                        topic.classList.remove(
                            "is-open"
                        );

                    }

                    else {

                        body.style.display =
                            "grid";

                        topic.classList.add(
                            "is-open"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

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


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const subjectKey =
            getSubjectFromURL();


        if (!subjectKey) {

            showError(
                "No JAMB subject was selected."
            );

            return;
        }


        if (
            !SUBJECT_INFO[subjectKey]
        ) {

            showError(
                "This JAMB subject could not be found."
            );

            return;
        }


        updateSubjectInformation(
            subjectKey
        );


        loadSyllabus(
            subjectKey
        );

    }
);