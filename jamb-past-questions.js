/* =========================================================
   MOLAS — JAMB PAST QUESTIONS
   Supabase-powered Past Questions Archive

   NEW ACCESS MODEL
   ---------------------------------------------------------
   - One MOLAS account covers the JAMB Hub.
   - User must be logged in.
   - Past Questions are ₦1,000 per subject.
   - Purchasing a subject unlocks all available years
     for that subject.
   - Purchase is linked to the user's approved device.
   - Unpurchased subjects remain locked.
   - Locked subjects link to jamb-upgrade.html.
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

const subjectSelect =
    document.getElementById("subject-select");

const yearSelect =
    document.getElementById("year-select");

const startButton =
    document.getElementById("start-button");

const selectionMessage =
    document.getElementById("selection-message");

const selectionPanel =
    document.getElementById("selection-panel");

const questionSection =
    document.getElementById("question-section");

const questionSubject =
    document.getElementById("question-subject");

const questionNumber =
    document.getElementById("question-number");

const questionText =
    document.getElementById("question-text");

const optionsContainer =
    document.getElementById("options-container");

const answerFeedback =
    document.getElementById("answer-feedback");

const previousButton =
    document.getElementById("previous-button");

const nextButton =
    document.getElementById("next-button");

const submitButton =
    document.getElementById("submit-button");

const progressFill =
    document.getElementById("progress-fill");

const resultSection =
    document.getElementById("result-section");

const resultScore =
    document.getElementById("result-score");

const resultPercentage =
    document.getElementById("result-percentage");

const resultGrade =
    document.getElementById("result-grade");

const reviewButton =
    document.getElementById("review-button");

const restartButton =
    document.getElementById("restart-button");

const reviewSection =
    document.getElementById("review-section");

const reviewContainer =
    document.getElementById("review-container");

const loadingMessage =
    document.getElementById("loading-message");

const errorMessage =
    document.getElementById("error-message");


/* =========================================================
   STATE
========================================================= */

let subjects = [];

let questions = [];

let currentQuestionIndex = 0;

let selectedAnswers = {};

let currentSubject = null;

let currentYear = null;

let testSubmitted = false;


/*
   Current logged-in user
*/
let currentUser = null;


/*
   Current registered device
*/
let currentDeviceAccessId = null;


/*
   Subjects purchased on this device
*/
let purchasedSubjectIds = new Set();


/*
   Device token localStorage key
*/
const JAMB_DEVICE_TOKEN_KEY =
    "molas_jamb_device_token";


/*
   Past Questions price
*/
const PAST_QUESTIONS_PRICE =
    1000;


/* =========================================================
   INITIALIZE PAGE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializePage
);


async function initializePage() {

    hideElement(questionSection);

    hideElement(resultSection);

    hideElement(reviewSection);

    hideElement(errorMessage);


    showLoading(
        "Checking your MOLAS account..."
    );


    const accessLoaded =
        await loadUserAccess();


    if (!accessLoaded) {

        hideLoading();

        return;

    }


    showLoading(
        "Loading subjects..."
    );


    await loadSubjects();


    hideLoading();

}


/* =========================================================
   LOAD USER ACCESS
========================================================= */

async function loadUserAccess() {

    try {

        /*
           Check the existing MOLAS account session.
        */

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth.getSession();


        if (
            sessionError ||
            !sessionData ||
            !sessionData.session
        ) {

            /*
               No account session.

               This is the ONLY place where this page
               redirects to the account page.
            */

            window.location.replace(
                "account.html?resource=jamb"
            );

            return false;

        }


        currentUser =
            sessionData.session.user;


        /*
           Register this device.

           The database stores only the SHA-256 hash
           of the device token.
        */

        const deviceRegistered =
            await registerCurrentDevice();


        if (!deviceRegistered) {

            return false;

        }


        /*
           Load approved Past Questions purchases
           belonging to this user and this device.
        */

        const purchasesLoaded =
            await loadPurchasedSubjects();


        if (!purchasesLoaded) {

            return false;

        }


        console.log(
            "CURRENT USER:",
            currentUser.id
        );


        console.log(
            "CURRENT DEVICE:",
            currentDeviceAccessId
        );


        console.log(
            "PURCHASED SUBJECT IDS:",
            [...purchasedSubjectIds]
        );


        return true;

    } catch (error) {

        console.error(
            "USER ACCESS ERROR:",
            error
        );


        showError(
            "Unable to verify your MOLAS account."
        );


        return false;

    }

}


