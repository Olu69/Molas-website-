document.addEventListener("DOMContentLoaded", async () => {

    const SUPABASE_URL =
        "https://eidnzebqyxcpxbykybch.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";

    const loading =
        document.getElementById("admissionLoading");

    const errorBox =
        document.getElementById("admissionError");

    const article =
        document.getElementById("admissionArticle");

    const params =
        new URLSearchParams(window.location.search);

    const admissionId =
        params.get("id");

    if (!admissionId) {
        showError("No admission ID was found in the URL.");
        return;
    }

    try {

        const { createClient } =
            await import(
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
            );

        const supabase =
            createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log(
            "Looking for admission ID:",
            admissionId
        );

        
const {
    data,
    error
} = await supabase
    .from("admission_alerts")
    .select("*")
    .eq("id", Number(admissionId))
    .maybeSingle();
            
            
            

        console.log("Supabase data:", data);
        console.log("Supabase error:", error);

        if (error) {
            showError(
                "SUPABASE ERROR: " +
                error.message
            );
            return;
        }

        if (!data) {
            showError(
                "No admission record was found with ID: " +
                admissionId
            );
            return;
        }

        displayAdmission(data);

    } catch (err) {

        console.error(err);

        showError(
            "JAVASCRIPT ERROR: " +
            err.message
        );

    }


    function displayAdmission(data) {

        const image =
            document.getElementById("admissionImage");

        const status =
            document.getElementById("admissionStatus");

        const type =
            document.getElementById("admissionType");

        const university =
            document.getElementById("admissionUniversity");

        const title =
            document.getElementById("admissionTitle");

        const published =
            document.getElementById("admissionPublished");

        const deadline =
            document.getElementById("admissionDeadline");

        const excerpt =
            document.getElementById("admissionExcerpt");

        const content =
            document.getElementById("admissionContent");

        const source =
            document.getElementById("admissionSource");


        if (data.image_url) {

            image.innerHTML = `
                <img
                    src="${escapeHTML(data.image_url)}"
                    alt="${escapeHTML(data.title || "")}"
                >
            `;

        } else {

            image.innerHTML = `
                <div class="admission-image-placeholder">
                    🎓
                </div>
            `;

        }


        status.textContent =
            data.status || "";

        type.textContent =
            data.admission_type || "";

        university.textContent =
            data.university || "";

        title.textContent =
            data.title || "Admission Update";

        published.textContent =
            formatDate(
                data.published_at ||
                data.created_at
            );


        if (data.deadline) {

            deadline.innerHTML = `
                <strong>Application Deadline</strong>
                <span>
                    ${escapeHTML(data.deadline)}
                </span>
            `;

        } else {

            deadline.style.display = "none";

        }


        excerpt.textContent =
            data.excerpt || "";

        content.innerHTML =
            formatContent(
                data.content || ""
            );


        if (data.source_url) {

            source.innerHTML = `
                Source:
                <a
                    href="${escapeHTML(data.source_url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${escapeHTML(
                        data.source || "Original Source"
                    )}
                </a>
            `;

        } else {

            source.textContent =
                data.source
                    ? `Source: ${data.source}`
                    : "";

        }


        loading.hidden = true;
        errorBox.hidden = true;
        article.hidden = false;

        document.title =
            `${data.title || "Admission Update"} — MOLAS Education`;
    }

function formatContent(text) {
    
    if (!text) return "";
    
    return String(text).trim();
}


    function formatDate(value) {

        if (!value) return "";

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString(
            "en-NG",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
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


    function showError(message) {

        loading.hidden = true;

        article.hidden = true;

        errorBox.hidden = false;

        const paragraph =
            errorBox.querySelector("p");

        if (paragraph) {
            paragraph.textContent = message;
        } else {
            errorBox.innerHTML = `
                <div class="admission-error-icon">
                    ⚠️
                </div>

                <h1>
                    Admission Not Found
                </h1>

                <p>
                    ${escapeHTML(message)}
                </p>

                <a
                    href="index.html"
                    class="primary-button"
                >
                    ← Back to Home
                </a>
            `;
        }
    }

});