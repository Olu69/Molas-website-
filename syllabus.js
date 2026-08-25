/* =========================================================
MOLAS JAMB HUB
SUBJECT-BY-SUBJECT SYLLABUS
Complete JavaScript
========================================================= */

/* =========================================================
JAMB SUBJECT DATA
========================================================= */

const jambSubjects = [

{
    id: "english",
    name: "Use of English",
    short: "ENGLISH",
    icon: "📖",
    description: "Comprehension, grammar, vocabulary and other areas of Use of English."
},
{
    id: "mathematics",
    name: "Mathematics",
    short: "MATHEMATICS",
    icon: "📐",
    description: "Algebra, geometry, statistics, calculus and other UTME mathematics topics."
},
{
    id: "physics",
    name: "Physics",
    short: "PHYSICS",
    icon: "⚡",
    description: "Mechanics, electricity, waves, heat, motion and other physics topics."
},
{
    id: "chemistry",
    name: "Chemistry",
    short: "CHEMISTRY",
    icon: "⚗️",
    description: "Atoms, bonding, reactions, organic chemistry and other chemistry topics."
},
{
    id: "biology",
    name: "Biology",
    short: "BIOLOGY",
    icon: "🧬",
    description: "Living organisms, genetics, ecology, evolution and biological processes."
},
{
    id: "economics",
    name: "Economics",
    short: "ECONOMICS",
    icon: "📊",
    description: "Markets, demand and supply, national income, money and economic development."
},
{
    id: "government",
    name: "Government",
    short: "GOVERNMENT",
    icon: "🏛️",
    description: "Political systems, institutions, constitutions, democracy and Nigerian government."
},
{
    id: "literature",
    name: "Literature in English",
    short: "LITERATURE",
    icon: "📚",
    description: "Prose, poetry, drama, literary devices and the study of prescribed texts."
},
{
    id: "commerce",
    name: "Commerce",
    short: "COMMERCE",
    icon: "💼",
    description: "Trade, business organizations, marketing, finance and commercial activities."
},
{
    id: "accounting",
    name: "Accounting",
    short: "ACCOUNTING",
    icon: "🧾",
    description: "Financial records, accounting principles, ledgers, statements and calculations."
},
{
    id: "geography",
    name: "Geography",
    short: "GEOGRAPHY",
    icon: "🌍",
    description: "Physical geography, human geography, maps, environment and population."
},
{
    id: "agriculture",
    name: "Agricultural Science",
    short: "AGRICULTURE",
    icon: "🌱",
    description: "Crop production, animal production, soil science and agricultural practices."
},
{
    id: "christian-religious-studies",
    name: "Christian Religious Studies",
    short: "CRS",
    icon: "✝️",
    description: "Biblical teachings, Christian beliefs, values and religious knowledge."
},
{
    id: "islamic-religious-studies",
    name: "Islamic Religious Studies",
    short: "IRS",
    icon: "☪️",
    description: "Qur'an, Hadith, Islamic beliefs, practices, history and moral teachings."
},
{
    id: "civic-education",
    name: "Civic Education",
    short: "CIVIC EDUCATION",
    icon: "🇳🇬",
    description: "Citizenship, rights, responsibilities, democracy and national values."
},
{
    id: "computer-science",
    name: "Computer Science",
    short: "COMPUTER SCIENCE",
    icon: "💻",
    description: "Computer systems, programming concepts, data, algorithms and information technology."
},
{
    id: "data-processing",
    name: "Data Processing",
    short: "DATA PROCESSING",
    icon: "🖥️",
    description: "Data, computer operations, information systems and digital technologies."
},
{
    id: "home-economics",
    name: "Home Economics",
    short: "HOME ECONOMICS",
    icon: "🏠",
    description: "Family living, food and nutrition, clothing and home management."
},
{
    id: "food-science",
    name: "Food Science",
    short: "FOOD SCIENCE",
    icon: "🥗",
    description: "Food composition, preservation, processing, nutrition and food safety."
},
{
    id: "fine-art",
    name: "Fine Art",
    short: "FINE ART",
    icon: "🎨",
    description: "Drawing, painting, design, art history and visual art techniques."
},
{
    id: "music",
    name: "Music",
    short: "MUSIC",
    icon: "🎵",
    description: "Music theory, notation, history, instruments and musical forms."
},
{
    id: "french",
    name: "French",
    short: "FRENCH",
    icon: "🇫🇷",
    description: "French language comprehension, vocabulary, grammar and communication."
},
{
    id: "yoruba",
    name: "Yoruba",
    short: "YORUBA",
    icon: "🗣️",
    description: "Yoruba language, literature, grammar, culture and communication."
},
{
    id: "igbo",
    name: "Igbo",
    short: "IGBO",
    icon: "🗣️",
    description: "Igbo language, literature, grammar, culture and communication."
},
{
    id: "hausa",
    name: "Hausa",
    short: "HAUSA",
    icon: "🗣️",
    description: "Hausa language, literature, grammar, culture and communication."
},
{
    id: "history",
    name: "History",
    short: "HISTORY",
    icon: "🏺",
    description: "Nigerian history, African history, world history and major historical events."
},
{
    id: "social-science",
    name: "Social Science",
    short: "SOCIAL SCIENCE",
    icon: "👥",
    description: "Society, human behaviour, social institutions and community development."
},
{
    id: "physical-health-education",
    name: "Physical and Health Education",
    short: "PHE",
    icon: "🏃",
    description: "Health, fitness, sports, physical activity and healthy living."
},
{
    id: "arabic",
    name: "Arabic",
    short: "ARABIC",
    icon: "أ",
    description: "Arabic language, grammar, comprehension, literature and communication."
}

];