/* =========================================================
   REGISTER CURRENT DEVICE
========================================================= */

async function registerCurrentDevice() {

    try {

        const token =
            await getDeviceToken();


        if (!token) {

            showError(
                "Unable to create your device access."
            );


            return false;

        }


        const tokenHash =
            await hashDeviceToken(
                token
            );


        const deviceName =
            getDeviceName();


        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "register_jamb_device",
                {
                    p_device_token_hash:
                        tokenHash,

                    p_device_name:
                        deviceName
                }
            );


        if (error) {

            console.error(
                "DEVICE REGISTRATION ERROR:",
                error
            );


            showError(
                "Unable to register this device: " +
                error.message
            );


            return false;

        }


        if (!data) {

            showError(
                "No device access was returned."
            );


            return false;

        }


        currentDeviceAccessId =
            Number(data);


        return true;

    } catch (error) {

        console.error(
            "DEVICE ERROR:",
            error
        );


        showError(
            "Unable to register this device."
        );


        return false;

    }

}


/* =========================================================
   GET DEVICE TOKEN
========================================================= */

async function getDeviceToken() {

    let token =
        localStorage.getItem(
            JAMB_DEVICE_TOKEN_KEY
        );


    if (token) {

        return token;

    }


    /*
       Generate a secure random device token.
    */

    if (
        !window.crypto ||
        !window.crypto.getRandomValues
    ) {

        console.error(
            "Secure random generator unavailable."
        );


        return null;

    }


    const bytes =
        new Uint8Array(32);


    window.crypto.getRandomValues(
        bytes
    );


    token =
        Array.from(
            bytes,
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        ).join("");


    localStorage.setItem(
        JAMB_DEVICE_TOKEN_KEY,
        token
    );


    return token;

}


/* =========================================================
   HASH DEVICE TOKEN
========================================================= */

async function hashDeviceToken(
    token
) {

    const encoder =
        new TextEncoder();


    const data =
        encoder.encode(
            token
        );


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
        navigator.userAgent || "";


    if (
        /iPhone/i.test(
            userAgent
        )
    ) {

        return "iPhone";

    }


    if (
        /iPad/i.test(
            userAgent
        )
    ) {

        return "iPad";

    }


    if (
        /Android/i.test(
            userAgent
        )
    ) {

        return "Android device";

    }


    if (
        /Windows/i.test(
            userAgent
        )
    ) {

        return "Windows device";

    }


    if (
        /Macintosh/i.test(
            userAgent
        )
    ) {

        return "Mac device";

    }


    return "Web browser";

}


/* =========================================================
   LOAD PURCHASED SUBJECTS
========================================================= */

async function loadPurchasedSubjects() {

    try {

        purchasedSubjectIds =
            new Set();


        const {
            data,
            error
        } =
            await supabaseClient

                .from(
                    "jamb_subject_purchases"
                )

                .select(
                    "subject_id, resource_type, status, device_access_id"
                )

                .eq(
                    "user_id",
                    currentUser.id
                )

                .eq(
                    "resource_type",
                    "past_questions"
                )

                .eq(
                    "status",
                    "approved"
                )

                .eq(
                    "device_access_id",
                    currentDeviceAccessId
                );


        if (error) {

            console.error(
                "PURCHASE ACCESS ERROR:",
                error
            );


            showError(
                "Unable to load your Past Questions access: " +
                error.message
            );


            return false;

        }


        (data || []).forEach(
            purchase => {

                if (
                    purchase.subject_id !== null &&
                    purchase.subject_id !== undefined
                ) {

                    purchasedSubjectIds.add(
                        String(
                            purchase.subject_id
                        )
                    );

                }

            }
        );


        return true;

    } catch (error) {

        console.error(
            "PURCHASE LOAD ERROR:",
            error
        );


        showError(
            "Unable to check your Past Questions purchases."
        );


        return false;

    }

}


