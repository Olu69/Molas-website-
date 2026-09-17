/* =========================================================
   MOLAS PHYSICAL CLASSES
   COMPLETE PAGE JAVASCRIPT
   SUPABASE-POWERED IMAGES
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       SUPABASE CONNECTION
    ===================================================== */

    const SUPABASE_URL =
        "https://eidnzebqyxcpxbykybch.supabase.co";

    const SUPABASE_ANON_KEY =
        "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";

    let db = null;

    if (
        window.supabase &&
        SUPABASE_URL &&
        SUPABASE_ANON_KEY &&
        SUPABASE_ANON_KEY !==
            "PASTE_YOUR_PUBLIC_OR_ANON_KEY_HERE"
    ) {
        db = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );
    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const gallery =
        document.getElementById("centre-gallery");

    const programmeGrid =
        document.getElementById("programme-grid");

    const programmeSelect =
        document.getElementById("programme");

    const registrationForm =
        document.getElementById(
            "physical-registration-form"
        );

    const formMessage =
        document.getElementById("form-message");

    const heroImage =
        document.getElementById("hero-centre-image");

    const experienceImage =
        document.getElementById("experience-image");

    const directionsLink =
        document.getElementById("directions-link");

    const centreAddress =
        document.getElementById("centre-address");

    const map =
        document.getElementById("molas-map");


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const mobileMenuBtn =
        document.querySelector(".mobile-menu-btn");

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener(
            "click",
            () => {
                console.log(
                    "Mobile menu is not connected yet."
                );
            }
        );
    }


    /* =====================================================
       GALLERY MODAL
    ===================================================== */

    let galleryModal = null;

    let galleryImages = [];

    let currentGalleryIndex = 0;


    /* =====================================================
       CREATE GALLERY MODAL
    ===================================================== */

    function createGalleryModal() {

        if (galleryModal) {
            return;
        }

        galleryModal =
            document.createElement("div");

        galleryModal.className =
            "gallery-modal";

        galleryModal.innerHTML = `
            <div class="gallery-modal-content">

                <button
                    type="button"
                    class="gallery-modal-close"
                    aria-label="Close image"
                >
                    ×
                </button>

                <button
                    type="button"
                    class="gallery-modal-prev"
                    aria-label="Previous image"
                >
                    ‹
                </button>

                <div class="gallery-modal-image-wrap">

                    <img
                        src=""
                        alt=""
                        draggable="false"
                    >

                </div>

                <button
                    type="button"
                    class="gallery-modal-next"
                    aria-label="Next image"
                >
                    ›
                </button>

                <div class="gallery-modal-info">

                    <div class="gallery-modal-counter">
                        1 / 1
                    </div>

                    <h2 class="gallery-modal-title"></h2>

                    <p class="gallery-modal-description"></p>

                </div>

            </div>
        `;

        document.body.appendChild(
            galleryModal
        );


        /* =================================================
           BUTTONS
        ================================================= */

        const closeButton =
            galleryModal.querySelector(
                ".gallery-modal-close"
            );

        const previousButton =
            galleryModal.querySelector(
                ".gallery-modal-prev"
            );

        const nextButton =
            galleryModal.querySelector(
                ".gallery-modal-next"
            );


        closeButton.addEventListener(
            "click",
            closeGalleryModal
        );


        previousButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                showPreviousGalleryImage();

            }
        );


        nextButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                showNextGalleryImage();

            }
        );


        /* =================================================
           CLICK OUTSIDE
        ================================================= */

        galleryModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    galleryModal
                ) {
                    closeGalleryModal();
                }

            }
        );


        /* =================================================
           SWIPE
        ================================================= */

        let touchStartX = 0;

        let touchStartY = 0;

        let touchEndX = 0;

        let touchEndY = 0;


        const swipeArea =
            galleryModal.querySelector(
                ".gallery-modal-image-wrap"
            );


        swipeArea.addEventListener(
            "touchstart",
            event => {

                if (
                    !event.touches ||
                    !event.touches.length
                ) {
                    return;
                }

                touchStartX =
                    event.touches[0].clientX;

                touchStartY =
                    event.touches[0].clientY;

                touchEndX =
                    touchStartX;

                touchEndY =
                    touchStartY;

            },
            {
                passive: true
            }
        );


        swipeArea.addEventListener(
            "touchmove",
            event => {

                if (
                    !event.touches ||
                    !event.touches.length
                ) {
                    return;
                }

                touchEndX =
                    event.touches[0].clientX;

                touchEndY =
                    event.touches[0].clientY;

            },
            {
                passive: true
            }
        );


        swipeArea.addEventListener(
            "touchend",
            () => {

                handleGallerySwipe();

            },
            {
                passive: true
            }
        );


        function handleGallerySwipe() {

            const horizontalDistance =
                touchEndX - touchStartX;

            const verticalDistance =
                touchEndY - touchStartY;


            if (
                Math.abs(horizontalDistance) <=
                Math.abs(verticalDistance)
            ) {
                return;
            }


            if (
                Math.abs(horizontalDistance) <
                50
            ) {
                return;
            }


            if (
                horizontalDistance < 0
            ) {

                showNextGalleryImage();

            } else {

                showPreviousGalleryImage();

            }


            touchStartX = 0;
            touchStartY = 0;
            touchEndX = 0;
            touchEndY = 0;
        }
    }


    /* =====================================================
       UPDATE MODAL CONTENT
    ===================================================== */

    function updateGalleryModal() {

        if (
            !galleryModal ||
            !galleryImages.length
        ) {
            return;
        }

        const item =
            galleryImages[
                currentGalleryIndex
            ];


        const image =
            galleryModal.querySelector(
                ".gallery-modal-image-wrap img"
            );


        const title =
            galleryModal.querySelector(
                ".gallery-modal-title"
            );


        const description =
            galleryModal.querySelector(
                ".gallery-modal-description"
            );


        const counter =
            galleryModal.querySelector(
                ".gallery-modal-counter"
            );


        image.src =
            item.image_url || "";

        image.alt =
            item.title ||
            "MOLAS Learning Centre";


        title.textContent =
            item.title ||
            "MOLAS Learning Centre";


        description.textContent =
            item.caption ||
            "";


        if (item.caption) {

            description.style.display =
                "block";

        } else {

            description.style.display =
                "none";

        }


        counter.textContent =
            `${currentGalleryIndex + 1} / ${galleryImages.length}`;
    }


    /* =====================================================
       OPEN GALLERY MODAL
    ===================================================== */

    function openGalleryModal(
        imageUrl,
        imageAlt
    ) {

        if (!imageUrl) {
            return;
        }

        createGalleryModal();


        const foundIndex =
            galleryImages.findIndex(
                item =>
                    item.image_url ===
                    imageUrl
            );


        currentGalleryIndex =
            foundIndex >= 0
                ? foundIndex
                : 0;


        updateGalleryModal();


        galleryModal.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";
    }


    /* =====================================================
       NEXT IMAGE
    ===================================================== */

    function showNextGalleryImage() {

        if (
            !galleryImages.length
        ) {
            return;
        }


        currentGalleryIndex =
            (
                currentGalleryIndex + 1
            ) %
            galleryImages.length;


        updateGalleryModal();
    }


    /* =====================================================
       PREVIOUS IMAGE
    ===================================================== */

    function showPreviousGalleryImage() {

        if (
            !galleryImages.length
        ) {
            return;
        }


        currentGalleryIndex =
            (
                currentGalleryIndex -
                1 +
                galleryImages.length
            ) %
            galleryImages.length;


        updateGalleryModal();
    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeGalleryModal() {

        if (!galleryModal) {
            return;
        }


        galleryModal.classList.remove(
            "active"
        );


        document.body.style.overflow =
            "";
    }


    /* =====================================================
       KEYBOARD CONTROLS
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (!galleryModal) {
                return;
            }


            if (
                !galleryModal.classList.contains(
                    "active"
                )
            ) {
                return;
            }


            if (
                event.key === "Escape"
            ) {

                closeGalleryModal();

            }


            if (
                event.key === "ArrowRight"
            ) {

                showNextGalleryImage();

            }


            if (
                event.key === "ArrowLeft"
            ) {

                showPreviousGalleryImage();

            }

        }
    );


    /* =====================================================
       SET IMAGE
    ===================================================== */

    function setImageIfAvailable(
        imageElement,
        imageUrl,
        altText
    ) {

        if (
            !imageElement ||
            !imageUrl
        ) {
            return;
        }


        imageElement.src =
            imageUrl;


        imageElement.alt =
            altText ||
            imageElement.alt ||
            "MOLAS Learning Centre";


        imageElement.style.display =
            "block";
    }


    /* =====================================================
       CREATE GALLERY CARD
    ===================================================== */

    function createGalleryCard(
        item,
        index
    ) {

        const card =
            document.createElement("article");

        card.className =
            "gallery-card";


        const image =
            document.createElement("img");

        image.src =
            item.image_url;

        image.alt =
            item.title ||
            "MOLAS Learning Centre";

        image.loading =
            index === 0
                ? "eager"
                : "lazy";


        const overlay =
            document.createElement("div");

        overlay.className =
            "gallery-card-content";


        if (item.title) {

            const title =
                document.createElement("h3");

            title.textContent =
                item.title;

            overlay.appendChild(
                title
            );

        }


        if (item.caption) {

            const caption =
                document.createElement("p");

            caption.textContent =
                item.caption;

            overlay.appendChild(
                caption
            );

        }


        card.appendChild(
            image
        );

        card.appendChild(
            overlay
        );


        card.addEventListener(
            "click",
            () => {

                openGalleryModal(
                    item.image_url,
                    item.title
                );

            }
        );


        return card;
    }


    /* =====================================================
       LOAD CENTRE GALLERY
    ===================================================== */

    async function loadGallery() {

        if (!gallery) {

            console.error(
                "❌ #centre-gallery was not found."
            );

            return;
        }


        if (!db) {

            console.error(
                "❌ Supabase is not connected."
            );


            gallery.innerHTML = `
                <div class="gallery-loading">
                    Supabase is not connected.
                </div>
            `;

            return;
        }


        try {

            const {
                data,
                error
            } = await db
                .from(
                    "learning_centre_gallery"
                )
                .select("*");


            console.log(
                "✅ GALLERY DATA:",
                data
            );


            console.log(
                "❌ GALLERY ERROR:",
                error
            );


            if (error) {
                throw error;
            }


            if (
                !data ||
                data.length === 0
            ) {

                gallery.innerHTML = `
                    <div class="gallery-loading">
                        No centre photos found.
                    </div>
                `;

                return;
            }


            galleryImages =
                data;


            gallery.innerHTML =
                "";


            data.forEach(
                (item, index) => {

                    console.log(
                        "IMAGE URL:",
                        item.image_url
                    );


                    const card =
                        createGalleryCard(
                            item,
                            index
                        );


                    gallery.appendChild(
                        card
                    );

                }
            );

        } catch (error) {

            console.error(
                "❌ GALLERY FAILED:",
                error
            );


            gallery.innerHTML = `
                <div class="gallery-loading">
                    Gallery error: ${error.message}
                </div>
            `;

        }
    }


    /* =====================================================
       CREATE PROGRAMME CARD
    ===================================================== */

    function createProgrammeCard(
        programme
    ) {

        const card =
            document.createElement("article");

        card.className =
            "programme-card";


        if (programme.image_url) {

            const imageContainer =
                document.createElement("div");

            imageContainer.className =
                "programme-card-image";


            const image =
                document.createElement("img");

            image.src =
                programme.image_url;

            image.alt =
                programme.name ||
                "MOLAS Physical Class";

            image.loading =
                "lazy";


            imageContainer.appendChild(
                image
            );


            card.appendChild(
                imageContainer
            );

        }


        const body =
            document.createElement("div");

        body.className =
            "programme-card-body";


        if (programme.category) {

            const category =
                document.createElement("div");

            category.className =
                "programme-card-category";

            category.textContent =
                programme.category;


            body.appendChild(
                category
            );

        }


        const title =
            document.createElement("h3");

        title.textContent =
            programme.name ||
            "";


        body.appendChild(
            title
        );


        if (programme.description) {

            const description =
                document.createElement("p");

            description.textContent =
                programme.description;


            body.appendChild(
                description
            );

        }


        if (programme.schedule) {

            const schedule =
                document.createElement("div");

            schedule.className =
                "programme-card-schedule";

            schedule.textContent =
                programme.schedule;


            body.appendChild(
                schedule
            );

        }


        const button =
            document.createElement("a");

        button.href =
            "#registration";

        button.className =
            "primary-btn";

        button.textContent =
            "Join This Class";


        button.addEventListener(
            "click",
            () => {

                if (programmeSelect) {

                    programmeSelect.value =
                        String(
                            programme.name ||
                            ""
                        );

                }

            }
        );


        body.appendChild(
            button
        );


        card.appendChild(
            body
        );


        return card;
    }


    /* =====================================================
       LOAD PROGRAMMES
    ===================================================== */

    async function loadProgrammes() {

        if (!programmeGrid) {
            return;
        }


        if (!db) {

            programmeGrid.innerHTML = `
                <div class="programme-loading">
                    Programmes will appear here.
                </div>
            `;

            return;
        }


        try {

            const {
                data,
                error
            } = await db
                .from(
                    "physical_class_programmes"
                )
                .select(
                    "id, created_at, name, description, category, schedule, active, image_url"
                )
                .eq(
                    "active",
                    true
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


            if (error) {
                throw error;
            }


            programmeGrid.innerHTML =
                "";


            if (
                !data ||
                data.length === 0
            ) {

                programmeGrid.innerHTML = `
                    <div class="programme-loading">
                        No programmes are currently available.
                    </div>
                `;

                return;
            }


            if (programmeSelect) {

                programmeSelect.innerHTML = `
                    <option value="">
                        Select a programme
                    </option>
                `;

            }


            data.forEach(
                programme => {

                    const card =
                        createProgrammeCard(
                            programme
                        );


                    programmeGrid.appendChild(
                        card
                    );


                    if (programmeSelect) {

                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            programme.name ||
                            "";


                        option.textContent =
                            programme.name ||
                            "Programme";


                        programmeSelect.appendChild(
                            option
                        );

                    }

                }
            );

        } catch (error) {

            console.error(
                "Programme error:",
                error
            );


            programmeGrid.innerHTML = `
                <div class="programme-loading">
                    Unable to load programmes.
                </div>
            `;

        }
    }


    /* =====================================================
       FORM MESSAGE
    ===================================================== */

    function showFormMessage(
        message,
        type = "normal"
    ) {

        if (!formMessage) {
            return;
        }


        formMessage.textContent =
            message;


        formMessage.className =
            "form-message";


        if (
            type === "success"
        ) {

            formMessage.classList.add(
                "success"
            );

        } else if (
            type === "error"
        ) {

            formMessage.classList.add(
                "error"
            );

        }
    }


    /* =====================================================
       REGISTRATION FORM
    ===================================================== */

    if (registrationForm) {

        registrationForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                if (!db) {

                    showFormMessage(
                        "The registration system is not connected yet.",
                        "error"
                    );

                    return;
                }


                const submitButton =
                    registrationForm.querySelector(
                        'button[type="submit"]'
                    );


                const formData =
                    new FormData(
                        registrationForm
                    );


                const registration = {

                    full_name:
                        String(
                            formData.get(
                                "full_name"
                            ) || ""
                        ).trim(),

                    phone:
                        String(
                            formData.get(
                                "phone"
                            ) || ""
                        ).trim(),

                    whatsapp:
                        String(
                            formData.get(
                                "whatsapp"
                            ) || ""
                        ).trim(),

                    email:
                        String(
                            formData.get(
                                "email"
                            ) || ""
                        ).trim(),

                    programme:
                        String(
                            formData.get(
                                "programme"
                            ) || ""
                        ).trim(),

                    education_level:
                        String(
                            formData.get(
                                "education_level"
                            ) || ""
                        ).trim(),

                    preferred_session:
                        String(
                            formData.get(
                                "preferred_session"
                            ) || ""
                        ).trim(),

                    message:
                        String(
                            formData.get(
                                "message"
                            ) || ""
                        ).trim(),

                    status:
                        "new"
                };


                if (
                    !registration.full_name ||
                    !registration.phone ||
                    !registration.programme
                ) {

                    showFormMessage(
                        "Please complete your name, phone number and programme.",
                        "error"
                    );

                    return;
                }


                if (submitButton) {

                    submitButton.disabled =
                        true;


                    submitButton.dataset.originalText =
                        submitButton.textContent;


                    submitButton.textContent =
                        "Submitting...";

                }


                showFormMessage(
                    "Submitting your registration..."
                );


                try {

                    const {
                        error
                    } = await db
                        .from(
                            "physical_class_registrations"
                        )
                        .insert([
                            registration
                        ]);


                    if (error) {
                        throw error;
                    }


                    showFormMessage(
                        "Registration submitted successfully. MOLAS will contact you soon.",
                        "success"
                    );


                    registrationForm.reset();

                } catch (error) {

                    console.error(
                        "Registration error:",
                        error
                    );


                    showFormMessage(
                        "We couldn't submit your registration. Please try again.",
                        "error"
                    );

                } finally {

                    if (submitButton) {

                        submitButton.disabled =
                            false;


                        submitButton.textContent =
                            submitButton.dataset.originalText ||
                            "Submit Registration";

                    }

                }

            }
        );

    }


    /* =====================================================
       REAL MAP
    ===================================================== */

    function setupMap() {

        if (!map) {
            return;
        }

        /*
           Map will be connected after
           the actual MOLAS centre location
           is available.
        */

    }


    /* =====================================================
       DIRECTIONS
    ===================================================== */

    if (directionsLink) {

        directionsLink.addEventListener(
            "click",
            event => {

                if (
                    directionsLink.getAttribute(
                        "href"
                    ) === "#"
                ) {

                    event.preventDefault();


                    alert(
                        "The MOLAS centre location will be added here."
                    );

                }

            }
        );

    }


    /* =====================================================
       SMOOTH INTERNAL LINKS
    ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    event => {

                        const targetId =
                            link.getAttribute(
                                "href"
                            );


                        if (
                            !targetId ||
                            targetId === "#"
                        ) {
                            return;
                        }


                        const target =
                            document.querySelector(
                                targetId
                            );


                        if (!target) {
                            return;
                        }


                        event.preventDefault();


                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }
                );

            }
        );


    /* =====================================================
       VISION • MISSION • CORE VALUES
       CONTINUOUS LINE-BY-LINE REVEAL

       Vision stays visible.
       Mission stays visible.
       Core values stay visible.

       Everything clears ONLY after the
       entire sequence has finished.
    ===================================================== */

    function setupValuesAnimation() {

        const valuesSection =
            document.querySelector(
                ".molas-values-section"
            );

        if (!valuesSection) {
            return;
        }


        const vision =
            valuesSection.querySelector(
                ".molas-vision"
            );

        const mission =
            valuesSection.querySelector(
                ".molas-mission"
            );

        const coreValues =
            valuesSection.querySelectorAll(
                ".core-value"
            );


        if (
            !vision ||
            !mission ||
            !coreValues.length
        ) {
            return;
        }


        /* =================================================
           RESPECT REDUCED MOTION
        ================================================= */

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            return;
        }


        /* =================================================
           ANIMATION CSS
        ================================================= */

        const style =
            document.createElement("style");

        style.textContent = `

            .molas-values-section
            .value-animation-card {

                opacity: 0;

                transition:
                    opacity 0.8s ease;

            }


            .molas-values-section
            .value-animation-card.is-active {

                opacity: 1;

            }


            .molas-values-section
            .line-reveal {

                display: block;

                opacity: 0;

                transform:
                    translateY(12px);

                transition:
                    opacity 0.65s ease,
                    transform 0.65s ease;

            }


            .molas-values-section
            .line-reveal.is-visible {

                opacity: 1;

                transform:
                    translateY(0);

            }

        `;

        document.head.appendChild(style);


        /* =================================================
           WAIT
        ================================================= */

        function wait(milliseconds) {

            return new Promise(resolve => {

                setTimeout(
                    resolve,
                    milliseconds
                );

            });

        }


        /* =================================================
           CREATE REAL VISUAL LINES
        ================================================= */

        function createLines(element) {

            if (!element) {
                return [];
            }


            const text =
                element.textContent.trim();


            element.textContent = "";


            const words =
                text.split(/\s+/);


            const wordSpans = [];


            words.forEach(
                word => {

                    const span =
                        document.createElement(
                            "span"
                        );

                    span.textContent =
                        word;


                    span.style.display =
                        "inline";


                    element.appendChild(
                        span
                    );


                    element.appendChild(
                        document.createTextNode(
                            " "
                        )
                    );


                    wordSpans.push(
                        span
                    );

                }
            );


            /*
               Force browser layout.
            */

            element.offsetHeight;


            const lines = [];

            let currentLine = [];

            let currentTop = null;


            wordSpans.forEach(
                span => {

                    const top =
                        span.offsetTop;


                    if (
                        currentTop === null
                    ) {

                        currentTop =
                            top;

                    }


                    if (
                        top !== currentTop
                    ) {

                        if (
                            currentLine.length
                        ) {

                            lines.push(
                                currentLine
                            );

                        }


                        currentLine = [];

                        currentTop =
                            top;

                    }


                    currentLine.push(
                        span
                    );

                }
            );


            if (
                currentLine.length
            ) {

                lines.push(
                    currentLine
                );

            }


            /*
               Replace temporary words
               with line elements.
            */

            element.textContent = "";


            const lineElements = [];


            lines.forEach(
                lineWords => {

                    const line =
                        document.createElement(
                            "span"
                        );

                    line.className =
                        "line-reveal";


                    line.textContent =
                        lineWords
                            .map(
                                word =>
                                    word.textContent
                            )
                            .join(" ");


                    element.appendChild(
                        line
                    );


                    lineElements.push(
                        line
                    );

                }
            );


            return lineElements;
        }


        /* =================================================
           REVEAL LINES
        ================================================= */

        async function revealLines(
            lines,
            delay = 220
        ) {

            for (
                const line of lines
            ) {

                line.classList.add(
                    "is-visible"
                );


                await wait(
                    delay
                );

            }

        }


        /* =================================================
           PREPARE ALL TEXT
        ================================================= */

        const animatedParts = [];


        function prepareCard(
            card,
            selectors
        ) {

            selectors.forEach(
                selector => {

                    const element =
                        card.querySelector(
                            selector
                        );


                    if (!element) {
                        return;
                    }


                    const originalText =
                        element.textContent.trim();


                    const lines =
                        createLines(
                            element
                        );


                    animatedParts.push({
                        element,
                        originalText,
                        lines
                    });

                }
            );

        }


        prepareCard(
            vision,
            [
                "h3",
                "p"
            ]
        );


        prepareCard(
            mission,
            [
                "h3",
                "p"
            ]
        );


        coreValues.forEach(
            card => {

                prepareCard(
                    card,
                    [
                        "h4",
                        "p"
                    ]
                );

            }
        );


        /* =================================================
           CARD HELPERS
        ================================================= */

        function activateCard(card) {

            card.classList.add(
                "value-animation-card"
            );

            card.classList.add(
                "is-active"
            );

        }


        function hideCard(card) {

            card.classList.remove(
                "is-active"
            );

        }


        /* =================================================
           RESET EVERYTHING
        ================================================= */

        function resetAnimation() {

            animatedParts.forEach(
                part => {

                    part.lines.forEach(
                        line => {

                            line.classList.remove(
                                "is-visible"
                            );

                        }
                    );

                }
            );


            hideCard(
                vision
            );

            hideCard(
                mission
            );


            coreValues.forEach(
                card => {

                    hideCard(
                        card
                    );

                }
            );

        }


        /* =================================================
           REVEAL ONE CARD
        ================================================= */

        async function revealCard(
            card,
            delayBetweenLines = 220
        ) {

            activateCard(
                card
            );


            const parts =
                animatedParts.filter(
                    part =>
                        card.contains(
                            part.element
                        )
                );


            /*
               Small pause before
               the text begins.
            */

            await wait(
                450
            );


            for (
                const part of parts
            ) {

                await revealLines(
                    part.lines,
                    delayBetweenLines
                );


                await wait(
                    300
                );

            }

        }


        /* =================================================
           INITIAL STATE
        ================================================= */

        vision.classList.add(
            "value-animation-card"
        );

        mission.classList.add(
            "value-animation-card"
        );


        coreValues.forEach(
            card => {

                card.classList.add(
                    "value-animation-card"
                );

            }
        );


        resetAnimation();


        /* =================================================
           CONTINUOUS SEQUENCE
        ================================================= */

        async function runValuesAnimation() {

            while (true) {

                /* -----------------------------------------
                   START
                ----------------------------------------- */

                resetAnimation();


                await wait(
                    1000
                );


                /* -----------------------------------------
                   VISION
                   STAYS VISIBLE
                ----------------------------------------- */

                await revealCard(
                    vision,
                    200
                );


                await wait(
                    700
                );


                /* -----------------------------------------
                   MISSION
                   VISION STAYS
                ----------------------------------------- */

                await revealCard(
                    mission,
                    200
                );


                await wait(
                    700
                );


                /* -----------------------------------------
                   CORE VALUES
                   EVERYTHING STAYS
                ----------------------------------------- */

                for (
                    const card of coreValues
                ) {

                    await revealCard(
                        card,
                        180
                    );


                    await wait(
                        450
                    );

                }


                /* -----------------------------------------
                   EVERYTHING IS NOW VISIBLE
                ----------------------------------------- */

                await wait(
                    15000
                );


                /* -----------------------------------------
                   ONE FULL RESET
                ----------------------------------------- */

                resetAnimation();


                await wait(
                    1200
                );

            }

        }


        runValuesAnimation();

    }


    /* =====================================================
       INITIALISE
    ===================================================== */

    loadGallery();

    loadProgrammes();

    setupMap();

    setupValuesAnimation();

});