/* =========================================================
   MOLAS — JAMB SUBJECT SYLLABUS
   Supabase REST API
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://eidnzebqyxcpxbykybch.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";


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
        document.getElementById("subject-title");

    const description =
        document.getElementById("subject-description");

    const name =
        document.getElementById("subject-name");

    const code =
        document.getElementById("subject-code");


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
   LOAD SYLLABUS FROM SUPABASE
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


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/jamb_syllabus` +
                `?subject=eq.${encodeURIComponent(subjectName)}` +
                `&order=section_number.asc,topic_number.asc`,
                {
                    method: "GET",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

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
        "Supabase error:",
        errorText
    );
    
    showError(
        errorText
    );
    
    return;
}


        const data =
            await response.json();


        if (!data || data.length === 0) {

            showEmptyState(
                subjectName
            );

            return;
        }


        renderSyllabus(data);

    } catch (error) {

        console.error(
            "Syllabus loading error:",
            error
        );

        showError(
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
                ${escapeHTML(subject)} syllabus
                is not available yet.
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

function renderSyllabus(rows) {

    const container =
        document.getElementById(
            "syllabus-content"
        );


    if (!container) {
        return;
    }


    const sections = {};


    rows.forEach(row => {

        const sectionKey =
            row.section_number;


        if (!sections[sectionKey]) {

            sections[sectionKey] = {

                sectionNumber:
                    row.section_number,

                sectionTitle:
                    row.section_title,

                topics: []

            };

        }


        sections[sectionKey].topics.push(
            row
        );

    });


    let html = "";


    Object.values(sections).forEach(
        (section, sectionIndex) => {

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


            section.topics.forEach(
                (topic, topicIndex) => {

                    html += renderTopic(
                        topic,
                        topicIndex
                    );

                }
            );


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
   RENDER TOPIC
========================================================= */

function renderTopic(topic, index) {

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
                                        .map(item => `

                                            <li>
                                                ${escapeHTML(item)}
                                            </li>

                                        `)
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
                                        .map(item => `

                                            <li>
                                                ${escapeHTML(item)}
                                            </li>

                                        `)
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


            if (Array.isArray(parsed)) {
                return parsed;
            }


        } catch (error) {

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

/* =========================================================
   TOPIC OPEN / CLOSE
========================================================= */
function addTopicInteractions() {
    
    const topics = document.querySelectorAll(".syllabus-topic");
    
    topics.forEach(topic => {
        
        const header = topic.querySelector(".syllabus-topic-header");
        const body = topic.querySelector(".syllabus-topic-body");
        
        if (!header || !body) {
            return;
        }
        
        // Start closed
        body.style.display = "none";
        topic.classList.remove("is-open");
        
        header.addEventListener("click", function() {
            
            const isOpen =
                body.style.display === "grid";
            
            if (isOpen) {
                
                // CLOSE
                body.style.display = "none";
                topic.classList.remove("is-open");
                
            } else {
                
                // OPEN
                body.style.display = "grid";
                topic.classList.add("is-open");
                
            }
            
        });
        
    });
    
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