/* =========================================================
   CHECK SUBJECT ACCESS
========================================================= */

function hasSubjectAccess(
    subjectId
) {

    return purchasedSubjectIds.has(
        String(subjectId)
    );

}


/* =========================================================
   CHECK YEAR ACCESS
========================================================= */

function canAccessYear(
    subjectId,
    year
) {

    /*
       Once a subject has been purchased,
       ALL available years for that subject
       are unlocked.
    */

    return hasSubjectAccess(
        subjectId
    );

}


/* =========================================================
   LOAD SUBJECTS
========================================================= */

async function loadSubjects() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient

                .from(
                    "past_subjects"
                )

                .select(
                    "id, subject_name, subject_code"
                )

                .order(
                    "subject_name",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "SUPABASE SUBJECT ERROR:",
                error
            );


            showSelectionMessage(
                "Supabase error: " +
                error.message
            );


            return;

        }


        subjects =
            data || [];


        subjectSelect.innerHTML = `
            <option value="">
                Select subject
            </option>
        `;


        if (
            subjects.length === 0
        ) {

            showSelectionMessage(
                "No subjects have been added yet."
            );


            return;

        }


        subjects.forEach(
            subject => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    subject.id;


                option.textContent =
                    subject.subject_name;


                subjectSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "UNEXPECTED SUBJECT ERROR:",
            error
        );


        showSelectionMessage(
            "Connection error: " +
            error.message
        );

    }

}


/* =========================================================
   SUBJECT CHANGED
========================================================= */

subjectSelect.addEventListener(
    "change",
    async function () {

        const subjectId =
            this.value;


        yearSelect.innerHTML = `
            <option value="">
                Select year
            </option>
        `;


        startButton.disabled =
            true;


        clearSelectionMessage();

        clearError();


        if (!subjectId) {

            return;

        }


        showLoading(
            "Loading available years..."
        );


        await loadYears(
            subjectId
        );


        hideLoading();

    }
);


/* =========================================================
   LOAD YEARS
========================================================= */

async function loadYears(
    subjectId
) {

    try {

        const {
            data,
            error
        } =
            await supabaseClient

                .from(
                    "past_questions"
                )

                .select(
                    "exam_year"
                )

                .eq(
                    "subject_id",
                    subjectId
                )

                .order(
                    "exam_year",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "SUPABASE YEAR ERROR:",
                error
            );


            showSelectionMessage(
                "Supabase error: " +
                error.message
            );


            return;

        }


        const years = [
            ...new Set(
                (data || [])
                    .map(
                        item =>
                            item.exam_year
                    )
                    .filter(
                        year =>
                            year !== null &&
                            year !== undefined &&
                            year !== ""
                    )
            )
        ];


        if (
            years.length === 0
        ) {

            showSelectionMessage(
                "No past questions are available for this subject yet."
            );


            return;

        }


        const subjectPurchased =
            hasSubjectAccess(
                subjectId
            );


        years.forEach(
            year => {

                const option =
                    document.createElement(
                        "option"
                    );


                const accessible =
                    subjectPurchased;


                option.value =
                    year;


                option.dataset.access =
                    accessible
                        ? "unlocked"
                        : "locked";


                option.textContent =
                    accessible
                        ? `${year}`
                        : `${year} 🔒`;


                yearSelect.appendChild(
                    option
                );

            }
        );


        /*
           Tell the user what is happening
           when the subject has not been purchased.
        */

        if (
            !subjectPurchased
        ) {

            showUnlockMessage(
                subjectId
            );

        }

    } catch (error) {

        console.error(
            "YEAR ERROR:",
            error
        );


        showSelectionMessage(
            "Unable to load years: " +
            error.message
        );

    }

}


/* =========================================================
   YEAR CHANGED
========================================================= */

