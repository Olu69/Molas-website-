document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       MOLAS SUPABASE CONFIGURATION
    ===================================================== */

    const SUPABASE_URL =
        "https://eidnzebqyxcpxbykybch.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";


    /* =====================================================
       LOAD SUPABASE
    ===================================================== */

    let supabase = null;

    try {

        const { createClient } =
            await import(
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
            );

        supabase = createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        window.molasSupabase = supabase;

    } catch (error) {

        console.error(
            "MOLAS Supabase failed to load:",
            error
        );

    }


    /* =====================================================
       MOLAS ANIMATION + IMAGE STYLES
    ===================================================== */

    const style =
        document.createElement("style");

    style.textContent = `

        body {
            opacity: 0;
            transition: opacity .8s ease;
        }

        body.molas-ready {
            opacity: 1;
        }

        .brand {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: relative;
        }

        .brand-main {
            position: relative;
            display: inline-block;
            opacity: 0;
            transform: translateX(-40px) scale(.94);
            letter-spacing: 6px;
            animation:
                molasLogoIn
                1.4s
                cubic-bezier(.16,1,.3,1)
                .2s
                forwards;
        }

        .brand-sub {
            display: block;
            margin-top: -5px;
            opacity: 0;
            transform: translateY(8px);
            letter-spacing: .09em;
            animation:
                molasSubIn
                1s
                cubic-bezier(.16,1,.3,1)
                .9s
                forwards;
        }

        .brand::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -3px;
            width: 100%;
            height: 1.5px;
            background: var(--brown);
            transform: scaleX(0);
            transform-origin: left center;
            animation:
                molasLineIn
                1.2s
                cubic-bezier(.16,1,.3,1)
                1.3s
                forwards;
        }

        @keyframes molasLogoIn {

            0% {
                opacity: 0;
                transform:
                    translateX(-40px)
                    scale(.94);
                letter-spacing: 6px;
            }

            60% {
                opacity: 1;
                transform:
                    translateX(5px)
                    scale(1.02);
                letter-spacing: -1px;
            }

            100% {
                opacity: 1;
                transform:
                    translateX(0)
                    scale(1);
                letter-spacing: -1px;
            }

        }

        @keyframes molasSubIn {

            0% {
                opacity: 0;
                transform: translateY(8px);
            }

            100% {
                opacity: 1;
                transform: translateY(0);
            }

        }

        @keyframes molasLineIn {

            0% {
                transform: scaleX(0);
            }

            100% {
                transform: scaleX(1);
            }

        }

        .molas-reveal {
            opacity: 0;
            transform:
                translateY(70px)
                scale(.97);
            filter: blur(5px);
            transition:
                opacity 1.35s cubic-bezier(.16,1,.3,1),
                transform 1.35s cubic-bezier(.16,1,.3,1),
                filter 1.35s cubic-bezier(.16,1,.3,1);
            transition-delay:
                var(--molas-delay, 0ms);
            will-change:
                opacity,
                transform,
                filter;
        }

        .molas-reveal.molas-visible {
            opacity: 1;
            transform:
                translateY(0)
                scale(1);
            filter: blur(0);
        }

        .news-card,
        .university-card,
        .service-card {
            transition:
                transform .45s cubic-bezier(.16,1,.3,1),
                box-shadow .45s ease,
                border-color .35s ease;
        }

        .news-card:hover,
        .university-card:hover,
        .service-card:hover {
            transform: translateY(-6px);
            box-shadow:
                0 18px 40px
                rgba(50,35,25,.12);
        }

        .news-image {
            position: relative;
            overflow: hidden;
        }

        .news-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition:
                transform .6s
                cubic-bezier(.16,1,.3,1);
        }

        .news-card:hover
        .news-image img {
            transform: scale(1.05);
        }

        .news-image::after {
            content: "";
            position: absolute;
            inset: 0;
            background:
                linear-gradient(
                    135deg,
                    rgba(7,92,58,.25),
                    rgba(112,69,47,.18)
                );
            pointer-events: none;
        }

        .news-image span {
            position: absolute;
            z-index: 2;
        }

        .search-box {
            transition:
                transform .35s ease,
                box-shadow .35s ease,
                border-color .35s ease;
        }

        .search-box.search-active {
            transform: translateY(-3px);
            border-color: var(--brown);
            box-shadow:
                0 15px 35px
                rgba(50,35,25,.12);
        }

        .site-header {
            transition: box-shadow .4s ease;
        }

        .site-header.header-active {
            box-shadow:
                0 8px 28px
                rgba(40,30,20,.12);
        }

        .molas-top {
            position: fixed;
            right: 22px;
            bottom: 22px;
            width: 46px;
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 10px;
            background: var(--brown);
            color: #ffffff;
            font-size: 20px;
            line-height: 1;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transform: translateY(15px);
            transition:
                opacity .35s ease,
                visibility .35s ease,
                transform .35s ease,
                background-color .25s ease;
            z-index: 99999;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        }

        .molas-top.show {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateY(0);
        }

        .molas-top:hover {
            background: var(--brown);
            transform: translateY(-4px);
        }

        .molas-top:active {
            transform:
                translateY(-1px)
                scale(.96);
        }

        .molas-top:focus {
            outline: none;
        }

        .news-loading {
            padding: 40px 20px;
            text-align: center;
            color: var(--muted);
            font-size: 11px;
        }

        .news-error {
            padding: 30px 20px;
            text-align: center;
            color: var(--muted);
            font-size: 11px;
        }

        #resource-deck.is-dragging {
            cursor: grabbing;
        }

        #resource-deck {
            touch-action: pan-y;
        }

        .resource-card {
            will-change:
                transform,
                opacity;
            transition:
                transform .65s cubic-bezier(.16,1,.3,1),
                opacity .55s ease;
        }

        #resource-deck.is-dragging
        .resource-card {
            transition: none;
        }

        @media (max-width: 640px) {

            .molas-top {
                right: 16px;
                bottom:
                    calc(
                        16px +
                        env(safe-area-inset-bottom)
                    );
                width: 42px;
                height: 42px;
                border-radius: 10px;
                font-size: 18px;
            }

        }

    `;

    document.head.appendChild(style);


    /* =====================================================
       PAGE READY
    ===================================================== */

    requestAnimationFrame(() => {

        document.body.classList.add(
            "molas-ready"
        );

    });


    /* =====================================================
       NEWS
    ===================================================== */

    const newsFeed =
        document.querySelector(".news-feed");

    let allNews = [];


    /* =====================================================
       DATE FORMAT
    ===================================================== */

    function formatDate(dateValue) {

        if (!dateValue) {
            return "";
        }

        const date =
            new Date(dateValue);

        if (isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString(
            "en-NG",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       CREATE NEWS CARD
    ===================================================== */

    function createNewsCard(article) {

        const articleElement =
            document.createElement("article");

        articleElement.className =
            "news-card";

        articleElement.dataset.newsId =
            article.id;

        const title =
            escapeHTML(article.title);

        const excerpt =
            escapeHTML(
                article.excerpt ||
                article.content ||
                ""
            );

        const category =
            escapeHTML(
                article.category ||
                "NEWS"
            );

        const source =
            escapeHTML(
                article.source ||
                "MOLAS"
            );

        const date =
            formatDate(
                article.published_at ||
                article.created_at
            );

        const image =
            article.image_url
                ? String(article.image_url).trim()
                : "";

        const imageHTML =
            image
                ? `
                    <div class="news-image">
                        <img
                            src="${escapeHTML(image)}"
                            alt="${title}"
                            loading="lazy"
                            onerror="
                                this.style.display='none';
                            "
                        >
                    </div>
                `
                : `
                    <div class="news-image">
                        <span>
                            ${category}
                        </span>
                    </div>
                `;

        articleElement.innerHTML = `

            ${imageHTML}

            <div class="news-content">

                <div class="news-meta">

                    <span>
                        ${source}
                    </span>

                    <time>
                        ${date}
                    </time>

                </div>

                <h3>
                    ${title}
                </h3>

                <p>
                    ${excerpt}
                </p>

                <a
                    href="article.html?id=${encodeURIComponent(article.id)}"
                    class="read-more"
                    data-news-id="${escapeHTML(article.id)}"
                >
                    Read More →
                </a>

            </div>

        `;

        return articleElement;

    }


    /* =====================================================
       DISPLAY NEWS
    ===================================================== */

    function displayNews(news) {

        if (!newsFeed) return;

        newsFeed.innerHTML = "";

        if (!news.length) {

            newsFeed.innerHTML = `
                <div class="news-loading">
                    No news available yet.
                </div>
            `;

            return;
        }

        const newsTrack =
            document.createElement("div");

        newsTrack.className =
            "news-track";

        news.slice(0, 10).forEach(article => {

            newsTrack.appendChild(
                createNewsCard(article)
            );

        });

        newsFeed.appendChild(
            newsTrack
        );

        const newsRest =
            document.createElement("div");

        newsRest.className =
            "news-rest";

        news.slice(10, 12).forEach(article => {

            newsRest.appendChild(
                createNewsCard(article)
            );

        });

        if (newsRest.children.length) {

            newsFeed.appendChild(
                newsRest
            );

        }

        setupRevealAnimations();

    }


    /* =====================================================
       LOAD NEWS
    ===================================================== */

    async function loadNews() {

        if (
            !supabase ||
            !newsFeed
        ) {
            return;
        }

        newsFeed.innerHTML = `
            <div class="news-loading">
                Loading latest news...
            </div>
        `;

        try {

            const {
                data,
                error
            } = await supabase
                .from("news")
                .select(`
                    id,
                    created_at,
                    title,
                    excerpt,
                    content,
                    category,
                    image_url,
                    source,
                    source_url,
                    published_at,
                    featured,
                    breaking,
                    status
                `)
                .order(
                    "published_at",
                    {
                        ascending: false,
                        nullsFirst: false
                    }
                );

            if (error) {
                throw error;
            }

            allNews =
                (data || [])
                .filter(article => {

                    const status =
                        String(
                            article.status || ""
                        ).toLowerCase();

                    return (
                        !status ||
                        status === "published"
                    );

                });

            displayNews(
                allNews.slice(0, 12)
            );

            setupBreakingNews(
                allNews
            );

        } catch (error) {

            console.error(
                "MOLAS NEWS ERROR:",
                error
            );

            newsFeed.innerHTML = `
                <div class="news-error">
                    Unable to load news right now.
                </div>
            `;

        }

    }


    /* =====================================================
       HOMEPAGE JAMB NEWS
    ===================================================== */

    const jambNewsGrid =
        document.querySelector(
            "#jamb-news-grid"
        );


    function createJambNewsCard(article) {

        const card =
            document.createElement("article");

        card.className =
            "jamb-news-card";

        const title =
            escapeHTML(article.title);

        const excerpt =
            escapeHTML(
                article.excerpt ||
                article.content ||
                ""
            );

        const date =
            formatDate(
                article.published_at ||
                article.created_at
            );

        const image =
            article.image_url
                ? String(article.image_url).trim()
                : "";

        card.innerHTML = `

            ${
                image
                    ? `
                        <div class="jamb-news-image">

                            <img
                                src="${escapeHTML(image)}"
                                alt="${title}"
                                loading="lazy"
                            >

                        </div>
                    `
                    : `
                        <div class="jamb-news-image"></div>
                    `
            }

            <div class="jamb-news-content">

                <div class="jamb-news-meta">

                    <time>
                        ${date}
                    </time>

                </div>

                <h3>
                    ${title}
                </h3>

                <p>
                    ${excerpt}
                </p>

                <a
                    href="jamb-news-article.html?id=${encodeURIComponent(article.id)}"
                    class="jamb-news-read"
                >
                    Read JAMB Update →
                </a>

            </div>

        `;

        return card;

    }


    async function loadHomepageJambNews() {

        if (
            !supabase ||
            !jambNewsGrid
        ) {
            return;
        }

        jambNewsGrid.innerHTML = `
            <div class="jamb-news-loading">
                Loading latest JAMB updates...
            </div>
        `;

        try {

            const {
                data,
                error
            } = await supabase
                .from("jamb_news")
                .select(`
                    id,
                    created_at,
                    title,
                    excerpt,
                    content,
                    image_url,
                    source,
                    source_url,
                    published_at,
                    featured,
                    breaking,
                    status
                `)
                .order(
                    "published_at",
                    {
                        ascending: false,
                        nullsFirst: false
                    }
                )
                .limit(3);

            if (error) {
                throw error;
            }

            const jambNews =
                (data || [])
                .filter(article => {

                    const status =
                        String(
                            article.status || ""
                        ).toLowerCase();

                    return (
                        !status ||
                        status === "published"
                    );

                });

            if (!jambNews.length) {

                jambNewsGrid.innerHTML = `
                    <div class="jamb-news-loading">
                        No JAMB updates available yet.
                    </div>
                `;

                return;

            }

            jambNewsGrid.innerHTML = "";

            jambNews.forEach(article => {

                jambNewsGrid.appendChild(
                    createJambNewsCard(article)
                );

            });

            setupRevealAnimations();

        } catch (error) {

            console.error(
                "MOLAS HOMEPAGE JAMB NEWS ERROR:",
                error
            );

            jambNewsGrid.innerHTML = `
                <div class="jamb-news-loading">
                    Unable to load JAMB updates right now.
                </div>
            `;

        }

    }


    /* =====================================================
       BREAKING NEWS
    ===================================================== */

    function setupBreakingNews(news) {

        const ticker =
            document.querySelector(
                ".ticker-content"
            );

        if (!ticker) {
            return;
        }

        const breakingNews =
            news.filter(
                article =>
                    article.breaking === true
            );

        if (!breakingNews.length) {

            ticker.innerHTML = "";

            return;

        }

        ticker.innerHTML =
            breakingNews
                .slice(0, 8)
                .map(article => `
                    <span>
                        ${escapeHTML(
                            article.title
                        )}
                    </span>
                `)
                .join("");

    }


    /* =====================================================
       ADMISSION ALERTS
    ===================================================== */

    const admissionAlertsList =
        document.querySelector(
            "#admission-alerts-list"
        );


    async function loadAdmissionAlerts() {

        if (
            !supabase ||
            !admissionAlertsList
        ) {
            return;
        }

        admissionAlertsList.innerHTML = `
            <div class="news-loading">
                Loading admission alerts...
            </div>
        `;

        try {

            const {
                data,
                error
            } = await supabase
                .from("admission_alerts")
                .select(`
                    id,
                    title,
                    university,
                    admission_type,
                    status,
                    deadline,
                    excerpt,
                    image_url,
                    source,
                    source_url,
                    published_at,
                    featured
                `)
                .order(
                    "published_at",
                    {
                        ascending: false,
                        nullsFirst: false
                    }
                )
                .limit(2);

            if (error) {
                throw error;
            }

            if (
                !data ||
                !data.length
            ) {

                admissionAlertsList.innerHTML = `
                    <div class="news-loading">
                        No admission alerts available.
                    </div>
                `;

                return;

            }

            admissionAlertsList.innerHTML = "";

            data.forEach(
                (alert, index) => {

                    const item =
                        document.createElement(
                            "div"
                        );

                    item.className =
                        "admission-alert-item";

                    item.innerHTML = `

                        <a
                            href="admission.html?id=${encodeURIComponent(alert.id)}"
                            class="admission-alert-link"
                        >

                            <span class="alert-number">
                                ${index + 1}.
                            </span>

                            <span class="alert-info">

                                <strong>
                                    ${escapeHTML(
                                        alert.title
                                    )}
                                </strong>

                            </span>

                        </a>

                    `;

                    admissionAlertsList.appendChild(
                        item
                    );

                }
            );

        } catch (error) {

            console.error(
                "MOLAS ADMISSION ALERT ERROR:",
                error
            );

            admissionAlertsList.innerHTML = `
                <div class="news-error">
                    Unable to load admission alerts.
                </div>
            `;

        }

    }


    /* =====================================================
       ADMISSION STATUS
    ===================================================== */

    const admissionStatusBox =
        document.querySelector(
            ".status-box"
        );


    async function loadAdmissionStatus() {

        if (
            !supabase ||
            !admissionStatusBox
        ) {
            return;
        }

        try {

            const {
                data,
                error
            } = await supabase
                .from("admission_status")
                .select(`
                    id,
                    ongoing_text,
                    lists_text,
                    deadline_text,
                    updated_at
                `)
                .order(
                    "updated_at",
                    {
                        ascending: false
                    }
                )
                .limit(1)
                .maybeSingle();

            if (error) {

                admissionStatusBox.innerHTML = `
                    <div style="
                        padding:20px;
                        font-size:13px;
                        color:#111;
                    ">
                        Supabase error:<br>
                        ${escapeHTML(error.message)}
                    </div>
                `;

                return;
            }

            if (!data) {

                admissionStatusBox.innerHTML = `
                    <div style="
                        padding:20px;
                        font-size:13px;
                        color:#111;
                    ">
                        No admission status record found.
                    </div>
                `;

                return;
            }

            const statusTexts =
                admissionStatusBox.querySelectorAll(
                    ".status-text"
                );

            if (statusTexts[0]) {

                statusTexts[0].textContent =
                    data.ongoing_text || "";

            }

            if (statusTexts[1]) {

                statusTexts[1].textContent =
                    data.lists_text || "";

            }

            if (statusTexts[2]) {

                statusTexts[2].textContent =
                    data.deadline_text || "";

            }

        } catch (error) {

            console.error(
                "MOLAS ADMISSION STATUS ERROR:",
                error
            );

        }

    }


    /* =====================================================
       REVEAL ANIMATIONS
    ===================================================== */

    function setupRevealAnimations() {

        const revealTargets =
            document.querySelectorAll(

                ".news-card, " +
                ".university-card, " +
                ".service-card, " +
                ".trending-box, " +
                ".status-box, " +
                ".section-heading, " +
                ".centered"

            );

        revealTargets.forEach(
            (element, index) => {

                if (
                    element.classList.contains(
                        "molas-visible"
                    )
                ) {
                    return;
                }

                element.classList.add(
                    "molas-reveal"
                );

                const delay =
                    (index % 4) * 180;

                element.style.setProperty(
                    "--molas-delay",
                    `${delay}ms`
                );

            }
        );

        if (
            "IntersectionObserver"
            in window
        ) {

            const observer =
                new IntersectionObserver(

                    entries => {

                        entries.forEach(
                            entry => {

                                if (
                                    entry.isIntersecting
                                ) {

                                    entry.target
                                        .classList
                                        .add(
                                            "molas-visible"
                                        );

                                    observer.unobserve(
                                        entry.target
                                    );

                                }

                            }
                        );

                    },
                    {
                        threshold: .08,
                        rootMargin:
                            "0px 0px -60px 0px"
                    }
                );

            revealTargets.forEach(
                element => {

                    if (
                        !element.classList.contains(
                            "molas-visible"
                        )
                    ) {

                        observer.observe(
                            element
                        );

                    }

                }
            );

        } else {

            revealTargets.forEach(
                element => {

                    element.classList.add(
                        "molas-visible"
                    );

                }
            );

        }

    }


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    const menuButton =
        document.querySelector(
            ".mobile-menu-btn"
        );

    const mainNav =
        document.querySelector(
            ".main-nav"
        );

    const navDropdowns =
        document.querySelectorAll(
            ".nav-dropdown"
        );


    function closeMobileNav() {

        if (!mainNav) {
            return;
        }

        mainNav.classList.remove(
            "show"
        );

        navDropdowns.forEach(
            dropdown => {

                dropdown.classList.remove(
                    "open"
                );

            }
        );

    }


    if (
        menuButton &&
        mainNav
    ) {

        menuButton.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                const isOpen =
                    mainNav.classList.contains(
                        "show"
                    );

                if (isOpen) {

                    closeMobileNav();

                } else {

                    mainNav.classList.add(
                        "show"
                    );

                }

            }
        );


        mainNav
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    event => {

                        const parentDropdown =
                            link.closest(
                                ".nav-dropdown"
                            );

                        const isDropdownTrigger =
                            parentDropdown &&
                            parentDropdown
                                .querySelector(
                                    ":scope > a"
                                ) === link;

                        if (
                            isDropdownTrigger &&
                            window.innerWidth <= 800
                        ) {

                            return;

                        }

                        if (
                            window.innerWidth <= 800
                        ) {

                            closeMobileNav();

                        }

                    }
                );

            });


        mainNav
            .querySelectorAll("button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        if (
                            window.innerWidth <= 800
                        ) {

                            closeMobileNav();

                        }

                    }
                );

            });


        document.addEventListener(
            "click",
            event => {

                if (
                    window.innerWidth > 800
                ) {
                    return;
                }

                if (
                    mainNav.contains(
                        event.target
                    )
                ) {
                    return;
                }

                if (
                    menuButton.contains(
                        event.target
                    )
                ) {
                    return;
                }

                closeMobileNav();

            }
        );


        window.addEventListener(
            "scroll",
            () => {

                if (
                    window.innerWidth <= 800
                ) {

                    closeMobileNav();

                }

            },
            {
                passive: true
            }
        );


        navDropdowns.forEach(
            dropdown => {

                const trigger =
                    dropdown.querySelector(
                        ":scope > a"
                    );

                if (!trigger) {
                    return;
                }

                trigger.addEventListener(
                    "click",
                    event => {

                        if (
                            window.innerWidth > 800
                        ) {
                            return;
                        }

                        event.preventDefault();
                        event.stopPropagation();

                        navDropdowns.forEach(
                            other => {

                                if (
                                    other !== dropdown
                                ) {

                                    other.classList.remove(
                                        "open"
                                    );

                                }

                            }
                        );

                        dropdown.classList.toggle(
                            "open"
                        );

                    }
                );


                dropdown
                    .querySelectorAll(
                        ".dropdown-menu a"
                    )
                    .forEach(
                        link => {

                            link.addEventListener(
                                "click",
                                () => {

                                    if (
                                        window.innerWidth <= 800
                                    ) {

                                        closeMobileNav();

                                    }

                                }
                            );

                        }
                    );

            }
        );

    }


    /* =====================================================
       ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeMobileNav();

            }

        }
    );


    /* =====================================================
       SEARCH
    ===================================================== */

    const searchBox =
        document.querySelector(
            ".search-box"
        );

    if (searchBox) {

        const input =
            searchBox.querySelector(
                "input"
            );

        const button =
            searchBox.querySelector(
                "button"
            );

        if (input) {

            input.addEventListener(
                "focus",
                () => {

                    searchBox.classList.add(
                        "search-active"
                    );

                }
            );

            input.addEventListener(
                "blur",
                () => {

                    searchBox.classList.remove(
                        "search-active"
                    );

                }
            );

        }


        function performSearch() {

            if (!input) {
                return;
            }

            const query =
                input.value
                    .trim()
                    .toLowerCase();

            if (!query) {

                displayNews(
                    allNews
                );

                return;

            }

            const results =
                allNews.filter(
                    article => {

                        const searchableText =
                            [
                                article.title,
                                article.excerpt,
                                article.content,
                                article.category,
                                article.source
                            ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();

                        return searchableText
                            .includes(query);

                    }
                );

            displayNews(
                results
            );

            if (
                results.length &&
                newsFeed
            ) {

                const firstCard =
                    newsFeed.querySelector(
                        ".news-card"
                    );

                if (firstCard) {

                    firstCard.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }

            }

        }


        searchBox.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                performSearch();

            }
        );


        if (button) {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    performSearch();

                }
            );

        }


        if (input) {

            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        performSearch();

                    }

                }
            );

        }

    }


    /* =====================================================
       QUICK FILTERS
    ===================================================== */

    const quickFilterButtons =
        document.querySelectorAll(
            ".quick-filters button"
        );


    quickFilterButtons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                quickFilterButtons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });

                button.classList.add(
                    "active"
                );

                const filter =
                    button.dataset.filter ||
                    button.textContent
                        .trim()
                        .toLowerCase();


                if (
                    filter === "JAMB" ||
                    filter.toLowerCase() === "jamb utme"
                ) {

                    displayNews(
                        allNews.filter(article => {

                            const category =
                                String(
                                    article.category || ""
                                ).toLowerCase();

                            return (
                                category.includes("jamb") ||
                                category.includes("utme")
                            );

                        })
                    );

                    return;

                }


                if (
                    filter === "POST-UTME" ||
                    filter.toLowerCase() === "post-utme"
                ) {

                    displayNews(
                        allNews.filter(article => {

                            const category =
                                String(
                                    article.category || ""
                                ).toLowerCase();

                            const text =
                                [
                                    article.title,
                                    article.excerpt,
                                    article.content
                                ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();

                            return (
                                category.includes("post-utme") ||
                                category.includes("post utme") ||
                                text.includes("post-utme") ||
                                text.includes("post utme")
                            );

                        })
                    );

                    return;

                }


                if (
                    filter === "WAEC-NECO" ||
                    filter.toLowerCase() === "waec / neco"
                ) {

                    displayNews(
                        allNews.filter(article => {

                            const category =
                                String(
                                    article.category || ""
                                ).toLowerCase();

                            const text =
                                [
                                    article.title,
                                    article.excerpt,
                                    article.content
                                ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();

                            return (
                                category.includes("waec") ||
                                category.includes("neco") ||
                                text.includes("waec") ||
                                text.includes("neco")
                            );

                        })
                    );

                    return;

                }


                if (
                    filter === "DIRECT-ENTRY" ||
                    filter.toLowerCase() === "direct entry"
                ) {

                    displayNews(
                        allNews.filter(article => {

                            const category =
                                String(
                                    article.category || ""
                                ).toLowerCase();

                            const text =
                                [
                                    article.title,
                                    article.excerpt,
                                    article.content
                                ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();

                            return (
                                category.includes("direct") ||
                                text.includes("direct entry")
                            );

                        })
                    );

                    return;

                }


                if (
                    filter === "ADMISSION-LIST" ||
                    filter.toLowerCase() === "admission lists"
                ) {

                    if (
                        !supabase ||
                        !newsFeed
                    ) {
                        return;
                    }

                    newsFeed.innerHTML = `
                        <div class="news-loading">
                            Loading admission lists...
                        </div>
                    `;

                    try {

                        const {
                            data,
                            error
                        } = await supabase
                            .from("admission_alerts")
                            .select(`
                                id,
                                title,
                                university,
                                admission_type,
                                status,
                                deadline,
                                excerpt,
                                image_url,
                                published_at,
                                created_at
                            `)
                            .ilike(
                                "admission_type",
                                "%list%"
                            )
                            .order(
                                "published_at",
                                {
                                    ascending: false,
                                    nullsFirst: false
                                }
                            );

                        if (error) {
                            throw error;
                        }

                        if (
                            !data ||
                            !data.length
                        ) {

                            newsFeed.innerHTML = `
                                <div class="news-loading">
                                    No admission lists available yet.
                                </div>
                            `;

                            return;

                        }

                        newsFeed.innerHTML = "";

                        data.forEach(admission => {

                            const card =
                                document.createElement(
                                    "article"
                                );

                            card.className =
                                "news-card";

                            card.innerHTML = `

                                ${
                                    admission.image_url
                                        ? `
                                            <div class="news-image">

                                                <img
                                                    src="${escapeHTML(
                                                        admission.image_url
                                                    )}"
                                                    alt="${escapeHTML(
                                                        admission.title
                                                    )}"
                                                    loading="lazy"
                                                >

                                                <span>
                                                    ADMISSION LIST
                                                </span>

                                            </div>
                                          `
                                        : `
                                            <div class="news-image">

                                                <span>
                                                    ADMISSION LIST
                                                </span>

                                            </div>
                                          `
                                }

                                <div class="news-content">

                                    <div class="news-meta">

                                        <span>
                                            ${escapeHTML(
                                                admission.university ||
                                                "University Admission"
                                            )}
                                        </span>

                                        <time>
                                            ${formatDate(
                                                admission.published_at ||
                                                admission.created_at
                                            )}
                                        </time>

                                    </div>

                                    <h3>
                                        ${escapeHTML(
                                            admission.title ||
                                            "Admission List Update"
                                        )}
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                            admission.excerpt ||
                                            "Latest admission list update."
                                        )}
                                    </p>

                                    <a
                                        href="admission.html?id=${encodeURIComponent(
                                            admission.id
                                        )}"
                                        class="read-more"
                                    >
                                        View Admission →
                                    </a>

                                </div>

                            `;

                            newsFeed.appendChild(
                                card
                            );

                        });

                        setupRevealAnimations();

                    } catch (error) {

                        console.error(
                            "MOLAS ADMISSION LIST FILTER ERROR:",
                            error
                        );

                        newsFeed.innerHTML = `
                            <div class="news-error">
                                Unable to load admission lists right now.
                            </div>
                        `;

                    }

                    return;

                }

            }
        );

    });


    /* =====================================================
       OPEN FULL NEWS ARTICLE
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const readMore =
                event.target.closest(
                    ".read-more"
                );

            if (readMore) {
                return;
            }

            const card =
                event.target.closest(
                    ".news-card"
                );

            if (!card) {
                return;
            }

            const id =
                card.dataset.newsId;

            if (!id) {
                return;
            }

            window.location.href =
                `article.html?id=${encodeURIComponent(id)}`;

        }
    );


    /* =====================================================
       HEADER SCROLL
    ===================================================== */

    const header =
        document.querySelector(
            ".site-header"
        );

    if (header) {

        window.addEventListener(
            "scroll",
            () => {

                header.classList.toggle(
                    "header-active",
                    window.scrollY > 30
                );

            },
            {
                passive: true
            }
        );

    }


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    let topButton =
        document.querySelector(
            ".molas-top"
        );

    if (!topButton) {

        topButton =
            document.createElement(
                "button"
            );

        topButton.className =
            "molas-top";

        topButton.type =
            "button";

        topButton.innerHTML =
            "↑";

        topButton.setAttribute(
            "aria-label",
            "Back to top"
        );

        topButton.setAttribute(
            "title",
            "Back to top"
        );

        document.body.appendChild(
            topButton
        );

    }


    function updateTopButton() {

        const scrollPosition =
            window.scrollY ||
            window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;

        if (
            scrollPosition > 350
        ) {

            topButton.classList.add(
                "show"
            );

        } else {

            topButton.classList.remove(
                "show"
            );

        }

    }


    window.addEventListener(
        "scroll",
        updateTopButton,
        {
            passive: true
        }
    );


    updateTopButton();


    topButton.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            try {

                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "smooth"
                });

            } catch (error) {

                window.scrollTo(
                    0,
                    0
                );

            }

        }
    );


    topButton.addEventListener(
        "touchend",
        event => {

            event.preventDefault();
            event.stopPropagation();

            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth"
            });

        },
        {
            passive: false
        }
    );


    /* =====================================================
       STUDENT RESOURCE DECK
    ===================================================== */

    const resourceDeck =
        document.querySelector(
            "#resource-deck"
        );

    const resourceCards =
        resourceDeck
            ? Array.from(
                resourceDeck.querySelectorAll(
                    ".resource-card"
                )
            )
            : [];

    const resourceDots =
        document.querySelectorAll(
            ".resource-dot"
        );

    const resourcePrev =
        document.querySelector(
            ".resource-prev"
        );

    const resourceNext =
        document.querySelector(
            ".resource-next"
        );

    let resourceIndex = 0;
    let resourceStartX = 0;
    let resourceStartY = 0;
    let resourceIsDragging = false;
    let resourceCurrentX = 0;


    if (
        resourceDeck &&
        resourceCards.length
    ) {

        function updateResourceDeck(
            newIndex
        ) {

            const total =
                resourceCards.length;

            resourceIndex =
                (
                    newIndex +
                    total
                ) % total;

            resourceCards.forEach(
                (card, index) => {

                    let position =
                        index -
                        resourceIndex;

                    if (
                        position >
                        total / 2
                    ) {

                        position -=
                            total;

                    }

                    if (
                        position <
                        -total / 2
                    ) {

                        position +=
                            total;

                    }

                    card.classList.remove(
                        "active",
                        "resource-prev-card",
                        "resource-next-card"
                    );


                    if (
                        position === 0
                    ) {

                        card.classList.add(
                            "active"
                        );

                        card.style.zIndex =
                            "10";

                        card.style.opacity =
                            "1";

                        card.style.pointerEvents =
                            "auto";

                        card.style.transform =
                            "translate3d(0,0,0) rotateY(0deg) scale(1)";

                    }

                    else if (
                        position === 1
                    ) {

                        card.classList.add(
                            "resource-next-card"
                        );

                        card.style.zIndex =
                            "9";

                        card.style.opacity =
                            ".95";

                        card.style.pointerEvents =
                            "none";

                        card.style.transform =
                            "translate3d(34px,18px,-30px) rotateY(-4deg) scale(.96)";

                    }

                    else if (
                        position === 2
                    ) {

                        card.style.zIndex =
                            "8";

                        card.style.opacity =
                            ".72";

                        card.style.pointerEvents =
                            "none";

                        card.style.transform =
                            "translate3d(62px,34px,-60px) rotateY(-7deg) scale(.92)";

                    }

                    else if (
                        position === -1
                    ) {

                        card.classList.add(
                            "resource-prev-card"
                        );

                        card.style.zIndex =
                            "7";

                        card.style.opacity =
                            "0";

                        card.style.pointerEvents =
                            "none";

                        card.style.transform =
                            "translate3d(-80px,20px,-50px) rotateY(8deg) scale(.94)";

                    }

                    else {

                        card.style.zIndex =
                            "1";

                        card.style.opacity =
                            "0";

                        card.style.pointerEvents =
                            "none";

                        card.style.transform =
                            "translate3d(0,50px,-100px) scale(.88)";

                    }

                }
            );


            resourceDots.forEach(
                (dot, index) => {

                    const active =
                        index ===
                        resourceIndex;

                    dot.classList.toggle(
                        "active",
                        active
                    );

                    dot.setAttribute(
                        "aria-selected",
                        active
                            ? "true"
                            : "false"
                    );

                }
            );

        }


        function nextResource() {

            updateResourceDeck(
                resourceIndex + 1
            );

        }


        function previousResource() {

            updateResourceDeck(
                resourceIndex - 1
            );

        }


        if (resourceNext) {

            resourceNext.addEventListener(
                "click",
                nextResource
            );

        }


        if (resourcePrev) {

            resourcePrev.addEventListener(
                "click",
                previousResource
            );

        }


        resourceDots.forEach(
            (dot, index) => {

                dot.addEventListener(
                    "click",
                    () => {

                        updateResourceDeck(
                            index
                        );

                    }
                );

            }
        );


        let resourceSwipeDirection =
            null;


        resourceDeck.addEventListener(
            "touchstart",
            event => {

                if (
                    !event.touches ||
                    !event.touches.length
                ) {
                    return;
                }

                resourceStartX =
                    event.touches[0].clientX;

                resourceStartY =
                    event.touches[0].clientY;

                resourceCurrentX =
                    resourceStartX;

                resourceSwipeDirection =
                    null;

                resourceIsDragging =
                    false;

            },
            {
                passive: true
            }
        );


        resourceDeck.addEventListener(
            "touchmove",
            event => {

                if (
                    !event.touches ||
                    !event.touches.length
                ) {
                    return;
                }

                const currentX =
                    event.touches[0].clientX;

                const currentY =
                    event.touches[0].clientY;

                const deltaX =
                    currentX -
                    resourceStartX;

                const deltaY =
                    currentY -
                    resourceStartY;

                if (
                    !resourceSwipeDirection &&
                    (
                        Math.abs(deltaX) > 10 ||
                        Math.abs(deltaY) > 10
                    )
                ) {

                    if (
                        Math.abs(deltaY) >
                        Math.abs(deltaX)
                    ) {

                        resourceSwipeDirection =
                            "vertical";

                        resourceIsDragging =
                            false;

                        return;

                    }

                    resourceSwipeDirection =
                        "horizontal";

                    resourceIsDragging =
                        true;

                    resourceDeck.classList.add(
                        "is-dragging"
                    );

                }

                if (
                    resourceSwipeDirection !==
                    "horizontal"
                ) {
                    return;
                }

                resourceCurrentX =
                    currentX;

                const activeCard =
                    resourceCards[
                        resourceIndex
                    ];

                if (activeCard) {

                    const rotate =
                        deltaX * .035;

                    const moveY =
                        Math.abs(deltaX) * .02;

                    activeCard.style.transform =
                        `
                        translate3d(
                            ${deltaX}px,
                            ${moveY}px,
                            0
                        )
                        rotateY(${rotate}deg)
                        scale(1)
                        `;

                }

            },
            {
                passive: true
            }
        );


        resourceDeck.addEventListener(
            "touchend",
            () => {

                if (
                    resourceSwipeDirection !==
                    "horizontal"
                ) {

                    resourceSwipeDirection =
                        null;

                    resourceIsDragging =
                        false;

                    return;

                }

                resourceIsDragging =
                    false;

                resourceDeck.classList.remove(
                    "is-dragging"
                );

                const deltaX =
                    resourceCurrentX -
                    resourceStartX;

                const threshold =
                    65;

                if (
                    deltaX < -threshold
                ) {

                    nextResource();

                }

                else if (
                    deltaX > threshold
                ) {

                    previousResource();

                }

                else {

                    updateResourceDeck(
                        resourceIndex
                    );

                }

                resourceSwipeDirection =
                    null;

            },
            {
                passive: true
            }
        );


        resourceDeck.addEventListener(
            "mousedown",
            event => {

                if (
                    event.target.closest("a") ||
                    event.target.closest("button")
                ) {
                    return;
                }

                resourceStartX =
                    event.clientX;

                resourceCurrentX =
                    resourceStartX;

                resourceIsDragging =
                    true;

                resourceDeck.classList.add(
                    "is-dragging"
                );

            }
        );


        window.addEventListener(
            "mousemove",
            event => {

                if (
                    !resourceIsDragging
                ) {
                    return;
                }

                resourceCurrentX =
                    event.clientX;

                const deltaX =
                    resourceCurrentX -
                    resourceStartX;

                const activeCard =
                    resourceCards[
                        resourceIndex
                    ];

                if (activeCard) {

                    const rotate =
                        deltaX * .025;

                    activeCard.style.transform =
                        `
                        translate3d(
                            ${deltaX}px,
                            0,
                            0
                        )
                        rotateY(${rotate}deg)
                        scale(1)
                        `;

                }

            }
        );


        window.addEventListener(
            "mouseup",
            () => {

                if (
                    !resourceIsDragging
                ) {
                    return;
                }

                resourceIsDragging =
                    false;

                resourceDeck.classList.remove(
                    "is-dragging"
                );

                const deltaX =
                    resourceCurrentX -
                    resourceStartX;

                const threshold =
                    80;

                if (
                    deltaX < -threshold
                ) {

                    nextResource();

                }

                else if (
                    deltaX > threshold
                ) {

                    previousResource();

                }

                else {

                    updateResourceDeck(
                        resourceIndex
                    );

                }

            }
        );


        resourceDeck.setAttribute(
            "tabindex",
            "0"
        );


        resourceDeck.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    nextResource();

                }

                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    previousResource();

                }

            }
        );


        updateResourceDeck(0);

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    await loadNews();

    await loadHomepageJambNews();

    await loadAdmissionAlerts();

    await loadAdmissionStatus();

    setupRevealAnimations();

});



