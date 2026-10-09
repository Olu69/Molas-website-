/* =========================================================
   MOLAS ADMIN DASHBOARD
   Matched to the current admin.html
========================================================= */

const SUPABASE_URL =
    "https://eidnzebqyxcpxbykybch.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================================
   STATE
========================================================= */

let currentAdminUser = null;
let currentConversationId = null;
let currentConversationChannel = null;


/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", initAdmin);


async function initAdmin() {
    setupNavigation();
    setupMobileSidebar();
    setupProfileDropdown();
    setupLogout();
    setupQuickActions();
    setupNotifications();
    setupDetailButtons();
    setupSearch();
    setupMessages();
    setupPaymentRefresh();
    setupContentCards();

    setupStudentSearch();
    setupPaymentSearch();

    try {
        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.error("Session error:", error);
            redirectToLogin();
            return;
        }

        if (!session) {
            redirectToLogin();
            return;
        }

        const isAdmin = await verifyAdmin(session.user.id);

        if (!isAdmin) {
            await supabaseClient.auth.signOut();
            redirectToLogin();
            return;
        }

        currentAdminUser = session.user;

        displayAdminInformation(session.user);

        await Promise.allSettled([
            loadDashboard(),
            loadStudents(),
            loadPayments(),
            loadJambPayments(),
            loadConversations()
        ]);

        showSection("dashboard");

    } catch (error) {
        console.error(
            "Admin initialization error:",
            error
        );
    }
}


/* =========================================================
   LOGIN REDIRECT
========================================================= */

function redirectToLogin() {
    window.location.replace("admin-login.html");
}


/* =========================================================
   ADMIN VERIFICATION
========================================================= */

async function verifyAdmin(userId) {
    const { data, error } = await supabaseClient
        .from("chat_admins")
        .select("id, active")
        .eq("user_id", userId)
        .eq("active", true)
        .maybeSingle();

    if (error) {
        console.error(
            "Admin verification failed:",
            error
        );

        return false;
    }

    return !!data;
}


/* =========================================================
   ADMIN INFORMATION
========================================================= */

function displayAdminInformation(user) {
    const email = user?.email || "";

    const settingsEmail = document.getElementById(
        "molas-admin-settings-email"
    );

    const topEmail = document.getElementById(
        "molas-admin-user-email"
    );

    if (settingsEmail) {
        settingsEmail.textContent = email;
    }

    if (topEmail) {
        topEmail.textContent = email;
    }
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {
    document
        .querySelectorAll("[data-admin-section]")
        .forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();

                const section =
                    button.dataset.adminSection;

                if (!section) return;

                showSection(section);
                closeMobileSidebar();
            });
        });
}


function showSection(sectionName) {
    document
        .querySelectorAll(".molas-admin-section")
        .forEach(section => {
            const matches =
                section.dataset.section === sectionName;

            section.hidden = !matches;

            section.classList.toggle(
                "active",
                matches
            );
        });

    document
        .querySelectorAll("[data-admin-section]")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.adminSection === sectionName
            );
        });

    const pageTitle = document.getElementById(
        "molas-admin-page-title"
    );

    const titles = {
        dashboard: "Dashboard",
        students: "Students",
        payments: "Payments",
        jamb: "JAMB Access",
        content: "Content",
        messages: "Messages",
        settings: "Settings"
    };

    if (pageTitle) {
        pageTitle.textContent =
            titles[sectionName] || "Dashboard";
    }

    if (
        sectionName === "messages" &&
        !currentConversationId
    ) {
        showConversationList();
    }
}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function setupMobileSidebar() {
    const menuButton = document.getElementById(
        "molas-admin-menu-toggle"
    );

    const closeButton = document.getElementById(
        "molas-admin-sidebar-close"
    );

    const overlay = document.getElementById(
        "molas-admin-sidebar-overlay"
    );

    if (menuButton) {
        menuButton.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            const sidebar = document.getElementById(
                "molas-admin-sidebar"
            );

            if (
                sidebar &&
                sidebar.classList.contains("open")
            ) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", event => {
            event.preventDefault();
            closeMobileSidebar();
        });
    }

    if (overlay) {
        overlay.addEventListener("click", event => {
            event.preventDefault();
            closeMobileSidebar();
        });
    }

    document.addEventListener("click", event => {
        const sidebar = document.getElementById(
            "molas-admin-sidebar"
        );

        if (!sidebar) return;

        if (
            !sidebar.contains(event.target) &&
            !menuButton?.contains(event.target)
        ) {
            closeMobileSidebar();
        }
    });

    document.addEventListener(
        "scroll",
        closeMobileSidebar,
        { passive: true }
    );
}


function openMobileSidebar() {
    const sidebar = document.getElementById(
        "molas-admin-sidebar"
    );

    const overlay = document.getElementById(
        "molas-admin-sidebar-overlay"
    );

    if (sidebar) {
        sidebar.classList.add("open", "is-open");

        sidebar.style.transform =
            "translateX(0)";
    }

    if (overlay) {
        overlay.classList.add("open", "is-visible");

        overlay.style.display = "block";
    }

    document.body.classList.add(
        "admin-sidebar-open"
    );
}


function closeMobileSidebar() {
    const sidebar = document.getElementById(
        "molas-admin-sidebar"
    );

    const overlay = document.getElementById(
        "molas-admin-sidebar-overlay"
    );

    if (sidebar) {
        sidebar.classList.remove("open", "is-open");

        sidebar.style.transform = "";
    }

    if (overlay) {
        overlay.classList.remove("open", "is-visible");

        overlay.style.display = "";
    }

    document.body.classList.remove(
        "admin-sidebar-open"
    );
}