yearSelect.addEventListener(
    "change",
    function () {

        const subjectId =
            subjectSelect.value;


        const year =
            this.value;


        clearSelectionMessage();

        clearError();


        if (
            !subjectId ||
            !year
        ) {

            startButton.disabled =
                true;


            return;

        }


        const accessible =
            canAccessYear(
                subjectId,
                year
            );


        startButton.disabled =
            !accessible;


        if (!accessible) {

            showUnlockMessage(
                subjectId
            );

        }

    }
);


/* =========================================================
   SHOW UNLOCK MESSAGE
========================================================= */

function showUnlockMessage(
    subjectId
) {

    const subject =
        subjects.find(
            item =>
                String(item.id) ===
                String(subjectId)
        );


    const subjectName =
        subject
            ? subject.subject_name
            : "this subject";


    if (!selectionMessage) {

        return;

    }


    selectionMessage.innerHTML = `

        <span>
            ${escapeHTML(
                subjectName
            )} Past Questions are locked.
            Unlock this subject for ₦${PAST_QUESTIONS_PRICE.toLocaleString()}.
        </span>

        <a
            href="jamb-upgrade.html?type=past_questions&subject=${encodeURIComponent(
                subject
                    ? getSubjectKey(subject)
                    : ""
            )}"
            class="past-unlock-link"
        >
            Unlock ${escapeHTML(
                subjectName
            )} →
        </a>

    `;


    selectionMessage.classList.add(
        "visible"
    );

}


/* =========================================================
   GET SUBJECT KEY
========================================================= */

