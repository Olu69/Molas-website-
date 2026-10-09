const PRICES = {
    syllabus: 500,
    past_questions: 1000,
    cbt: 3000
};

const DEVICE_TOKEN_KEY =
    "molas_jamb_device_token";

const urlParams =
    new URLSearchParams(window.location.search);

const requestedType =
    urlParams.get("type");

const requestedSubject =
    urlParams.get("subject");

const selectedSyllabus = new Set();
const selectedPastQuestions = new Set();
const selectedCbt = new Set();


function normalize(value) {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ");
}


function getCardSubject(card) {
    return normalize(
        card.dataset.subjectKey ||
        card.dataset.subjectName
    );
}


function getCardName(card) {
    return (
        card.dataset.subjectName ||
        card.dataset.subjectKey ||
        "Subject"
    );
}


function getSection(type) {

    if (type === "syllabus") {
        return document.getElementById(
            "syllabus-section"
        );
    }

    if (type === "past_questions") {
        return document.getElementById(
            "past-questions-section"
        );
    }

    if (type === "cbt") {
        return document.getElementById(
            "cbt-section"
        );
    }

    return null;
}


function getCards(type) {

    if (type === "syllabus") {
        return document.querySelectorAll(
            ".syllabus-option"
        );
    }

    if (type === "past_questions") {
        return document.querySelectorAll(
            ".past-question-option"
        );
    }

    if (type === "cbt") {
        return document.querySelectorAll(
            ".cbt-option"
        );
    }

    return [];
}


/* =========================
   SYLLABUS SUMMARY
========================= */

function updateSyllabusSummary() {

    const text =
        document.getElementById(
            "syllabus-selection-text"
        );

    const total =
        document.getElementById(
            "syllabus-total"
        );

    const button =
        document.getElementById(
            "syllabus-continue-button"
        );

    const names = [];

    document
        .querySelectorAll(".syllabus-option")
        .forEach(card => {

            if (
                selectedSyllabus.has(
                    card.dataset.subjectId
                )
            ) {
                names.push(
                    getCardName(card)
                );
            }
        });

    const amount =
        names.length *
        PRICES.syllabus;

    text.textContent =
        names.length
            ? names.join(", ")
            : "No subjects selected yet.";

    total.textContent =
        `₦${amount.toLocaleString()}`;

    button.disabled =
        names.length === 0;
}


/* =========================
   PAST QUESTIONS SUMMARY
========================= */

function updatePastQuestionsSummary() {

    const text =
        document.getElementById(
            "past-questions-selection-text"
        );

    const total =
        document.getElementById(
            "past-questions-total"
        );

    const button =
        document.getElementById(
            "past-questions-continue-button"
        );

    const names = [];

    document
        .querySelectorAll(
            ".past-question-option"
        )
        .forEach(card => {

            if (
                selectedPastQuestions.has(
                    card.dataset.subjectId
                )
            ) {
                names.push(
                    getCardName(card)
                );
            }
        });

    const amount =
        names.length *
        PRICES.past_questions;

    text.textContent =
        names.length
            ? names.join(", ")
            : "No subjects selected yet.";

    total.textContent =
        `₦${amount.toLocaleString()}`;

    button.disabled =
        names.length === 0;
}


/* =========================
   CBT SUMMARY
========================= */

function updateCbtSummary() {

    const text =
        document.getElementById(
            "cbt-selection-text"
        );

    const button =
        document.getElementById(
            "cbt-continue-button"
        );

    const names = [];

    document
        .querySelectorAll(".cbt-option")
        .forEach(card => {

            if (
                selectedCbt.has(
                    card.dataset.subjectId
                )
            ) {
                names.push(
                    getCardName(card)
                );
            }
        });

    text.textContent =
        names.length === 0
            ? "Select exactly 4 subjects."
            : `${names.length} of 4 subjects selected: ${names.join(", ")}`;

    button.disabled =
        names.length !== 4;
}


/* =========================
   SELECTION
========================= */

function toggleSyllabus(card) {

    const id =
        card.dataset.subjectId;

    if (
        selectedSyllabus.has(id)
    ) {

        selectedSyllabus.delete(id);

        card.classList.remove(
            "selected"
        );

    } else {

        selectedSyllabus.add(id);

        card.classList.add(
            "selected"
        );
    }

    updateSyllabusSummary();
}