/* =========================================================
   PROFILE DROPDOWN
========================================================= */

function setupProfileDropdown() {
    const button = document.getElementById(
        "molas-admin-profile-button"
    );

    const dropdown = document.getElementById(
        "molas-admin-profile-dropdown"
    );

    if (!button || !dropdown) return;

    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        const isOpen =
            dropdown.classList.contains("open");

        dropdown.classList.toggle("open", !isOpen);
        dropdown.classList.toggle("is-open", !isOpen);

        dropdown.hidden = false;
    });

    document.addEventListener("click", event => {
        if (
            !dropdown.contains(event.target) &&
            !button.contains(event.target)
        ) {
            dropdown.classList.remove("open", "is-open");
        }
    });
}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {
    const ids = [
        "molas-admin-logout",
        "molas-admin-profile-logout",
        "molas-admin-settings-logout"
    ];

    ids.forEach(id => {
        const button = document.getElementById(id);

        if (!button) return;

        button.addEventListener("click", async event => {
            event.preventDefault();

            if (button.disabled) return;

            button.disabled = true;

            try {
                await supabaseClient.auth.signOut();
            } catch (error) {
                console.error("Logout error:", error);
            }

            redirectToLogin();
        });
    });
}


/* =========================================================
   QUICK ACTIONS
========================================================= */

function setupQuickActions() {
    document
        .querySelectorAll("[data-admin-section-target]")
        .forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();

                const target =
                    button.dataset.adminSectionTarget;

                if (!target) return;

                showSection(target);
            });
        });
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function setupNotifications() {
    const notificationButton = document.getElementById(
        "molas-admin-notification-button"
    );

    if (notificationButton) {
        notificationButton.addEventListener("click", event => {
            event.preventDefault();

            showSection("messages");

            const dot = document.getElementById(
                "molas-admin-notification-dot"
            );

            if (dot) {
                dot.style.display = "none";
            }
        });
    }

    const close = document.getElementById(
        "adminMessageNotificationClose"
    );

    if (close) {
        close.addEventListener("click", event => {
            event.preventDefault();

            const popup = document.getElementById(
                "adminMessageNotification"
            );

            if (popup) {
                popup.style.display = "none";

                popup.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }
        });
    }
}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {
    await Promise.allSettled([
        loadStudentCount(),
        loadPendingPaymentCount(),
        loadAccessCount(),
        loadMessageCount()
    ]);

    await loadRecentActivity();
}


async function loadStudentCount() {
    const element = document.getElementById(
        "molas-admin-total-students"
    );

    if (!element) return;

    const { count, error } = await supabaseClient
        .from("profiles")
        .select("id", {
            count: "exact",
            head: true
        });

    if (!error) {
        element.textContent = count || 0;
    }
}


async function loadPendingPaymentCount() {
    const element = document.getElementById(
        "molas-admin-total-pending"
    );

    if (!element) return;

    const { count, error } = await supabaseClient
        .from("jamb_payment_orders")
        .select("id", {
            count: "exact",
            head: true
        })
        .eq("status", "pending");

    if (!error) {
        element.textContent = count || 0;
    }
}


async function loadAccessCount() {
    const element = document.getElementById(
        "molas-admin-total-access"
    );

    if (!element) return;

    const { count, error } = await supabaseClient
        .from("profiles")
        .select("id", {
            count: "exact",
            head: true
        })
        .neq("jamb_access", "none");

    if (!error) {
        element.textContent = count || 0;
    }
}


async function loadMessageCount() {
    const element = document.getElementById(
        "molas-admin-total-messages"
    );

    const badge = document.getElementById(
        "molas-admin-message-badge"
    );

    const { count, error } = await supabaseClient
        .from("chat_conversations")
        .select("id", {
            count: "exact",
            head: true
        })
        .neq("status", "closed");

    if (error) {
        console.error(
            "Message count error:",
            error
        );

        return;
    }

    const total = count || 0;

    if (element) {
        element.textContent = total;
    }

    if (badge) {
        badge.textContent = total;

        badge.style.display =
            total > 0 ? "" : "none";
    }
}


async function loadRecentActivity() {
    const container = document.getElementById(
        "molas-admin-activity-list"
    );

    if (!container) return;

    const { data, error } = await supabaseClient
        .from("jamb_payment_orders")
        .select(
            "id, order_type, amount, status, created_at"
        )
        .order("created_at", {
            ascending: false
        })
        .limit(6);

    if (error) {
        console.error(
            "Recent activity error:",
            error
        );

        return;
    }

    if (!data || !data.length) return;

    container.innerHTML = data.map(order => `
        <div class="molas-admin-activity-item">
            <div>
                <strong>
                    Payment #${escapeHTML(order.id)}
                </strong>

                <span>
                    ${escapeHTML(
                        formatOrderType(order.order_type)
                    )}
                </span>
            </div>

            <div>
                <strong>
                    ₦${formatNumber(order.amount)}
                </strong>

                <small>
                    ${escapeHTML(
                        formatDate(order.created_at)
                    )}
                </small>
            </div>
        </div>
    `).join("");
}


/* =========================================================
   STUDENTS
========================================================= */