function getSubjectKey(
    subject
) {

    if (
        subject.subject_code
    ) {

        return String(
            subject.subject_code
        )
            .trim()
            .toLowerCase();

    }


    return String(
        subject.subject_name
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

}


/* =========================================================
   START PRACTICE
========================================================= */

startButton.addEventListener(
    "click",
    startPractice
);


async function startPractice() {

    const subjectId =
        subjectSelect.value;


    const year =
        yearSelect.value;


    console.log(
        "START PRACTICE"
    );


    console.log(
        "Subject ID:",
        subjectId
    );


    console.log(
        "Year:",
        year
    );


    if (
        !subjectId ||
        !year
    ) {

        showSelectionMessage(
            "Please select a subject and year."
        );


        return;

    }


    /*
       Re-check purchase access before
       allowing the questions to load.
    */

    const purchasesLoaded =
        await loadPurchasedSubjects();


    if (!purchasesLoaded) {

        return;

    }


    if (
        !canAccessYear(
            subjectId,
            year
        )
    ) {

        showUnlockMessage(
            subjectId
        );


        startButton.disabled =
            true;


        return;

    }


    currentSubject =
        subjects.find(
            subject =>
                String(subject.id) ===
                String(subjectId)
        );


    currentYear =
        year;


    currentQuestionIndex =
        0;


    selectedAnswers =
        {};


    testSubmitted =
        false;


    showLoading(
        "Loading past questions..."
    );


    clearError();


    try {

        console.log(
            "Querying past_questions..."
        );


        const {
            data,
            error
        } =
            await supabaseClient

                .from(
                    "past_questions"
                )

                .select(`
                    id,
                    subject_id,
                    exam_year,
                    question_number,
                    question,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_answer,
                    explanation
                `)

                .eq(
                    "subject_id",
                    subjectId
                )

                .eq(
                    "exam_year",
                    year
                )

                .order(
                    "question_number",
                    {
                        ascending: true
                    }
                );


        console.log(
            "PAST QUESTIONS DATA:",
            data
        );


        console.log(
            "PAST QUESTIONS ERROR:",
            error
        );


        if (error) {

            throw error;

        }


        questions =
            data || [];


        if (
            questions.length === 0
        ) {

            hideLoading();


            showSelectionMessage(
                `No questions were found for ${
                    currentSubject
                        ? currentSubject.subject_name
                        : "this subject"
                } — ${year}.`
            );


            return;

        }


        console.log(
            `Loaded ${questions.length} questions`
        );


        hideLoading();


        selectionPanel.classList.add(
            "hidden"
        );


        resultSection.classList.add(
            "hidden"
        );


        reviewSection.classList.add(
            "hidden"
        );


        questionSection.classList.remove(
            "hidden"
        );


        questionSubject.textContent =
            currentSubject
                ? currentSubject.subject_name
                : "JAMB";


        renderQuestion();


        questionSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        console.error(
            "PAST QUESTIONS ERROR:",
            error
        );


        hideLoading();


        showError(
            "Unable to load the questions: " +
            (
                error.message ||
                "Unknown Supabase error."
            )
        );

    }

}


/* =========================================================
   RENDER CURRENT QUESTION
========================================================= */

function renderQuestion() {

    if (
        !questions.length
    ) {

        return;

    }


    const currentQuestion =
        questions[
            currentQuestionIndex
        ];


    if (!currentQuestion) {

        return;

    }


    const total =
        questions.length;


    const number =
        currentQuestionIndex + 1;


    questionNumber.textContent =
        `${number} / ${total}`;


    questionText.textContent =
        currentQuestion.question ||
        "";


    optionsContainer.innerHTML =
        "";


    answerFeedback.innerHTML =
        "";


    const options = [

        {
            letter: "A",
            value:
                currentQuestion.option_a
        },

        {
            letter: "B",
            value:
                currentQuestion.option_b
        },

        {
            letter: "C",
            value:
                currentQuestion.option_c
        },

        {
            letter: "D",
            value:
                currentQuestion.option_d
        }

    ];


    options.forEach(
        option => {

            if (
                option.value === null ||
                option.value === undefined
            ) {

                return;

            }


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "answer-option";


            button.dataset.answer =
                option.letter;


            button.innerHTML = `

                <span class="option-letter">
                    ${option.letter}
                </span>

                <span class="option-text">
                    ${escapeHTML(
                        String(
                            option.value
                        )
                    )}
                </span>

            `;


            if (
                selectedAnswers[
                    currentQuestion.id
                ] === option.letter
            ) {

                button.classList.add(
                    "selected"
                );

            }


            button.addEventListener(
                "click",
                function () {

                    selectAnswer(
                        currentQuestion.id,
                        option.letter
                    );

                }
            );


            optionsContainer.appendChild(
                button
            );

        }
    );


    updateNavigation();

    updateProgress();

}


/* =========================================================
   SELECT ANSWER
========================================================= */

function selectAnswer(
    questionId,
    answer
) {

    if (
        testSubmitted
    ) {

        return;

    }


    selectedAnswers[
        questionId
    ] =
        answer;


    const buttons =
        optionsContainer.querySelectorAll(
            ".answer-option"
        );


    buttons.forEach(
        button => {

            button.classList.toggle(
                "selected",
                button.dataset.answer ===
                answer
            );

        }
    );


    answerFeedback.innerHTML =
        "";

}


/* =========================================================
   PREVIOUS QUESTION
========================================================= */

previousButton.addEventListener(
    "click",
    function () {

        if (
            currentQuestionIndex <= 0
        ) {

            return;

        }


        currentQuestionIndex--;


        renderQuestion();


        questionSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


/* =========================================================
   NEXT QUESTION
========================================================= */

nextButton.addEventListener(
    "click",
    function () {

        if (
            currentQuestionIndex >=
            questions.length - 1
        ) {

            return;

        }


        currentQuestionIndex++;


        renderQuestion();


        questionSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

function updateNavigation() {

    previousButton.disabled =
        currentQuestionIndex === 0;


    const isLastQuestion =
        currentQuestionIndex ===
        questions.length - 1;


    if (
        isLastQuestion
    ) {

        nextButton.classList.add(
            "hidden"
        );


        submitButton.classList.remove(
            "hidden"
        );

    } else {

        nextButton.classList.remove(
            "hidden"
        );


        submitButton.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   PROGRESS BAR
========================================================= */

function updateProgress() {

    const total =
        questions.length;


    if (
        !total
    ) {

        progressFill.style.width =
            "0%";


        return;

    }


    const percentage =
        (
            (currentQuestionIndex + 1) /
            total
        ) * 100;


    progressFill.style.width =
        `${percentage}%`;

}


/* =========================================================
   SUBMIT TEST
========================================================= */

submitButton.addEventListener(
    "click",
    submitTest
);


function submitTest() {

    if (
        !questions.length
    ) {

        return;

    }


    const unanswered =
        questions.filter(
            question =>
                !selectedAnswers[
                    question.id
                ]
        );


    if (
        unanswered.length > 0
    ) {

        const count =
            unanswered.length;


        const proceed =
            window.confirm(
                `${count} question${
                    count === 1
                        ? ""
                        : "s"
                } ${
                    count === 1
                        ? "is"
                        : "are"
                } unanswered. Submit anyway?`
            );


        if (!proceed) {

            return;

        }

    }


    testSubmitted =
        true;


    const score =
        calculateScore();


    const total =
        questions.length;


    const percentage =
        total
            ? Math.round(
                (score / total) * 100
            )
            : 0;


    const grade =
        calculateGrade(
            percentage
        );


    resultScore.textContent =
        `${score} / ${total}`;


    resultPercentage.textContent =
        `${percentage}%`;


    resultGrade.textContent =
        grade;


    questionSection.classList.add(
        "hidden"
    );


    resultSection.classList.remove(
        "hidden"
    );


    reviewSection.classList.add(
        "hidden"
    );


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   CALCULATE SCORE
========================================================= */

function calculateScore() {

    let score =
        0;


    questions.forEach(
        question => {

            const userAnswer =
                normalizeAnswer(
                    selectedAnswers[
                        question.id
                    ]
                );


            const correctAnswer =
                normalizeAnswer(
                    question.correct_answer
                );


            if (
                userAnswer &&
                correctAnswer &&
                userAnswer ===
                correctAnswer
            ) {

                score++;

            }

        }
    );


    return score;

}


/* =========================================================
   GRADE
========================================================= */

function calculateGrade(
    percentage
) {

    if (
        percentage >= 70
    ) {

        return "A";

    }


    if (
        percentage >= 60
    ) {

        return "B";

    }


    if (
        percentage >= 50
    ) {

        return "C";

    }


    if (
        percentage >= 45
    ) {

        return "D";

    }


    if (
        percentage >= 40
    ) {

        return "E";

    }


    return "F";

}


/* =========================================================
   REVIEW BUTTON
========================================================= */

reviewButton.addEventListener(
    "click",
    function () {

        renderReview();


        resultSection.classList.add(
            "hidden"
        );


        reviewSection.classList.remove(
            "hidden"
        );


        reviewSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


/* =========================================================
   RENDER REVIEW
========================================================= */

function renderReview() {

    reviewContainer.innerHTML =
        "";


    questions.forEach(
        (question, index) => {

            const userAnswer =
                normalizeAnswer(
                    selectedAnswers[
                        question.id
                    ]
                );


            const correctAnswer =
                normalizeAnswer(
                    question.correct_answer
                );


            const isCorrect =
                userAnswer ===
                correctAnswer;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "review-card";


            card.classList.add(
                isCorrect
                    ? "correct"
                    : "incorrect"
            );


            const options = [

                {
                    letter: "A",
                    value:
                        question.option_a
                },

                {
                    letter: "B",
                    value:
                        question.option_b
                },

                {
                    letter: "C",
                    value:
                        question.option_c
                },

                {
                    letter: "D",
                    value:
                        question.option_d
                }

            ];


            let optionsHTML =
                "";


            options.forEach(
                option => {

                    if (
                        option.value === null ||
                        option.value === undefined
                    ) {

                        return;

                    }


                    let classes =
                        "review-option";


                    if (
                        normalizeAnswer(
                            option.letter
                        ) ===
                        correctAnswer
                    ) {

                        classes +=
                            " correct-option";

                    }


                    if (
                        normalizeAnswer(
                            option.letter
                        ) ===
                        userAnswer &&
                        userAnswer !==
                        correctAnswer
                    ) {

                        classes +=
                            " wrong-option";

                    }


                    optionsHTML += `

                        <div class="${classes}">

                            <span class="option-letter">
                                ${option.letter}
                            </span>

                            <span>
                                ${escapeHTML(
                                    String(
                                        option.value
                                    )
                                )}
                            </span>

                        </div>

                    `;

                }
            );


            card.innerHTML = `

                <div class="review-card-top">

                    <span>
                        QUESTION ${index + 1}
                    </span>

                    <strong>
                        ${
                            isCorrect
                                ? "Correct"
                                : "Incorrect"
                        }
                    </strong>

                </div>


                <div class="review-question">

                    ${escapeHTML(
                        String(
                            question.question ||
                            ""
                        )
                    )}

                </div>


                <div class="review-options">

                    ${optionsHTML}

                </div>


                <div class="review-answer">

                    <strong>
                        Your answer:
                    </strong>

                    ${
                        userAnswer ||
                        "Not answered"
                    }

                    <br>

                    <strong>
                        Correct answer:
                    </strong>

                    ${
                        correctAnswer ||
                        "—"
                    }

                </div>


                ${
                    question.explanation
                        ? `

                            <div class="review-explanation">

                                <strong>
                                    Explanation
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        String(
                                            question.explanation
                                        )
                                    )}
                                </p>

                            </div>

                        `
                        : ""
                }

            `;


            reviewContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   RESTART
========================================================= */

restartButton.addEventListener(
    "click",
    restartPage
);


function restartPage() {

    questions =
        [];


    currentQuestionIndex =
        0;


    selectedAnswers =
        {};


    currentSubject =
        null;


    currentYear =
        null;


    testSubmitted =
        false;


    resultSection.classList.add(
        "hidden"
    );


    reviewSection.classList.add(
        "hidden"
    );


    questionSection.classList.add(
        "hidden"
    );


    selectionPanel.classList.remove(
        "hidden"
    );


    subjectSelect.value =
        "";


    yearSelect.innerHTML = `
        <option value="">
            Select year
        </option>
    `;


    startButton.disabled =
        true;


    clearSelectionMessage();

    clearError();


    selectionPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   NORMALIZE ANSWER
========================================================= */

function normalizeAnswer(
    answer
) {

    if (
        answer === null ||
        answer === undefined
    ) {

        return "";

    }


    return String(answer)
        .trim()
        .toUpperCase()
        .replace(
            /\s+/g,
            ""
        );

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
   LOADING
========================================================= */

function showLoading(
    message
) {

    if (
        !loadingMessage
    ) {

        return;

    }


    loadingMessage.textContent =
        message ||
        "Loading...";


    loadingMessage.classList.remove(
        "hidden"
    );

}


function hideLoading() {

    if (
        !loadingMessage
    ) {

        return;

    }


    loadingMessage.classList.add(
        "hidden"
    );

}


/* =========================================================
   SELECTION MESSAGE
========================================================= */

function showSelectionMessage(
    message
) {

    if (
        !selectionMessage
    ) {

        return;

    }


    selectionMessage.textContent =
        message;


    selectionMessage.classList.add(
        "visible"
    );

}


function clearSelectionMessage() {

    if (
        !selectionMessage
    ) {

        return;

    }


    selectionMessage.textContent =
        "";


    selectionMessage.classList.remove(
        "visible"
    );

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    message
) {

    if (
        !errorMessage
    ) {

        return;

    }


    errorMessage.textContent =
        message;


    errorMessage.classList.remove(
        "hidden"
    );

}


function clearError() {

    if (
        !errorMessage
    ) {

        return;

    }


    errorMessage.classList.add(
        "hidden"
    );

}


/* =========================================================
   HIDE ELEMENT
========================================================= */

function hideElement(
    element
) {

    if (
        element
    ) {

        element.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   SHOW ELEMENT
========================================================= */

function showElement(
    element
) {

    if (
        element
    ) {

        element.classList.remove(
            "hidden"
        );

    }

}