function togglePastQuestions(card) {

    const id =
        card.dataset.subjectId;

    if (
        selectedPastQuestions.has(id)
    ) {

        selectedPastQuestions.delete(id);

        card.classList.remove(
            "selected"
        );

    } else {

        selectedPastQuestions.add(id);

        card.classList.add(
            "selected"
        );
    }

    updatePastQuestionsSummary();
}


function toggleCbt(card) {

    const id =
        card.dataset.subjectId;

    if (
        selectedCbt.has(id)
    ) {

        selectedCbt.delete(id);

        card.classList.remove(
            "selected"
        );

    } else {

        if (
            selectedCbt.size >= 4
        ) {

            alert(
                "You can select exactly 4 CBT subjects."
            );

            return;
        }

        selectedCbt.add(id);

        card.classList.add(
            "selected"
        );
    }

    updateCbtSummary();
}


/* =========================
   DEVICE
========================= */

async function getDeviceTokenHash() {

    let deviceToken =
        localStorage.getItem(
            DEVICE_TOKEN_KEY
        );

    if (!deviceToken) {

        deviceToken =
            crypto.randomUUID();

        localStorage.setItem(
            DEVICE_TOKEN_KEY,
            deviceToken
        );
    }

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(deviceToken);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );

    return hashArray
        .map(byte =>
            byte
                .toString(16)
                .padStart(2, "0")
        )
        .join("");
}


async function registerDevice() {

    const deviceTokenHash =
        await getDeviceTokenHash();

    const deviceName =
        `${navigator.platform || "Device"} - ${
            navigator.userAgent.includes("Mobile")
                ? "Mobile"
                : "Desktop"
        }`;

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
                    deviceName
            }
        );

    if (error) {
        throw error;
    }

    return data;
}


/* =========================
   CREATE ORDER
========================= */

async function createPaymentOrder(
    orderType,
    subjectIds
) {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();

    if (
        error ||
        !data.session
    ) {

        window.location.replace(
            "account.html?resource=jamb"
        );

        return null;
    }

    const deviceAccessId =
        await registerDevice();

    const {
        data: orderData,
        error: orderError
    } =
        await supabaseClient.rpc(
            "create_jamb_payment_order",
            {
                p_order_type:
                    orderType,

                p_device_access_id:
                    deviceAccessId,

                p_subject_ids:
                    subjectIds
            }
        );

    if (orderError) {
        throw orderError;
    }

    return orderData;
}


/* =========================
   CONTINUE
========================= */

async function handleSyllabusContinue() {

    if (
        selectedSyllabus.size === 0
    ) {
        return;
    }

    const button =
        document.getElementById(
            "syllabus-continue-button"
        );

    button.disabled = true;

    button.textContent =
        "Creating order...";

    try {

        const subjectIds =
            Array.from(
                selectedSyllabus
            ).map(Number);

        const order =
            await createPaymentOrder(
                "syllabus",
                subjectIds
            );

        const orderId =
            typeof order === "object"
                ? order.id
                : order;

        if (!orderId) {
            throw new Error(
                "No order ID was returned."
            );
        }

window.location.href =
    `jamb-payment.html?order=${encodeURIComponent(orderId)}`;

        button.disabled = false;

        button.textContent =
            "Continue →";

    } catch (error) {

        console.error(
            "Syllabus order error:",
            error
        );

        alert(
            error.message ||
            "Unable to create the order."
        );

        button.disabled = false;

        button.textContent =
            "Continue →";
    }
}


async function handlePastQuestionsContinue() {

    if (
        selectedPastQuestions.size === 0
    ) {
        return;
    }

    const button =
        document.getElementById(
            "past-questions-continue-button"
        );

    button.disabled = true;

    button.textContent =
        "Creating order...";

    try {

        const subjectIds =
            Array.from(
                selectedPastQuestions
            ).map(Number);

        const order =
            await createPaymentOrder(
                "past_questions",
                subjectIds
            );

        const orderId =
            typeof order === "object"
                ? order.id
                : order;

        if (!orderId) {
            throw new Error(
                "No order ID was returned."
            );
        }

        window.location.href =
    `jamb-payment.html?order=${encodeURIComponent(orderId)}`;

        button.disabled = false;

        button.textContent =
            "Continue →";

    } catch (error) {

        console.error(
            "Past Questions order error:",
            error
        );

        alert(
            error.message ||
            "Unable to create the order."
        );

        button.disabled = false;

        button.textContent =
            "Continue →";
    }
}