async function loadStudents() {
    const container = document.getElementById(
        "molas-admin-student-list"
    );

    if (!container) return;

    const { data, error } = await supabaseClient
        .from("profiles")
        .select(`
            id,
            full_name,
            email,
            role,
            jamb_access,
            waec_access,
            post_utme_access,
            created_at
        `)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Students:", error);

        container.innerHTML =
            "<p>Unable to load students.</p>";

        return;
    }

    if (!data || !data.length) {
        container.innerHTML =
            "<p>No students found.</p>";

        return;
    }

    container.innerHTML = data.map(student => `
        <div
            class="molas-admin-student-item"
            data-student-id="${escapeHTML(student.id)}"
            role="button"
            tabindex="0"
        >
            <div class="molas-admin-list-avatar">
                ${escapeHTML(
                    getInitials(student.full_name)
                )}
            </div>

            <div>
                <strong>
                    ${escapeHTML(
                        student.full_name ||
                        "Unnamed Student"
                    )}
                </strong>

                <span>
                    ${escapeHTML(student.email || "")}
                </span>
            </div>

            <span>
                ${escapeHTML(
                    student.jamb_access || "none"
                )}
            </span>
        </div>
    `).join("");

    container.onclick = async event => {
        const item = event.target.closest(
            "[data-student-id]"
        );

        if (!item) return;

        await openStudent(item.dataset.studentId);
    };
}


async function openStudent(studentId) {
    const list = document.getElementById(
        "molas-admin-student-list"
    );

    const detail = document.getElementById(
        "molas-admin-student-detail"
    );

    const content = document.getElementById(
        "molas-admin-student-detail-content"
    );

    if (!detail || !content) return;

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", studentId)
        .maybeSingle();

    if (error || !data) {
        content.innerHTML =
            "<p>Unable to load student.</p>";

        return;
    }

    if (list) {
        list.hidden = true;
    }

    detail.hidden = false;

    content.innerHTML = `
        <div class="molas-admin-detail-card">
            <div class="molas-admin-detail-avatar">
                ${escapeHTML(
                    getInitials(data.full_name)
                )}
            </div>

            <h3>
                ${escapeHTML(
                    data.full_name ||
                    "Unnamed Student"
                )}
            </h3>

            <p>
                ${escapeHTML(data.email || "")}
            </p>

            <div class="molas-admin-detail-grid">
                <div>
                    <span>Role</span>
                    <strong>
                        ${escapeHTML(data.role || "user")}
                    </strong>
                </div>

                <div>
                    <span>JAMB Access</span>
                    <strong>
                        ${escapeHTML(
                            data.jamb_access || "none"
                        )}
                    </strong>
                </div>

                <div>
                    <span>WAEC Access</span>
                    <strong>
                        ${escapeHTML(
                            data.waec_access || "none"
                        )}
                    </strong>
                </div>

                <div>
                    <span>Post-UTME Access</span>
                    <strong>
                        ${escapeHTML(
                            data.post_utme_access || "none"
                        )}
                    </strong>
                </div>

                <div>
                    <span>Joined</span>
                    <strong>
                        ${escapeHTML(
                            formatDate(data.created_at)
                        )}
                    </strong>
                </div>
            </div>
        </div>
    `;

    detail.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   STUDENT SEARCH
========================================================= */

function setupStudentSearch() {
    const input = document.getElementById(
        "molas-admin-student-search"
    );

    if (!input) return;

    input.addEventListener("input", event => {
        const value = event.target.value
            .trim()
            .toLowerCase();

        document
            .querySelectorAll(
                "#molas-admin-student-list [data-student-id]"
            )
            .forEach(item => {
                item.style.display =
                    !value ||
                    item.textContent.toLowerCase().includes(value)
                        ? ""
                        : "none";
            });
    });
}


/* =========================================================
   PAYMENTS
========================================================= */

async function loadPayments() {
    const container = document.getElementById(
        "molas-admin-payment-list"
    );

    if (!container) return;

    const { data, error } = await supabaseClient
        .from("jamb_payment_orders")
        .select(`
            id,
            user_id,
            order_type,
            amount,
            currency,
            payment_reference,
            receipt_url,
            status,
            submitted_at,
            created_at
        `)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Payments:", error);

        container.innerHTML =
            "<p>Unable to load payments.</p>";

        return;
    }

    if (!data || !data.length) {
        container.innerHTML =
            "<p>No payments found.</p>";

        return;
    }

    container.innerHTML = data.map(order => `
        <div
            class="molas-admin-payment-item"
            data-payment-id="${escapeHTML(order.id)}"
            role="button"
            tabindex="0"
        >
            <div>
                <strong>
                    Payment #${escapeHTML(order.id)}
                </strong>

                <span>
                    ${escapeHTML(
                        formatOrderType(order.order_type)
                    )}
                </span>
            </div>

            <div>
                <strong>
                    ₦${formatNumber(order.amount)}
                </strong>

                <span>
                    ${escapeHTML(
                        formatDate(order.created_at)
                    )}
                </span>
            </div>

            <span class="
                molas-admin-status-badge
                ${getStatusClass(order.status)}
            ">
                ${escapeHTML(
                    capitalize(order.status)
                )}
            </span>
        </div>
    `).join("");

    container.onclick = async event => {
        const item = event.target.closest(
            "[data-payment-id]"
        );

        if (!item) return;

        await openPayment(item.dataset.paymentId);
    };
}