/* =========================================================
   MOLAS LIVE HERO
   NEWS + JAMB NEWS + ADMISSION ALERTS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const track =
        document.getElementById(
            "hero-carousel-track"
        );

    const dotsBox =
        document.getElementById(
            "hero-carousel-dots"
        );

    const carousel =
        document.getElementById(
            "hero-carousel"
        );

    const prevBtn =
        document.querySelector(
            ".hero-prev"
        );

    const nextBtn =
        document.querySelector(
            ".hero-next"
        );

    if (
        !track ||
        !dotsBox ||
        !carousel
    ) {
        return;
    }


    const SUPABASE_URL =
        "https://eidnzebqyxcpxbykybch.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";


    let slides = [];
    let currentSlide = 0;
    let autoPlay = null;

    let touchStartX = 0;
    let touchEndX = 0;


    async function getTable(
        table,
        limit = 6
    ) {

        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/${table}` +
                    `?select=*` +
                    `&order=published_at.desc` +
                    `&limit=${limit}`,
                    {
                        headers: {
                            apikey: SUPABASE_KEY,
                            Authorization:
                                `Bearer ${SUPABASE_KEY}`
                        }
                    }
                );

            if (!response.ok) {

                console.warn(
                    `Hero could not load ${table}`
                );

                return [];

            }

            const data =
                await response.json();

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.warn(
                `Hero ${table} error:`,
                error
            );

            return [];

        }

    }


    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function cleanText(value) {

        if (!value) return "";

        return String(value)
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim();

    }


    function shorten(
        value,
        length = 150
    ) {

        const text =
            cleanText(value);

        if (
            text.length <= length
        ) {
            return text;
        }

        return text
            .substring(0, length)
            .trim() + "...";

    }


    function formatDate(value) {

        if (!value) return "";

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
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


    function makeNews(item) {

        return {

            id: item.id,

            source: "news",

            label:
                item.breaking
                    ? "Molas"
                    : "EDUCATION NEWS",

            date:
                item.published_at ||
                item.created_at,

            category:
                item.category ||
                "EDUCATION",

            title:
                item.title ||
                "Latest Education Update",

            excerpt:
                item.excerpt ||
                item.content ||
                "",

            image:
                item.image_url ||
                "",

            link:
                `article.html?id=${encodeURIComponent(
                    item.id
                )}`,

            priority:
                item.breaking ? 3 :
                item.featured ? 2 :
                1

        };

    }


    function makeJamb(item) {

        return {

            id: item.id,

            source: "jamb_news",

            label:
                item.breaking
                    ? "Molas"
                    : "JAMB UPDATE",

            date:
                item.published_at ||
                item.created_at,

            category:
                "JAMB / UTME",

            title:
                item.title ||
                "Latest JAMB Update",

            excerpt:
                item.excerpt ||
                item.content ||
                "",

            image:
                item.image_url ||
                "",

            link:
                `article.html?id=${encodeURIComponent(
                    item.id
                )}`,

            priority:
                item.breaking ? 3 :
                item.featured ? 2 :
                1

        };

    }


    function makeAdmission(item) {

        return {

            id: item.id,

            source:
                "admission_alerts",

            label:
                item.status ||
                "ADMISSION ALERT",

            date:
                item.published_at ||
                item.created_at,

            category:
                item.admission_type ||
                "ADMISSIONS",

            title:
                item.title ||
                "Admission Update",

            excerpt:
                item.excerpt ||
                item.content ||
                "",

            image:
                item.image_url ||
                "",

            link:
                `admission.html?id=${encodeURIComponent(
                    item.id
                )}`,

            priority:
                item.featured ? 2 : 1

        };

    }


    async function loadHero() {

        showLoading();

        const [
            news,
            jamb,
            admissions
        ] = await Promise.all([

            getTable("news"),

            getTable("jamb_news"),

            getTable("admission_alerts")

        ]);


        const newsItems =
            news.map(makeNews);

        const jambItems =
            jamb.map(makeJamb);

        const admissionItems =
            admissions.map(makeAdmission);


        slides = [];

        const maxLength =
            Math.max(
                newsItems.length,
                jambItems.length,
                admissionItems.length
            );


        for (
            let i = 0;
            i < maxLength;
            i++
        ) {

            if (newsItems[i]) {
                slides.push(
                    newsItems[i]
                );
            }

            if (jambItems[i]) {
                slides.push(
                    jambItems[i]
                );
            }

            if (admissionItems[i]) {
                slides.push(
                    admissionItems[i]
                );
            }

        }


        slides.sort(
            (a, b) => {

                if (
                    b.priority !==
                    a.priority
                ) {

                    return (
                        b.priority -
                        a.priority
                    );

                }

                const dateA =
                    new Date(a.date)
                        .getTime() || 0;

                const dateB =
                    new Date(b.date)
                        .getTime() || 0;

                return dateB - dateA;

            }
        );


        slides =
            slides.slice(0, 9);


        if (!slides.length) {

            showEmpty();

            return;

        }


        currentSlide = 0;

        renderSlides();

        startAutoPlay();

    }


    function renderSlides() {

        track.innerHTML = "";

        dotsBox.innerHTML = "";


        slides.forEach(
            (item, index) => {

                const slide =
                    document.createElement(
                        "div"
                    );

                slide.className =
                    "hero-slide";


                if (item.image) {

                    slide.style.backgroundImage =
                        `
                        linear-gradient(
                            90deg,
                            rgba(8,18,53,0.98) 0%,
                            rgba(8,18,53,0.92) 45%,
                            rgba(8,18,53,0.55) 100%
                        ),
                        url("${item.image}")
                        `;

                    slide.style.backgroundSize =
                        "cover";

                    slide.style.backgroundPosition =
                        "center";

                }


                slide.innerHTML = `

                    <div class="hero-slide-inner">

                        <div class="hero-slide-top">

                            <span class="hero-slide-category">

                                ${escapeHTML(
                                    item.label
                                )}

                            </span>

                        </div>


                        <div class="hero-slide-source">

                            ${escapeHTML(
                                item.category
                            )}

                        </div>


                        <h2>

                            ${escapeHTML(
                                cleanText(
                                    item.title
                                )
                            )}

                        </h2>


                        <p>

                            ${escapeHTML(
                                shorten(
                                    item.excerpt,
                                    155
                                )
                            )}

                        </p>


                        <a
                            href="${escapeHTML(
                                item.link
                            )}"
                            class="hero-slide-link"
                        >

                            Read Update →

                        </a>

                    </div>

                `;


                track.appendChild(
                    slide
                );


                const dot =
                    document.createElement(
                        "button"
                    );

                dot.type =
                    "button";

                dot.className =
                    "hero-carousel-dot" +
                    (
                        index === 0
                            ? " active"
                            : ""
                    );

                dot.setAttribute(
                    "aria-label",
                    `Go to update ${index + 1}`
                );


                dot.addEventListener(
                    "click",
                    () => {

                        goToSlide(index);

                        restartAutoPlay();

                    }
                );


                dotsBox.appendChild(
                    dot
                );

            }
        );


        updatePosition();

    }


    function updatePosition() {

        track.style.transform =
            `translateX(-${currentSlide * 100}%)`;

        const dots =
            dotsBox.querySelectorAll(
                ".hero-carousel-dot"
            );

        dots.forEach(
            (dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === currentSlide
                );

            }
        );

    }


    function goToSlide(index) {

        if (!slides.length) {
            return;
        }

        currentSlide =
            (
                index +
                slides.length
            ) %
            slides.length;

        updatePosition();

    }


    function nextSlide() {

        goToSlide(
            currentSlide + 1
        );

    }


    function previousSlide() {

        goToSlide(
            currentSlide - 1
        );

    }


    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            () => {

                nextSlide();

                restartAutoPlay();

            }
        );

    }


    if (prevBtn) {

        prevBtn.addEventListener(
            "click",
            () => {

                previousSlide();

                restartAutoPlay();

            }
        );

    }


    carousel.addEventListener(
        "touchstart",
        event => {

            touchStartX =
                event.changedTouches[0]
                    .screenX;

        },
        {
            passive: true
        }
    );


    carousel.addEventListener(
        "touchend",
        event => {

            touchEndX =
                event.changedTouches[0]
                    .screenX;

            const distance =
                touchEndX -
                touchStartX;

            if (
                Math.abs(distance) < 45
            ) {
                return;
            }

            if (
                distance < 0
            ) {

                nextSlide();

            } else {

                previousSlide();

            }

            restartAutoPlay();

        },
        {
            passive: true
        }
    );


    function startAutoPlay() {

        stopAutoPlay();

        if (
            slides.length <= 1
        ) {
            return;
        }

        autoPlay =
            setInterval(
                nextSlide,
                2000
            );

    }


    function stopAutoPlay() {

        if (autoPlay) {

            clearInterval(
                autoPlay
            );

            autoPlay = null;

        }

    }


    function restartAutoPlay() {

        startAutoPlay();

    }


    carousel.addEventListener(
        "mouseenter",
        stopAutoPlay
    );

    carousel.addEventListener(
        "mouseleave",
        startAutoPlay
    );


    function showLoading() {

        track.innerHTML = `

            <div class="hero-slide hero-slide-loading">

                <span class="hero-slide-category">
                    MOLAS
                </span>

                <h2>
                    Loading latest education updates...
                </h2>

                <p>
                    Bringing you the latest Nigerian
                    education and admission information.
                </p>

            </div>

        `;

        dotsBox.innerHTML = "";

    }


    function showEmpty() {

        track.innerHTML = `

            <div class="hero-slide hero-slide-loading">

                <span class="hero-slide-category">
                    MOLAS
                </span>

                <h2>
                    Latest education updates
                </h2>

                <p>
                    New education, JAMB and admission
                    updates will appear here.
                </p>

            </div>

        `;

        dotsBox.innerHTML = "";

    }


    loadHero();


    setInterval(
        loadHero,
        10 * 60 * 1000
    );

});



/* =========================================================
   MOLAS BROWSER NOTIFICATIONS
========================================================= */