async function handleCbtContinue() {

    if (
        selectedCbt.size !== 4
    ) {
        return;
    }

    const button =
        document.getElementById(
            "cbt-continue-button"
        );

    button.disabled = true;

    button.textContent =
        "Creating order...";

    try {

        const subjectIds =
            Array.from(
                selectedCbt
            ).map(Number);

        const order =
            await createPaymentOrder(
                "cbt",
                subjectIds
            );

        const orderId =
            typeof order === "object"
                ? order.id
                : order;

        if (!orderId) {
            throw new Error(
                "No order ID was returned."
            );
        }

        window.location.href =
    `jamb-payment.html?order=${encodeURIComponent(orderId)}`;

        button.disabled = false;

        button.textContent =
            "Continue →";

    } catch (error) {

        console.error(
            "CBT order error:",
            error
        );

        alert(
            error.message ||
            "Unable to create the order."
        );

        button.disabled = false;

        button.textContent =
            "Continue →";
    }
}


/* =========================
   BUTTONS
========================= */

function setupButtons() {

    document
        .querySelectorAll(
            ".syllabus-option .subject-select-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const card =
                        button.closest(
                            ".syllabus-option"
                        );

                    toggleSyllabus(card);
                }
            );
        });


    document
        .querySelectorAll(
            ".past-question-option .subject-select-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const card =
                        button.closest(
                            ".past-question-option"
                        );

                    togglePastQuestions(card);
                }
            );
        });


    document
        .querySelectorAll(
            ".cbt-option .cbt-select-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const card =
                        button.closest(
                            ".cbt-option"
                        );

                    toggleCbt(card);
                }
            );
        });


    const syllabusButton =
        document.getElementById(
            "syllabus-continue-button"
        );

    if (syllabusButton) {

        syllabusButton.addEventListener(
            "click",
            handleSyllabusContinue
        );
    }


   const pastQuestionsButton =
    document.getElementById(
        "past-questions-continue-button"
    );

if (pastQuestionsButton) {

    pastQuestionsButton.onclick =
        handlePastQuestionsContinue;
}


    const cbtButton =
        document.getElementById(
            "cbt-continue-button"
        );

    if (cbtButton) {

        cbtButton.addEventListener(
            "click",
            handleCbtContinue
        );
    }
}


/* =========================
   PRESELECT REQUESTED SUBJECT
========================= */

function preselectRequestedResource() {

    if (
        !requestedType ||
        !requestedSubject
    ) {
        return;
    }

    const cards =
        getCards(requestedType);

    const targetSubject =
        normalize(requestedSubject);

    let targetCard = null;

    cards.forEach(card => {

        const cardSubject =
            getCardSubject(card);

        if (
            cardSubject === targetSubject
        ) {
            targetCard = card;
        }
    });

    if (!targetCard) {

        console.warn(
            "Requested subject was not found:",
            requestedType,
            requestedSubject
        );

        return;
    }


    if (
        requestedType === "syllabus"
    ) {

        selectedSyllabus.add(
            targetCard.dataset.subjectId
        );

        targetCard.classList.add(
            "selected"
        );

        updateSyllabusSummary();
    }


    if (
        requestedType === "past_questions"
    ) {

        selectedPastQuestions.add(
            targetCard.dataset.subjectId
        );

        targetCard.classList.add(
            "selected"
        );

        updatePastQuestionsSummary();
    }


    if (
        requestedType === "cbt"
    ) {

        selectedCbt.add(
            targetCard.dataset.subjectId
        );

        targetCard.classList.add(
            "selected"
        );

        updateCbtSummary();
    }


    const section =
        getSection(requestedType);

    if (!section) {
        return;
    }

    setTimeout(() => {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 300);
}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupButtons();

        updateSyllabusSummary();

        updatePastQuestionsSummary();

        updateCbtSummary();

        preselectRequestedResource();
    }
);