async function openPayment(orderId) {
    const list = document.getElementById(
        "molas-admin-payment-list"
    );

    const detail = document.getElementById(
        "molas-admin-payment-detail"
    );

    const content = document.getElementById(
        "molas-admin-payment-detail-content"
    );

    if (!detail || !content) return;

    const { data, error } = await supabaseClient
        .from("jamb_payment_orders")
        .select(`
            *,
            jamb_payment_order_items (
                id,
                subject_id,
                quantity,
                unit_price
            )
        `)
        .eq("id", orderId)
        .maybeSingle();

    if (error || !data) {
        content.innerHTML =
            "<p>Unable to load payment.</p>";

        return;
    }

    if (list) {
        list.hidden = true;
    }

    detail.hidden = false;

    content.innerHTML = createPaymentDetailHTML(
        data,
        "Payment"
    );

    /*
     * FIX:
     * Load the receipt from Supabase Storage after
     * the preview markup has been inserted.
     */
    const receiptPreview = content.querySelector(
        ".molas-admin-receipt-preview"
    );

    if (receiptPreview) {
        await displayPaymentReceipt(
            content,
            receiptPreview.dataset.receiptPath
        );
    }

    setupPaymentDetailButtons(content, data.id);

    detail.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   JAMB PAYMENTS
========================================================= */

async function loadJambPayments() {
    const container = document.getElementById(
        "jamb-payment-list"
    );

    if (!container) return;

    const { data, error } = await supabaseClient
        .from("jamb_payment_orders")
        .select(`
            id,
            user_id,
            order_type,
            amount,
            currency,
            payment_reference,
            receipt_url,
            status,
            submitted_at,
            created_at
        `)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("JAMB payments:", error);

        container.innerHTML =
            "<p>Unable to load JAMB payments.</p>";

        return;
    }

    if (!data || !data.length) {
        container.innerHTML =
            "<p>No JAMB payment orders found.</p>";

        return;
    }

    container.innerHTML = data.map(order => `
        <div
            class="molas-admin-jamb-order-item"
            data-jamb-order-id="${escapeHTML(order.id)}"
            role="button"
            tabindex="0"
        >
            <div>
                <strong>
                    Order #${escapeHTML(order.id)}
                </strong>

                <span>
                    ${escapeHTML(
                        formatOrderType(order.order_type)
                    )}
                </span>
            </div>

            <div>
                <strong>
                    ₦${formatNumber(order.amount)}
                </strong>

                <span>
                    ${escapeHTML(
                        formatDate(order.created_at)
                    )}
                </span>
            </div>

            <span class="
                molas-admin-status-badge
                ${getStatusClass(order.status)}
            ">
                ${escapeHTML(
                    capitalize(order.status)
                )}
            </span>
        </div>
    `).join("");

    container.onclick = async event => {
        const item = event.target.closest(
            "[data-jamb-order-id]"
        );

        if (!item) return;

        await openJambOrder(item.dataset.jambOrderId);
    };
}


async function openJambOrder(orderId) {
    const list = document.getElementById(
        "jamb-payment-list"
    );

    const detail = document.getElementById(
        "molas-admin-jamb-detail"
    );

    const content = document.getElementById(
        "molas-admin-jamb-detail-content"
    );

    if (!detail || !content) return;

    const { data, error } = await supabaseClient
        .from("jamb_payment_orders")
        .select(`
            *,
            jamb_payment_order_items (
                id,
                subject_id,
                quantity,
                unit_price
            )
        `)
        .eq("id", orderId)
        .maybeSingle();

    if (error || !data) {
        content.innerHTML =
            "<p>Unable to load JAMB order.</p>";

        return;
    }

    if (list) {
        list.hidden = true;
    }

    detail.hidden = false;

    const items =
        data.jamb_payment_order_items || [];

    content.innerHTML = `
        <div class="molas-admin-detail-card">

            <h3>
                JAMB Order #${escapeHTML(data.id)}
            </h3>

            <div class="molas-admin-detail-grid">

                <div>
                    <span>Resource</span>
                    <strong>
                        ${escapeHTML(
                            formatOrderType(data.order_type)
                        )}
                    </strong>
                </div>

                <div>
                    <span>Amount</span>
                    <strong>
                        ₦${formatNumber(data.amount)}
                    </strong>
                </div>

                <div>
                    <span>Status</span>
                    <strong>
                        ${escapeHTML(
                            capitalize(data.status)
                        )}
                    </strong>
                </div>

                <div>
                    <span>Reference</span>
                    <strong>
                        ${escapeHTML(
                            data.payment_reference ||
                            "Not supplied"
                        )}
                    </strong>
                </div>

                <div>
                    <span>Submitted</span>
                    <strong>
                        ${escapeHTML(
                            formatDate(
                                data.submitted_at ||
                                data.created_at
                            )
                        )}
                    </strong>
                </div>

            </div>

            <div class="molas-admin-order-subjects">

                <h4>Selected Subjects</h4>

                ${
                    items.length
                        ? items.map(item => `
                            <div>
                                <span>
                                    Subject #${escapeHTML(
                                        item.subject_id
                                    )}
                                </span>

                                <strong>
                                    ₦${formatNumber(
                                        item.unit_price
                                    )}
                                </strong>
                            </div>
                        `).join("")
                        : "<p>No subjects found.</p>"
                }

            </div>

            ${
                data.receipt_url
                    ? `
                        <div class="molas-admin-receipt">
                            <p>Payment Receipt</p>

                            <div
                                class="molas-admin-receipt-preview"
                                data-receipt-path="${escapeHTML(
                                    data.receipt_url
                                )}"
                            >
                                Preparing receipt...
                            </div>
                        </div>
                    `
                    : ""
            }

            ${
                data.status === "pending"
                    ? `
                        <div class="molas-admin-detail-actions">

                            <button
                                type="button"
                                class="molas-admin-primary-button"
                                data-jamb-approve="${escapeHTML(
                                    data.id
                                )}"
                            >
                                Approve Payment
                            </button>

                            <button
                                type="button"
                                class="molas-admin-danger-button"
                                data-jamb-reject="${escapeHTML(
                                    data.id
                                )}"
                            >
                                Reject Payment
                            </button>

                        </div>
                    `
                    : ""
            }

        </div>
    `;

    /*
     * FIX:
     * JAMB order details also need to generate a signed
     * URL for the private receipt and display the image.
     */
    const receiptPreview = content.querySelector(
        ".molas-admin-receipt-preview"
    );

    if (receiptPreview) {
        await displayPaymentReceipt(
            content,
            receiptPreview.dataset.receiptPath
        );
    }

    setupPaymentDetailButtons(content, data.id);

    detail.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   PAYMENT DETAIL HTML