/* =========================================================
DOM READY
========================================================= */

document.addEventListener(
“DOMContentLoaded”,
function () {

    initializeSyllabus();
}

);

/* =========================================================
INITIALIZE
========================================================= */

function initializeSyllabus() {

const grid =
    document.querySelector(
        ".syllabus-subject-grid"
    );
if (!grid) {
    console.warn(
        "Syllabus subject grid was not found."
    );
    return;
}
/*
   Render all subjects when the page loads.
*/
renderSubjects(
    jambSubjects
);
/*
   Setup search.
*/
setupSyllabusSearch();

}

/* =========================================================
RENDER SUBJECTS
========================================================= */

function renderSubjects(subjects) {

const grid =
    document.querySelector(
        ".syllabus-subject-grid"
    );
if (!grid) return;
/*
   No matching subjects
*/
if (
    !Array.isArray(subjects) ||
    subjects.length === 0
) {
    grid.innerHTML = `
        <div class="syllabus-no-results">
            <strong>
                No subject found
            </strong>
            <p>
                Try searching for another JAMB subject.
            </p>
        </div>
    `;
    return;
}
/*
   Create cards
*/
grid.innerHTML =
    subjects
        .map(
            function (subject, index) {
                return createSubjectCard(
                    subject,
                    index + 1
                );
            }
        )
        .join("");
/*
   Attach click events
*/
attachSubjectLinks();

}

/* =========================================================
CREATE SUBJECT CARD
========================================================= */

function createSubjectCard(
subject,
number
) {

const formattedNumber =
    String(number).padStart(2, "0");
return `
    <a
        href="jamb-syllabus-subject.html?subject=${encodeURIComponent(subject.id)}"
        class="syllabus-subject-card"
        data-subject="${escapeAttribute(subject.id)}"
        data-number="${formattedNumber}"
    >
        <div class="subject-card-icon">
            ${subject.icon}
        </div>
        <div class="subject-card-content">
            <span>
                ${escapeHTML(subject.short)}
            </span>
            <h3>
                ${escapeHTML(subject.name)}
            </h3>
            <p>
                ${escapeHTML(subject.description)}
            </p>
        </div>
        <div class="subject-card-arrow">
            Explore syllabus →
        </div>
    </a>
`;

}

/* =========================================================
SEARCH
========================================================= */

function setupSyllabusSearch() {

const searchInput =
    document.querySelector(
        ".syllabus-search input"
    );
if (!searchInput) {
    console.warn(
        "Syllabus search input was not found."
    );
    return;
}
searchInput.addEventListener(
    "input",
    function () {
        const searchValue =
            searchInput.value
                .trim()
                .toLowerCase();
        /*
           Show everything when search is empty.
        */
        if (!searchValue) {
            renderSubjects(
                jambSubjects
            );
            return;
        }
        /*
           Filter subjects.
        */
        const filteredSubjects =
            jambSubjects.filter(
                function (subject) {
                    return (
                        subject.name
                            .toLowerCase()
                            .includes(searchValue)
                        ||
                        subject.short
                            .toLowerCase()
                            .includes(searchValue)
                        ||
                        subject.id
                            .toLowerCase()
                            .includes(searchValue)
                    );
                }
            );
        renderSubjects(
            filteredSubjects
        );
    }
);

}

/* =========================================================
SUBJECT LINKS
========================================================= */

function attachSubjectLinks() {

const cards =
    document.querySelectorAll(
        ".syllabus-subject-card"
    );
cards.forEach(
    function (card) {
        card.addEventListener(
            "click",
            function () {
                /*
                   Allow the normal <a> link
                   to handle navigation.
                */
                const subject =
                    card.dataset.subject;
                if (!subject) return;
                console.log(
                    "Opening syllabus:",
                    subject
                );
            }
        );
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