/* =========================================================
   MOLAS — JAMB PAST QUESTIONS
   Supabase-powered Past Questions Archive

   TABLES
   ---------------------------------------------------------
   past_subjects
   - id
   - subject_name
   - subject_code
   - created_at

   past_questions
   - id
   - subject_id
   - exam_year
   - question_number
   - question
   - option_a
   - option_b
   - option_c
   - option_d
   - correct_answer
   - explanation
   - created_at
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://eidnzebqyxcpxbykybch.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


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
        "Loading subjects..."
    );


    await loadSubjects();


    hideLoading();

}


/* =========================================================
   LOAD SUBJECTS
========================================================= */

async function loadSubjects() {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("past_subjects")

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
        } = await supabaseClient

            .from("past_questions")

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


        years.forEach(
            year => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    year;


                option.textContent =
                    year;


                yearSelect.appendChild(
                    option
                );

            }
        );


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

        startButton.disabled =
            !subjectSelect.value ||
            !yearSelect.value;


        clearSelectionMessage();

        clearError();

    }
);


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
        } = await supabaseClient

            .from("past_questions")

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