========================================================= */

function createPaymentDetailHTML(data, heading) {
    return `
        <div class="molas-admin-detail-card">

            <h3>
                ${escapeHTML(heading)} #${escapeHTML(data.id)}
            </h3>

            <div class="molas-admin-detail-grid">

                <div>
                    <span>Resource</span>
                    <strong>
                        ${escapeHTML(
                            formatOrderType(data.order_type)
                        )}
                    </strong>
                </div>

                <div>
                    <span>Amount</span>
                    <strong>
                        ₦${formatNumber(data.amount)}
                    </strong>
                </div>

                <div>
                    <span>Status</span>
                    <strong>
                        ${escapeHTML(
                            capitalize(data.status)
                        )}
                    </strong>
                </div>

                <div>
                    <span>Reference</span>
                    <strong>
                        ${escapeHTML(
                            data.payment_reference ||
                            "Not supplied"
                        )}
                    </strong>
                </div>

                <div>
                    <span>Submitted</span>
                    <strong>
                        ${escapeHTML(
                            formatDate(
                                data.submitted_at ||
                                data.created_at
                            )
                        )}
                    </strong>
                </div>

            </div>

            ${
                data.receipt_url
                    ? `
                        <div class="molas-admin-receipt">
                            <p>Payment Receipt</p>

                            <div
                                class="molas-admin-receipt-preview"
                                data-receipt-path="${escapeHTML(
                                    data.receipt_url
                                )}"
                            >
                                Preparing receipt...
                            </div>
                        </div>
                    `
                    : ""
            }

            ${
                data.status === "pending"
                    ? `
                        <div class="molas-admin-detail-actions">

                            <button
                                type="button"
                                class="molas-admin-primary-button"
                                data-approve-order="${escapeHTML(
                                    data.id
                                )}"
                            >
                                Approve Payment
                            </button>

                            <button
                                type="button"
                                class="molas-admin-danger-button"
                                data-reject-order="${escapeHTML(
                                    data.id
                                )}"
                            >
                                Reject Payment
                            </button>

                        </div>
                    `
                    : ""
            }

        </div>
    `;
}


function setupPaymentDetailButtons(content, orderId) {
    const approve = content.querySelector(
        "[data-approve-order], [data-jamb-approve]"
    );

    const reject = content.querySelector(
        "[data-reject-order], [data-jamb-reject]"
    );

    if (approve) {
        approve.addEventListener("click", () => {
            approveOrder(orderId, approve);
        });
    }

    if (reject) {
        reject.addEventListener("click", () => {
            rejectOrder(orderId, reject);
        });
    }
}


/* =========================================================
   APPROVE / REJECT
========================================================= */

async function approveOrder(orderId, button) {
    if (button) {
        button.disabled = true;
    }

    const { error } = await supabaseClient.rpc(
        "approve_jamb_payment_order",
        {
            p_order_id: Number(orderId)
        }
    );

    if (error) {
        console.error("Approval error:", error);

        alert("Unable to approve this payment.");

        if (button) {
            button.disabled = false;
        }

        return;
    }

    alert("Payment approved successfully.");

    await Promise.allSettled([
        loadPayments(),
        loadJambPayments(),
        loadDashboard()
    ]);

    closeDetail("payments");
    closeDetail("jamb");
}


async function rejectOrder(orderId, button) {
    const confirmed = window.confirm(
        "Are you sure you want to reject this payment?"
    );

    if (!confirmed) return;

    if (button) {
        button.disabled = true;
    }

    const { error } = await supabaseClient.rpc(
        "reject_jamb_payment_order",
        {
            p_order_id: Number(orderId)
        }
    );

    if (error) {
        console.error("Rejection error:", error);

        alert("Unable to reject this payment.");

        if (button) {
            button.disabled = false;
        }

        return;
    }

    alert("Payment rejected successfully.");

    await Promise.allSettled([
        loadPayments(),
        loadJambPayments(),
        loadDashboard()
    ]);

    closeDetail("payments");
    closeDetail("jamb");
}


/* =========================================================
   PAYMENT REFRESH
========================================================= */

function setupPaymentRefresh() {
    const button = document.getElementById(
        "jamb-payments-refresh"
    );

    if (!button) return;

    button.addEventListener("click", async event => {
        event.preventDefault();

        button.disabled = true;

        try {
            await Promise.allSettled([
                loadPayments(),
                loadJambPayments(),
                loadDashboard()
            ]);
        } finally {
            button.disabled = false;
        }
    });
}


/* =========================================================
   PAYMENT SEARCH
========================================================= */

function setupPaymentSearch() {
    const input = document.getElementById(
        "molas-admin-payment-search"
    );

    if (!input) return;

    input.addEventListener("input", event => {
        const value = event.target.value
            .trim()
            .toLowerCase();

        document
            .querySelectorAll(
                "#molas-admin-payment-list [data-payment-id]"
            )
            .forEach(item => {
                item.style.display =
                    !value ||
                    item.textContent.toLowerCase().includes(value)
                        ? ""
                        : "none";
            });
    });
}


/* =========================================================
   DETAIL CLOSE BUTTONS
========================================================= */

