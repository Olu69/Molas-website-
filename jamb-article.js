/* =========================================================
   MOLAS — JAMB ARTICLE
   Loads one article from Supabase: jamb_news
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
    document.getElementById("article-loading");

const article =
    document.getElementById("jamb-article");

const errorBox =
    document.getElementById("article-error");

const title =
    document.getElementById("article-title");

const source =
    document.getElementById("article-source");

const date =
    document.getElementById("article-date");

const image =
    document.getElementById("article-image");

const content =
    document.getElementById("article-content");

const sourceBox =
    document.getElementById("article-source-box");

const sourceLink =
    document.getElementById("article-source-link");


/* =========================================================
   GET ARTICLE ID
========================================================= */

const params =
    new URLSearchParams(window.location.search);

const articleId =
    params.get("id");


/* =========================================================
   LOAD ARTICLE
========================================================= */

async function loadArticle() {
    
    if (!articleId) {
        showError();
        return;
    }
    
    
    try {
        
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/jamb_news?id=eq.${encodeURIComponent(articleId)}&status=eq.published&select=*`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );
        
        
        if (!response.ok) {
            throw new Error("Unable to load article.");
        }
        
        
        const articles =
            await response.json();
        
        
        if (
            !articles ||
            articles.length === 0
        ) {
            showError();
            return;
        }
        
        
        displayArticle(
            articles[0]
        );
        
        
    } catch (error) {
        
        console.error(
            "JAMB ARTICLE ERROR:",
            error
        );
        
        showError();
        
    }
    
}


/* =========================================================
   DISPLAY ARTICLE
========================================================= */

function displayArticle(data) {
    
    /* TITLE */
    
    title.textContent =
        data.title || "JAMB Update";
    
    
    /* SOURCE */
    
    source.textContent =
        data.source || "JAMB";
    
    
    /* DATE */
    
    date.textContent =
        formatDate(
            data.published_at ||
            data.created_at
        );
    
    
    /* IMAGE */
    
    image.src =
        data.image_url || "Molas.png";
    
    image.alt =
        data.title || "JAMB News";
    
    
    /* =====================================================
       ARTICLE CONTENT
    ===================================================== */
    
    /*
       The content column contains HTML.
       We therefore render it directly instead
       of escaping the HTML tags.
    */
    
    content.innerHTML =
        data.content ||
        data.excerpt ||
        "<p>No article content available.</p>";
    
    
    /* =====================================================
       ORIGINAL SOURCE
    ===================================================== */
    
    if (data.source_url) {
        
        sourceLink.href =
            data.source_url;
        
        sourceBox.hidden =
            false;
        
    } else {
        
        sourceBox.hidden =
            true;
        
    }
    
    
    /* =====================================================
       SHOW ARTICLE
    ===================================================== */
    
    loading.style.display =
        "none";
    
    errorBox.hidden =
        true;
    
    article.hidden =
        false;
    
    
    /* =====================================================
       PAGE TITLE
    ===================================================== */
    
    document.title =
        `${data.title || "JAMB News"} — MOLAS Educational Consults`;
    
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(dateString) {
    
    if (!dateString) {
        return "";
    }
    
    
    const date =
        new Date(dateString);
    
    
    if (isNaN(date.getTime())) {
        return "";
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


/* =========================================================
   SHOW ERROR
========================================================= */

function showError() {
    
    loading.style.display =
        "none";
    
    article.hidden =
        true;
    
    errorBox.hidden =
        false;
    
}


/* =========================================================
   START
========================================================= */

loadArticle();