const VAPID_PUBLIC_KEY =
    "BFnYM1_5qdPHOdO2RApZ1dhUNOaEhqlorzHfJ_UE-VFxKRwYf41M5S0f81DVibtaRjpZK1phGLKw0kclU4XpnUw";


function urlBase64ToUint8Array(
    base64String
) {

    const padding =
        "=".repeat(
            (4 - (base64String.length % 4)) % 4
        );

    const base64 =
        (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const rawData =
        window.atob(base64String);

    return Uint8Array.from(
        [...rawData].map(
            char => char.charCodeAt(0)
        )
    );

}


/* =========================================================
   WAIT FOR PAGE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const notificationButton =
            document.getElementById(
                "enable-notifications"
            );


        if (!notificationButton) {
            return;
        }


        notificationButton.addEventListener(
            "click",
            async () => {

                try {

                    /* =====================================
                       BROWSER CHECK
                    ===================================== */

                    if (
                        !("Notification" in window) ||
                        !("serviceWorker" in navigator) ||
                        !("PushManager" in window)
                    ) {

                        alert(
                            "Push notifications are not supported in this browser. Please open MOLAS in a supported browser."
                        );

                        return;

                    }


                    /* =====================================
                       SUPABASE CHECK
                    ===================================== */

                    if (
                        !window.molasSupabase
                    ) {

                        alert(
                            "MOLAS connection is not ready. Please refresh the page and try again."
                        );

                        return;

                    }


                    /* =====================================
                       REQUEST PERMISSION
                    ===================================== */

                    const permission =
                        await Notification.requestPermission();


                    if (
                        permission !== "granted"
                    ) {

                        notificationButton.textContent =
                            "Notifications not enabled";

                        return;

                    }


                    /* =====================================
                       SERVICE WORKER
                    ===================================== */

                    const registration =
                        await navigator.serviceWorker.register(
                            "/service-worker.js"
                        );


                    /* =====================================
                       GET EXISTING SUBSCRIPTION
                    ===================================== */

                    let subscription =
                        await registration.pushManager
                            .getSubscription();


                    /* =====================================
                       CREATE SUBSCRIPTION
                    ===================================== */

                    if (!subscription) {

                        subscription =
                            await registration.pushManager
                                .subscribe({

                                    userVisibleOnly:
                                        true,

                                    applicationServerKey:
                                        urlBase64ToUint8Array(
                                            VAPID_PUBLIC_KEY
                                        )

                                });

                    }


                    /* =====================================
                       SAVE SUBSCRIPTION
                    ===================================== */

                    const {
                        error
                    } =
                        await window.molasSupabase
                            .from(
                                "notification_subscribers"
                            )
                            .insert({

                                push_subscription:
                                    subscription.toJSON(),

                                push_enabled:
                                    true,

                                updated_at:
                                    new Date()
                                        .toISOString()

                            });


                    /* =====================================
                       DATABASE ERROR
                    ===================================== */

                    if (error) {

                        console.error(
                            "Notification subscription error:",
                            error
                        );

                        alert(
                            "Supabase notification error:\n\n" +
                            error.message
                        );

                        notificationButton.textContent =
                            "Try again";

                        return;

                    }


                    /* =====================================
                       SUCCESS
                    ===================================== */

                    notificationButton.textContent =
                        "Notifications enabled ✓";


                } catch (error) {

                    console.error(
                        "Browser notification error:",
                        error
                    );

                    alert(
                        "Notification error:\n\n" +
                        error.name +
                        "\n\n" +
                        error.message
                    );

                    notificationButton.textContent =
                        "Try again";

                }

            }
        );

    }
);


/* =========================================================
   TEMPORARY NOTIFICATION TEST
========================================================= */

async function testMolasNotification() {
    
    try {
        
        const response = await fetch(
            "https://eidnzebqyxcpxbykybch.supabase.co/functions/v1/send-notifications",
            {
                method: "POST",
                
                headers: {
                    "Content-Type": "application/json"
                },
                
                body: JSON.stringify({
                    title: "MOLAS Test Notification",
                    body: "If you received this, MOLAS notifications are working!",
                    url: "/"
                })
            }
        );
        
        const result =
            await response.json();
        
        console.log(
            "MOLAS notification test:",
            result
        );
        
        alert(
            JSON.stringify(
                result,
                null,
                2
            )
        );
        
    } catch (error) {
        
        console.error(
            "MOLAS notification test error:",
            error
        );
        
        alert(
            "Notification test error:\n\n" +
            error.message
        );
        
    }
    
}