function setupDetailButtons() {
    document
        .querySelectorAll("[data-close-detail]")
        .forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();

                closeDetail(
                    button.dataset.closeDetail
                );
            });
        });

    const contentBack = document.getElementById(
        "molas-admin-content-back"
    );

    if (contentBack) {
        contentBack.addEventListener("click", event => {
            event.preventDefault();

            const detail = document.getElementById(
                "molas-admin-content-detail"
            );

            const grid = document.querySelector(
                ".molas-admin-content-grid"
            );

            if (detail) {
                detail.hidden = true;
            }

            if (grid) {
                grid.hidden = false;
            }
        });
    }
}


function closeDetail(section) {
    const map = {
        students: [
            "molas-admin-student-list",
            "molas-admin-student-detail"
        ],

        payments: [
            "molas-admin-payment-list",
            "molas-admin-payment-detail"
        ],

        jamb: [
            "jamb-payment-list",
            "molas-admin-jamb-detail"
        ]
    };

    const ids = map[section];

    if (!ids) return;

    const list = document.getElementById(ids[0]);
    const detail = document.getElementById(ids[1]);

    if (detail) {
        detail.hidden = true;
    }

    if (list) {
        list.hidden = false;
    }
}


/* =========================================================
   CONTENT
========================================================= */

function setupContentCards() {
    document.addEventListener("click", event => {
        const card = event.target.closest(
            "[data-content-type]"
        );

        if (!card) return;

        event.preventDefault();

        openContent(card.dataset.contentType);
    });
}


function openContent(type) {
    const grid = document.querySelector(
        ".molas-admin-content-grid"
    );

    const detail = document.getElementById(
        "molas-admin-content-detail"
    );

    const content = document.getElementById(
        "molas-admin-content-detail-content"
    );

    if (!detail || !content) return;

    const names = {
        news: "News",
        admission_alerts: "Admission Alerts",
        scholarships: "Scholarships",
        university_updates: "University Updates"
    };

    if (grid) {
        grid.hidden = true;
    }

    detail.hidden = false;

    content.innerHTML = `
        <div class="molas-admin-detail-card">

            <h3>
                ${escapeHTML(names[type] || "Content")}
            </h3>

            <p>
                ${escapeHTML(names[type] || "Content")} management will be connected
                to the corresponding MOLAS content system here.
            </p>

        </div>
    `;

    detail.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   MESSAGES
========================================================= */

function setupMessages() {
    const list = document.getElementById(
        "molas-admin-conversation-list"
    );

    if (list) {
        list.addEventListener("click", async event => {
            const conversation = event.target.closest(
                "[data-conversation-id]"
            );

            if (!conversation) return;

            const id =
                conversation.dataset.conversationId;

            if (!id) return;

            await openConversation(id);
        });
    }

    const refresh = document.getElementById(
        "molas-admin-refresh"
    );

    if (refresh) {
        refresh.addEventListener("click", async event => {
            event.preventDefault();

            await loadConversations();
        });
    }

    const search = document.getElementById(
        "molas-conversation-search"
    );

    if (search) {
        search.addEventListener(
            "input",
            filterConversations
        );
    }

    const form = document.getElementById(
        "molas-admin-reply-form"
    );

    if (form) {
        form.addEventListener(
            "submit",
            sendAdminMessage
        );
    }

    const close = document.getElementById(
        "molas-admin-close-conversation"
    );

    if (close) {
        close.addEventListener(
            "click",
            closeCurrentConversation
        );
    }

    const back = document.getElementById(
        "molas-admin-back-to-conversations"
    );

    if (back) {
        back.addEventListener("click", event => {
            event.preventDefault();

            showConversationList();
        });
    }
}


/* =========================================================
   LOAD CONVERSATIONS
========================================================= */

async function loadConversations() {
    const list = document.getElementById(
        "molas-admin-conversation-list"
    );

    if (!list) return;

    const { data, error } = await supabaseClient
        .from("chat_conversations")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error(
            "Conversation loading error:",
            error
        );

        list.innerHTML = `
            <div class="molas-admin-list-empty">
                Unable to load conversations.
            </div>
        `;

        return;
    }

    const count = document.getElementById(
        "molas-conversation-count"
    );

    const total = data?.length || 0;

    if (count) {
        count.textContent =
            `${total} conversation${total === 1 ? "" : "s"}`;
    }

    if (!data || !data.length) {
        list.innerHTML = `
            <div class="molas-admin-list-empty">
                <p>No conversations yet.</p>
            </div>
        `;

        return;
    }

    list.innerHTML = data.map(conversation => {
        const name =
            conversation.name ||
            conversation.full_name ||
            conversation.visitor_name ||
            "Visitor";

        const email =
            conversation.email ||
            conversation.visitor_email ||
            "";

        const topic =
            conversation.subject ||
            conversation.topic ||
            "Conversation";

        return `
            <div
                class="molas-admin-conversation-item"
                data-conversation-id="${escapeHTML(conversation.id)}"
                role="button"
                tabindex="0"
            >

                <div class="molas-admin-conversation-avatar">
                    ${escapeHTML(getInitials(name))}
                </div>

                <div class="molas-admin-conversation-info">
                    <strong>${escapeHTML(name)}</strong>
                    <span>${escapeHTML(topic)}</span>
                    <small>${escapeHTML(email)}</small>
                </div>

                <span class="molas-admin-conversation-status">
                    ${escapeHTML(
                        capitalize(conversation.status || "open")
                    )}
                </span>

            </div>
        `;
    }).join("");

    await loadMessageCount();
}


/* =========================================================
   OPEN CONVERSATION
========================================================= */

async function openConversation(conversationId) {
    currentConversationId = conversationId;

    const chatLayout = document.querySelector(
        ".molas-admin-chat-layout"
    );

    if (chatLayout) {
        chatLayout.classList.add("chat-open");
    }

    const empty = document.getElementById(
        "molas-admin-chat-empty"
    );

    const active = document.getElementById(
        "molas-admin-active-chat"
    );

    if (empty) {
        empty.hidden = true;
        empty.style.display = "none";
    }

    if (active) {
        active.hidden = false;
        active.style.display = "";
        active.classList.add("active");
    }

    const { data, error } = await supabaseClient
        .from("chat_conversations")
        .select("*")
        .eq("id", conversationId)
        .maybeSingle();

    if (error) {
        console.error("Conversation error:", error);
        return;
    }

    if (data) {
        const name =
            data.name ||
            data.full_name ||
            data.visitor_name ||
            "Visitor";

        const email =
            data.email ||
            data.visitor_email ||
            "";

        const topic =
            data.subject ||
            data.topic ||
            "Conversation";

        const avatar = document.getElementById(
            "molas-admin-visitor-avatar"
        );

        const nameElement = document.getElementById(
            "molas-admin-chat-name"
        );

        const emailElement = document.getElementById(
            "molas-admin-chat-email"
        );

        const topicElement = document.getElementById(
            "molas-admin-chat-topic"
        );

        const statusElement = document.getElementById(
            "molas-admin-chat-status"
        );

        if (avatar) {
            avatar.textContent = getInitials(name);
        }

        if (nameElement) {
            nameElement.textContent = name;
        }

        if (emailElement) {
            emailElement.textContent = email;
        }

        if (topicElement) {
            topicElement.textContent = topic;
        }

        if (statusElement) {
            statusElement.textContent =
                capitalize(data.status || "open");
        }
    }

    await loadConversationMessages(conversationId);

    subscribeToConversation(conversationId);
}


/* =========================================================
   LOAD CHAT MESSAGES
========================================================= */

async function loadConversationMessages(conversationId) {
    const container = document.getElementById(
        "molas-admin-messages"
    );

    if (!container) return;

    const { data, error } = await supabaseClient
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", {
            ascending: true
        });

    if (error) {
        console.error("Chat messages error:", error);

        container.innerHTML = `
            <div class="molas-admin-list-empty">
                Unable to load messages.
            </div>
        `;

        return;
    }

    if (!data || !data.length) {
        container.innerHTML = `
            <div class="molas-admin-list-empty">
                <p>No messages yet.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = data.map(message => {
        const sender = String(
            message.sender_type ||
            message.sender ||
            message.role ||
            ""
        ).toLowerCase();

        const isAdmin = sender === "admin";

        const messageText =
            message.message ||
            message.content ||
            "";

        return `
            <div class="
                molas-admin-message
                ${isAdmin ? "admin" : "visitor"}
            ">

                <div class="molas-admin-message-bubble">
                    ${escapeHTML(messageText)}
                </div>

                <small>
                    ${escapeHTML(
                        formatDate(message.created_at)
                    )}
                </small>

            </div>
        `;
    }).join("");

    container.scrollTop = container.scrollHeight;
}


/* =========================================================
   REALTIME CHAT
========================================================= */

function subscribeToConversation(conversationId) {
    if (currentConversationChannel) {
        supabaseClient.removeChannel(
            currentConversationChannel
        );
    }

    currentConversationChannel = supabaseClient
        .channel("admin-chat-" + conversationId)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "chat_messages",
                filter: `conversation_id=eq.${conversationId}`
            },
            async () => {
                if (
                    currentConversationId === conversationId
                ) {
                    await loadConversationMessages(
                        conversationId
                    );
                }
            }
        )
        .subscribe();
}


/* =========================================================
   SEND ADMIN MESSAGE
========================================================= */

async function sendAdminMessage(event) {
    event.preventDefault();

    if (!currentConversationId) {
        alert("Please open a conversation first.");
        return;
    }

    const input = document.getElementById(
        "molas-admin-reply-message"
    );

    if (!input) return;

    const message = input.value.trim();

    if (!message) return;

    const sendButton = document.getElementById(
        "molas-admin-send-message"
    );

    if (sendButton) {
        sendButton.disabled = true;
    }

    try {
        const { error } = await supabaseClient
            .from("chat_messages")
            .insert({
                conversation_id: currentConversationId,
                sender_type: "admin",
                message: message
            });

        if (error) {
            console.error("Send message error:", error);

            alert("Unable to send the message.");
            return;
        }

        input.value = "";

        await loadConversationMessages(
            currentConversationId
        );

    } finally {
        if (sendButton) {
            sendButton.disabled = false;
        }
    }
}


/* =========================================================
   CLOSE CONVERSATION
========================================================= */

async function closeCurrentConversation() {
    if (!currentConversationId) return;

    const confirmed = window.confirm(
        "Close this conversation?"
    );

    if (!confirmed) return;

    const { error } = await supabaseClient
        .from("chat_conversations")
        .update({
            status: "closed"
        })
        .eq("id", currentConversationId);

    if (error) {
        console.error(
            "Close conversation error:",
            error
        );

        alert("Unable to close this conversation.");
        return;
    }

    if (currentConversationChannel) {
        await supabaseClient.removeChannel(
            currentConversationChannel
        );

        currentConversationChannel = null;
    }

    currentConversationId = null;

    showConversationList();

    await loadConversations();
    await loadDashboard();
}


/* =========================================================
   SHOW CONVERSATION LIST
========================================================= */

function showConversationList() {
    const chatLayout = document.querySelector(
        ".molas-admin-chat-layout"
    );

    if (chatLayout) {
        chatLayout.classList.remove("chat-open");
    }

    const empty = document.getElementById(
        "molas-admin-chat-empty"
    );

    const active = document.getElementById(
        "molas-admin-active-chat"
    );

    if (active) {
        active.hidden = true;
        active.style.display = "none";
        active.classList.remove("active");
    }

    if (empty) {
        empty.hidden = false;
        empty.style.display = "";
    }
}


/* =========================================================
   CONVERSATION SEARCH
========================================================= */

function filterConversations(event) {
    const search = event.target.value
        .trim()
        .toLowerCase();

    document
        .querySelectorAll(
            "#molas-admin-conversation-list [data-conversation-id]"
        )
        .forEach(item => {
            const text = item.textContent.toLowerCase();

            item.style.display =
                !search || text.includes(search)
                    ? ""
                    : "none";
        });
}


/* =========================================================
   GENERAL SEARCH
========================================================= */

function setupSearch() {
    const search = document.getElementById(
        "molas-admin-global-search"
    );

    if (!search) return;

    search.addEventListener("input", event => {
        const value = event.target.value
            .trim()
            .toLowerCase();

        if (!value) {
            document
                .querySelectorAll(
                    ".molas-admin-section [data-student-id], " +
                    ".molas-admin-section [data-payment-id], " +
                    ".molas-admin-section [data-conversation-id], " +
                    ".molas-admin-section [data-jamb-order-id]"
                )
                .forEach(item => {
                    item.style.display = "";
                });

            return;
        }

        document
            .querySelectorAll(
                ".molas-admin-section:not([hidden]) [data-student-id], " +
                ".molas-admin-section:not([hidden]) [data-payment-id], " +
                ".molas-admin-section:not([hidden]) [data-conversation-id], " +
                ".molas-admin-section:not([hidden]) [data-jamb-order-id]"
            )
            .forEach(item => {
                const text = item.textContent.toLowerCase();

                item.style.display =
                    text.includes(value) ? "" : "none";
            });
    });
}


/* =========================================================
   AUTH STATE
========================================================= */

supabaseClient.auth.onAuthStateChange(
    (event, session) => {
        if (event === "SIGNED_OUT") {
            redirectToLogin();
            return;
        }

        if (session?.user) {
            currentAdminUser = session.user;

            displayAdminInformation(session.user);
        }
    }
);


/* =========================================================
   HELPERS
========================================================= */

function formatOrderType(type) {
    if (!type) {
        return "JAMB Resource";
    }

    return String(type)
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter => {
            return letter.toUpperCase();
        });
}


function formatNumber(value) {
    const number = Number(value);

    if (Number.isNaN(number)) {
        return "0";
    }

    return number.toLocaleString("en-NG");
}


function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}


function capitalize(value) {
    if (!value) {
        return "";
    }

    const text = String(value);

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}


function getStatusClass(status) {
    if (!status) return "";

    return String(status)
        .toLowerCase()
        .replace(/\s+/g, "-");
}


function getInitials(name) {
    if (!name) {
        return "V";
    }

    return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => {
            return part.charAt(0).toUpperCase();
        })
        .join("");
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


/* =========================================================
   PAYMENT RECEIPT URL
========================================================= */

async function getPaymentReceiptURL(receiptPath) {
    if (!receiptPath) {
        return null;
    }

    const receipt = String(receiptPath).trim();

    if (!receipt) {
        return null;
    }

    /*
     * Support older records that already contain a full URL.
     */
    if (/^https?:\/\//i.test(receipt)) {
        return receipt;
    }

    /*
     * The receipt_url field stores the Storage object path.
     * The bucket is private, so generate a temporary signed URL.
     */
    const { data, error } = await supabaseClient
        .storage
        .from("jamb-payment-receipts")
        .createSignedUrl(receipt, 3600);

    if (error || !data?.signedUrl) {
        console.error("Receipt URL error:", error);
        return null;
    }

    return data.signedUrl;
}


/* =========================================================
   DISPLAY PAYMENT RECEIPT
========================================================= */

async function displayPaymentReceipt(
    container,
    receiptPath
) {
    const preview = container.querySelector(
        ".molas-admin-receipt-preview"
    );

    if (!preview) {
        return;
    }

    preview.textContent = "Loading receipt…";

    const receiptURL = await getPaymentReceiptURL(
        receiptPath
    );

    if (!receiptURL) {
        preview.textContent =
            "Unable to display receipt. Please try again.";

        return;
    }

    preview.replaceChildren();

    const image = document.createElement("img");

    image.src = receiptURL;
    image.alt = "Student payment receipt";

    image.style.display = "block";
    image.style.width = "100%";
    image.style.maxWidth = "500px";
    image.style.height = "auto";
    image.style.objectFit = "contain";
    image.style.borderRadius = "12px";

    const link = document.createElement("a");

    link.href = receiptURL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open receipt in full size";
    link.className = "molas-admin-toolbar-button";

    link.style.display = "inline-block";
    link.style.marginTop = "12px";

    /*
     * Keep the full-size link available if the inline image
     * cannot be rendered by the browser.
     */
    image.addEventListener("error", () => {
        image.alt = "Receipt image could not be displayed.";
        image.style.display = "none";

        const errorMessage = document.createElement("p");

        errorMessage.textContent =
            "The receipt preview could not be loaded. Open the receipt in full size.";

        preview.prepend(errorMessage);
    }, { once: true });

    preview.append(image, link);
}