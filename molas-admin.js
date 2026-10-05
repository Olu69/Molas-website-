/* =====================================================
   MOLAS ADMIN DASHBOARD
===================================================== */

const SUPABASE_URL =
    "https://eidnzebqyxcpxbykybch.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =====================================================
   STATE
===================================================== */

let currentAdmin = null;
let currentConversation = null;
let conversations = [];

let conversationChannel = null;
let messageChannel = null;

/*
   Keeps track of messages already rendered.
   This prevents Realtime + database loading
   from displaying the same message twice.
*/
const renderedMessageIds = new Set();

/*
   Used to prevent an older message-loading request
   from overwriting a newer selected conversation.
*/
let messageLoadRequest = 0;


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const conversationList =
        document.getElementById(
            "molas-admin-conversation-list"
        );

    const conversationSearch =
        document.getElementById(
            "molas-conversation-search"
        );

    const refreshButton =
        document.getElementById(
            "molas-admin-refresh"
        );

    const logoutButton =
        document.getElementById(
            "molas-admin-logout"
        );

    const replyForm =
        document.getElementById(
            "molas-admin-reply-form"
        );

    const notificationClose =
        document.getElementById(
            "adminMessageNotificationClose"
        );

    const backToConversations =
        document.getElementById(
            "molas-admin-back-to-conversations"
        );


    /* =================================================
       BACK TO CONVERSATIONS
    ================================================== */

    if (backToConversations) {

        backToConversations.addEventListener(
            "click",
            () => {

                const layout =
                    document.querySelector(
                        ".molas-admin-chat-layout"
                    );

                if (layout) {

                    layout.classList.remove(
                        "chat-open"
                    );

                }

            }
        );

    }


    /* =================================================
       INITIALIZE
    ================================================== */

    initializeAdmin();


    /* =================================================
       SEARCH
    ================================================== */

    if (conversationSearch) {

        conversationSearch.addEventListener(
            "input",
            () => {

                renderConversationList(
                    conversationSearch.value.trim()
                );

            }
        );

    }


    /* =================================================
       REFRESH
    ================================================== */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async () => {

                refreshButton.disabled = true;

                const icon =
                    refreshButton.querySelector("i");

                if (icon) {
                    icon.classList.add("fa-spin");
                }

                await loadConversations();

                refreshButton.disabled = false;

                if (icon) {
                    icon.classList.remove("fa-spin");
                }

            }
        );

    }


    /* =================================================
       LOGOUT
    ================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                logoutButton.disabled = true;

                const { error } =
                    await supabaseClient.auth.signOut();

                if (error) {

                    console.error(
                        "MOLAS logout error:",
                        error
                    );

                    logoutButton.disabled = false;

                    return;
                }

                window.location.href =
                    "molas-admin-login.html";

            }
        );

    }


    /* =================================================
       REPLY
    ================================================= */

    if (replyForm) {

        replyForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                if (!currentConversation) {
                    return;
                }


                const input =
                    document.getElementById(
                        "molas-admin-reply-message"
                    );

                const sendButton =
                    document.getElementById(
                        "molas-admin-send-message"
                    );


                if (!input || !sendButton) {
                    return;
                }


                const message =
                    input.value.trim();


                if (!message) {
                    return;
                }


                input.disabled = true;
                sendButton.disabled = true;

                sendButton.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i>';


                try {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from("chat_messages")
                            .insert({
                                conversation_id:
                                    currentConversation.id,

                                sender_type:
                                    "admin",

                                message:
                                    message
                            })
                            .select()
                            .single();


                    if (error) {
                        throw error;
                    }


                    input.value = "";


                    /*
                       Realtime normally adds the message.

                       This fallback adds it immediately if
                       Realtime is slightly delayed.

                       The message ID prevents duplication.
                    */

                    if (data) {

                        appendRealtimeMessage(
                            data
                        );

                    }


                    await updateConversationTimestamp(
                        currentConversation.id
                    );


                } catch (error) {

                    console.error(
                        "MOLAS admin reply error:",
                        error
                    );

                    alert(
                        error?.message ||
                        "Unable to send your reply."
                    );

                } finally {

                    input.disabled = false;
                    sendButton.disabled = false;

                    sendButton.innerHTML =
                        '<i class="fa-solid fa-paper-plane"></i>';

                    input.focus();

                }

            }
        );

    }


    /* =================================================
       NOTIFICATION CLOSE
    ================================================== */

    if (notificationClose) {

        notificationClose.addEventListener(
            "click",
            () => {

                hideNotification();

            }
        );

    }


    /* =================================================
       INITIALIZE ADMIN
    ================================================= */

    async function initializeAdmin() {

        try {

            const {
                data: {
                    session
                }
            } =
                await supabaseClient.auth.getSession();


            if (
                !session ||
                !session.user
            ) {

                window.location.href =
                    "molas-admin-login.html";

                return;
            }


            const user =
                session.user;


            /* =========================================
               VERIFY ADMIN
            ========================================= */

            const {
                data: adminRecord,
                error: adminError
            } =
                await supabaseClient
                    .from("chat_admins")
                    .select(
                        "id, user_id, active"
                    )
                    .eq(
                        "user_id",
                        user.id
                    )
                    .eq(
                        "active",
                        true
                    )
                    .maybeSingle();


            if (adminError) {
                throw adminError;
            }


            if (!adminRecord) {

                await supabaseClient.auth.signOut();

                window.location.href =
                    "molas-admin-login.html";

                return;
            }


            currentAdmin =
                user;


            /* =========================================
               DISPLAY ADMIN EMAIL
            ========================================= */

            const adminEmail =
                document.getElementById(
                    "molas-admin-user-email"
                );


            if (adminEmail) {

                adminEmail.textContent =
                    user.email || "Admin";

            }


            /* =========================================
               CONNECT REALTIME FIRST
            ========================================= */

            await Promise.all([
                setupConversationRealtime(),
                setupMessageRealtime()
            ]);


            /* =========================================
               LOAD CONVERSATIONS
            ========================================= */

            await loadConversations();


        } catch (error) {

            console.error(
                "MOLAS admin initialization error:",
                error
            );

            alert(
                error?.message ||
                "Unable to load the MOLAS admin dashboard."
            );

        }

    }


    /* =================================================
       LOAD CONVERSATIONS
    ================================================== */

    async function loadConversations() {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("chat_conversations")
                .select("*")
                .order(
                    "updated_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "MOLAS conversations error:",
                error
            );

            return;
        }


        conversations =
            data || [];


        updateConversationCount();


        renderConversationList(
            conversationSearch
                ? conversationSearch.value.trim()
                : ""
        );


        /* =============================================
           KEEP CURRENT CHAT UPDATED
        ============================================= */

        if (currentConversation) {

            const updatedConversation =
                conversations.find(
                    conversation =>
                        conversation.id ===
                        currentConversation.id
                );


            if (updatedConversation) {

                currentConversation =
                    updatedConversation;

                updateActiveChatHeader();

            }

        }

    }


    /* =================================================
       CONVERSATION COUNT
    ================================================== */

    function updateConversationCount() {

        const countElement =
            document.getElementById(
                "molas-conversation-count"
            );


        if (!countElement) {
            return;
        }


        const count =
            conversations.length;


        countElement.textContent =
            `${count} conversation${
                count === 1 ? "" : "s"
            }`;

    }


    /* =================================================
       RENDER CONVERSATION LIST
    ================================================== */

    function renderConversationList(
        searchTerm = ""
    ) {

        if (!conversationList) {
            return;
        }


        const search =
            searchTerm.toLowerCase();


        const filtered =
            conversations.filter(
                conversation => {

                    if (!search) {
                        return true;
                    }


                    return (
                        (
                            conversation.visitor_name ||
                            ""
                        )
                            .toLowerCase()
                            .includes(search)
                        ||
                        (
                            conversation.visitor_email ||
                            ""
                        )
                            .toLowerCase()
                            .includes(search)
                        ||
                        (
                            conversation.topic ||
                            ""
                        )
                            .toLowerCase()
                            .includes(search)
                    );

                }
            );


        if (!filtered.length) {

            conversationList.innerHTML = `
                <div class="molas-admin-list-empty">
                    <i class="fa-regular fa-comments"></i>

                    <h3>
                        ${
                            search
                                ? "No matches found"
                                : "No conversations yet"
                        }
                    </h3>

                    <p>
                        ${
                            search
                                ? "Try another search."
                                : "New visitor conversations will appear here."
                        }
                    </p>
                </div>
            `;

            return;
        }


        conversationList.innerHTML =
            filtered
                .map(createConversationItem)
                .join("");


        const items =
            conversationList.querySelectorAll(
                ".molas-admin-conversation-item"
            );


        items.forEach(
            item => {

                item.addEventListener(
                    "click",
                    () => {

                        const conversationId =
                            item.dataset.conversationId;


                        openConversation(
                            conversationId
                        );

                    }
                );

            }
        );

    }


    /* =================================================
       CREATE CONVERSATION ITEM
    ================================================== */

    function createConversationItem(
        conversation
    ) {

        const name =
            conversation.visitor_name ||
            "Visitor";


        const initial =
            name.charAt(0).toUpperCase();


        const topic =
            conversation.topic ||
            "Other";


        const time =
            formatConversationTime(
                conversation.updated_at ||
                conversation.created_at
            );


        const isActive =
            currentConversation &&
            currentConversation.id ===
                conversation.id;


        return `
            <button
                type="button"
                class="molas-admin-conversation-item ${
                    isActive ? "active" : ""
                }"
                data-conversation-id="${escapeHtml(
                    conversation.id
                )}"
            >

                <div class="molas-admin-conversation-avatar">
                    ${escapeHtml(initial)}
                </div>

                <div class="molas-admin-conversation-content">

                    <div class="molas-admin-conversation-top">

                        <span class="molas-admin-conversation-name">
                            ${escapeHtml(name)}
                        </span>

                        <span class="molas-admin-conversation-time">
                            ${escapeHtml(time)}
                        </span>

                    </div>

                    <div class="molas-admin-conversation-preview">
                        ${escapeHtml(
                            conversation.visitor_email ||
                            "Visitor conversation"
                        )}
                    </div>

                    <span class="molas-admin-conversation-topic">
                        ${escapeHtml(topic)}
                    </span>

                </div>

            </button>
        `;

    }


    /* =================================================
       OPEN CONVERSATION
    ================================================== */

    async function openConversation(
        conversationId
    ) {

        const conversation =
            conversations.find(
                item =>
                    item.id ===
                    conversationId
            );


        if (!conversation) {
            return;
        }


        currentConversation =
            conversation;


        renderedMessageIds.clear();


        updateActiveChatHeader();


        const emptyChat =
            document.getElementById(
                "molas-admin-chat-empty"
            );

        const activeChat =
            document.getElementById(
                "molas-admin-active-chat"
            );


        if (emptyChat) {
            emptyChat.hidden = true;
        }


        if (activeChat) {
            activeChat.hidden = false;
        }


        const layout =
            document.querySelector(
                ".molas-admin-chat-layout"
            );


        if (layout) {
            layout.classList.add(
                "chat-open"
            );
        }


        renderConversationList(
            conversationSearch
                ? conversationSearch.value.trim()
                : ""
        );


        await loadConversationMessages(
            conversation.id
        );


        await markConversationMessagesRead(
            conversation.id
        );

    }


    /* =================================================
       ACTIVE CHAT HEADER
    ================================================== */

    function updateActiveChatHeader() {

        if (!currentConversation) {
            return;
        }


        const nameElement =
            document.getElementById(
                "molas-admin-chat-name"
            );

        const emailElement =
            document.getElementById(
                "molas-admin-chat-email"
            );

        const topicElement =
            document.getElementById(
                "molas-admin-chat-topic"
            );

        const avatarElement =
            document.getElementById(
                "molas-admin-visitor-avatar"
            );

        const statusElement =
            document.getElementById(
                "molas-admin-chat-status"
            );

        const closeButton =
            document.getElementById(
                "molas-admin-close-conversation"
            );


        const name =
            currentConversation.visitor_name ||
            "Visitor";


        if (nameElement) {

            nameElement.textContent =
                name;

        }


        if (emailElement) {

            emailElement.textContent =
                currentConversation.visitor_email ||
                "Email";

        }


        if (topicElement) {

            topicElement.textContent =
                currentConversation.topic ||
                "Other";

        }


        if (avatarElement) {

            avatarElement.textContent =
                name.charAt(0).toUpperCase();

        }


        if (statusElement) {

            statusElement.textContent =
                currentConversation.status ===
                "closed"
                    ? "Closed"
                    : "Open";

        }


        if (closeButton) {

            if (
                currentConversation.status ===
                "closed"
            ) {

                closeButton.innerHTML =
                    '<i class="fa-solid fa-rotate-left"></i> Reopen';

                closeButton.onclick =
                    reopenCurrentConversation;

            } else {

                closeButton.innerHTML =
                    '<i class="fa-solid fa-check"></i> Close';

                closeButton.onclick =
                    closeCurrentConversation;

            }

        }

    }


    /* =================================================
       LOAD MESSAGES
    ================================================== */

    async function loadConversationMessages(
        conversationId
    ) {

        const messagesContainer =
            document.getElementById(
                "molas-admin-messages"
            );


        if (!messagesContainer) {

            console.error(
                "MOLAS: Messages container not found."
            );

            return;
        }


        const requestId =
            ++messageLoadRequest;


        renderedMessageIds.clear();


        messagesContainer.innerHTML = `
            <div class="molas-admin-list-empty molas-admin-message-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Loading messages...</p>
            </div>
        `;


        try {

            console.log(
                "MOLAS: Loading messages for conversation:",
                conversationId
            );


            const {
                data,
                error
            } =
                await supabaseClient
                    .from("chat_messages")
                    .select(
                        "id, conversation_id, sender_type, message, created_at, read"
                    )
                    .eq(
                        "conversation_id",
                        conversationId
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    );


            console.log(
                "MOLAS: Message query result:",
                {
                    data,
                    error
                }
            );


            if (
                requestId !==
                messageLoadRequest
            ) {

                return;

            }


            if (
                !currentConversation ||
                currentConversation.id !==
                    conversationId
            ) {

                return;

            }


            if (error) {

                console.error(
                    "MOLAS messages error:",
                    error
                );


                messagesContainer.innerHTML = `
                    <div class="molas-admin-list-empty">
                        <i class="fa-solid fa-triangle-exclamation"></i>

                        <h3>
                            Unable to load messages
                        </h3>

                        <p>
                            ${escapeHtml(
                                error.message ||
                                "Please try again."
                            )}
                        </p>
                    </div>
                `;

                return;

            }


            messagesContainer.innerHTML = "";


            if (
                data &&
                data.length > 0
            ) {

                data.forEach(
                    message => {

                        appendRealtimeMessage(
                            message
                        );

                    }
                );

            }


            const hasMessages =
                messagesContainer.querySelector(
                    ".molas-admin-message"
                );


            if (!hasMessages) {

                messagesContainer.innerHTML = `
                    <div class="molas-admin-list-empty">
                        <i class="fa-regular fa-comments"></i>

                        <h3>
                            No messages yet
                        </h3>

                        <p>
                            This conversation has no messages yet.
                        </p>
                    </div>
                `;

            }


            scrollMessagesToBottom();


        } catch (error) {

            console.error(
                "MOLAS: Unexpected message loading error:",
                error
            );


            if (
                requestId !==
                messageLoadRequest
            ) {

                return;

            }


            messagesContainer.innerHTML = `
                <div class="molas-admin-list-empty">
                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>
                        Unable to load messages
                    </h3>

                    <p>
                        ${escapeHtml(
                            error?.message ||
                            "An unexpected error occurred."
                        )}
                    </p>
                </div>
            `;

        }

    }


    /* =================================================
       CREATE MESSAGE
    ================================================== */

    function createMessageBubble(
        message
    ) {

        const senderClass =
            message.sender_type === "admin"
                ? "admin"
                : "visitor";


        const time =
            formatMessageTime(
                message.created_at
            );


        return `
            <div
                class="molas-admin-message ${senderClass}"
                data-message-id="${escapeHtml(
                    message.id || ""
                )}"
            >

                <div class="molas-admin-message-bubble">
                    ${escapeHtml(
                        message.message || ""
                    )}
                </div>

                <span class="molas-admin-message-time">
                    ${escapeHtml(time)}
                </span>

            </div>
        `;

    }


    /* =================================================
       REALTIME — CONVERSATIONS
    ================================================== */

    function setupConversationRealtime() {

        return new Promise(
            resolve => {

                if (conversationChannel) {

                    supabaseClient.removeChannel(
                        conversationChannel
                    );

                    conversationChannel =
                        null;

                }


                let finished =
                    false;


                const finish =
                    success => {

                        if (finished) {
                            return;
                        }

                        finished = true;

                        resolve(success);

                    };


                conversationChannel =
                    supabaseClient
                        .channel(
                            `molas-admin-conversations-${Date.now()}`
                        )
                        .on(
                            "postgres_changes",
                            {
                                event: "*",
                                schema: "public",
                                table:
                                    "chat_conversations"
                            },
                            async payload => {

                                console.log(
                                    "Conversation realtime:",
                                    payload
                                );


                                await loadConversations();

                            }
                        )
                        .subscribe(
                            status => {

                                console.log(
                                    "Conversation realtime status:",
                                    status
                                );


                                if (
                                    status ===
                                    "SUBSCRIBED"
                                ) {

                                    finish(true);

                                    return;

                                }


                                if (
                                    status ===
                                        "CHANNEL_ERROR" ||
                                    status ===
                                        "TIMED_OUT" ||
                                    status ===
                                        "CLOSED"
                                ) {

                                    console.error(
                                        "MOLAS: Conversation Realtime connection problem:",
                                        status
                                    );

                                    finish(false);

                                }

                            }
                        );


                setTimeout(
                    () => {

                        if (!finished) {

                            console.warn(
                                "MOLAS: Conversation Realtime subscription timed out."
                            );

                            finish(false);

                        }

                    },
                    8000
                );

            }
        );

    }


    /* =================================================
       REALTIME — MESSAGES
    ================================================== */

    function setupMessageRealtime() {

        return new Promise(
            resolve => {

                if (messageChannel) {

                    supabaseClient.removeChannel(
                        messageChannel
                    );

                    messageChannel =
                        null;

                }


                let finished =
                    false;


                const finish =
                    success => {

                        if (finished) {
                            return;
                        }

                        finished = true;

                        resolve(success);

                    };


                messageChannel =
                    supabaseClient
                        .channel(
                            `molas-admin-messages-${Date.now()}`
                        )
                        .on(
                            "postgres_changes",
                            {
                                event:
                                    "INSERT",

                                schema:
                                    "public",

                                table:
                                    "chat_messages"
                            },
                            async payload => {

                                console.log(
                                    "Message realtime:",
                                    payload
                                );


                                const message =
                                    payload.new;


                                if (
                                    !message ||
                                    !message.conversation_id
                                ) {

                                    return;

                                }


                                /* =================================
                                   CURRENT CONVERSATION
                                ================================= */

                                if (
                                    currentConversation &&
                                    message.conversation_id ===
                                        currentConversation.id
                                ) {

                                    appendRealtimeMessage(
                                        message
                                    );


                                    if (
                                        message.sender_type ===
                                        "visitor"
                                    ) {

                                        await markSingleMessageRead(
                                            message.id
                                        );


                                        showNotification(
                                            currentConversation.visitor_name ||
                                            "Visitor",

                                            message.message
                                        );

                                    }

                                }


                                /* =================================
                                   OTHER CONVERSATION
                                ================================= */

                                else if (
                                    message.sender_type ===
                                    "visitor"
                                ) {

                                    const conversation =
                                        conversations.find(
                                            item =>
                                                item.id ===
                                                message.conversation_id
                                        );


                                    showNotification(
                                        conversation?.visitor_name ||
                                        "New visitor",

                                        message.message
                                    );

                                }


                                await loadConversations();

                            }
                        )
                        .subscribe(
                            status => {

                                console.log(
                                    "Message realtime status:",
                                    status
                                );


                                if (
                                    status ===
                                    "SUBSCRIBED"
                                ) {

                                    finish(true);

                                    return;

                                }


                                if (
                                    status ===
                                        "CHANNEL_ERROR" ||
                                    status ===
                                        "TIMED_OUT" ||
                                    status ===
                                        "CLOSED"
                                ) {

                                    console.error(
                                        "MOLAS: Message Realtime connection problem:",
                                        status
                                    );

                                    finish(false);

                                }

                            }
                        );


                setTimeout(
                    () => {

                        if (!finished) {

                            console.warn(
                                "MOLAS: Message Realtime subscription timed out."
                            );

                            finish(false);

                        }

                    },
                    8000
                );

            }
        );

    }


    /* =================================================
       APPEND REALTIME MESSAGE
    ================================================== */

    function appendRealtimeMessage(
        message
    ) {

        const messagesContainer =
            document.getElementById(
                "molas-admin-messages"
            );


        if (!messagesContainer) {
            return;
        }


        if (
            message.id &&
            renderedMessageIds.has(
                message.id
            )
        ) {

            return;

        }


        if (message.id) {

            renderedMessageIds.add(
                message.id
            );

        }


        const emptyState =
            messagesContainer.querySelector(
                ".molas-admin-list-empty"
            );


        if (emptyState) {

            messagesContainer.innerHTML =
                "";

        }


        messagesContainer.insertAdjacentHTML(
            "beforeend",
            createMessageBubble(message)
        );


        scrollMessagesToBottom();

    }


    /* =================================================
       MARK CONVERSATION READ
    ================================================== */

    async function markConversationMessagesRead(
        conversationId
    ) {

        const {
            error
        } =
            await supabaseClient
                .from("chat_messages")
                .update({
                    read: true
                })
                .eq(
                    "conversation_id",
                    conversationId
                )
                .eq(
                    "sender_type",
                    "visitor"
                )
                .eq(
                    "read",
                    false
                );


        if (error) {

            console.error(
                "Unable to mark messages read:",
                error
            );

        }

    }


    /* =================================================
       MARK SINGLE MESSAGE READ
    ================================================== */

    async function markSingleMessageRead(
        messageId
    ) {

        const {
            error
        } =
            await supabaseClient
                .from("chat_messages")
                .update({
                    read: true
                })
                .eq(
                    "id",
                    messageId
                );


        if (error) {

            console.error(
                "Unable to mark message read:",
                error
            );

        }

    }


    /* =================================================
       UPDATE CONVERSATION TIMESTAMP
    ================================================== */

    async function updateConversationTimestamp(
        conversationId
    ) {

        const {
            error
        } =
            await supabaseClient
                .from("chat_conversations")
                .update({
                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    conversationId
                );


        if (error) {

            console.error(
                "Unable to update conversation:",
                error
            );

        }

    }


    /* =================================================
       CLOSE CURRENT CONVERSATION
    ================================================== */

    async function closeCurrentConversation() {

        if (!currentConversation) {
            return;
        }


        const confirmed =
            confirm(
                "Close this conversation?"
            );


        if (!confirmed) {
            return;
        }


        const button =
            document.getElementById(
                "molas-admin-close-conversation"
            );


        if (button) {
            button.disabled = true;
        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .from("chat_conversations")
                    .update({
                        status:
                            "closed"
                    })
                    .eq(
                        "id",
                        currentConversation.id
                    );


            if (error) {
                throw error;
            }


            currentConversation.status =
                "closed";


            updateActiveChatHeader();


            await loadConversations();


        } catch (error) {

            console.error(
                "Close conversation error:",
                error
            );

            alert(
                error?.message ||
                "Unable to close conversation."
            );

        } finally {

            if (button) {
                button.disabled = false;
            }

        }

    }


    /* =================================================
       REOPEN CURRENT CONVERSATION
    ================================================== */

    async function reopenCurrentConversation() {

        if (!currentConversation) {
            return;
        }


        const button =
            document.getElementById(
                "molas-admin-close-conversation"
            );


        if (button) {
            button.disabled = true;
        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .from("chat_conversations")
                    .update({
                        status:
                            "open"
                    })
                    .eq(
                        "id",
                        currentConversation.id
                    );


            if (error) {
                throw error;
            }


            currentConversation.status =
                "open";


            updateActiveChatHeader();


            await loadConversations();


        } catch (error) {

            console.error(
                "Reopen conversation error:",
                error
            );

            alert(
                error?.message ||
                "Unable to reopen conversation."
            );

        } finally {

            if (button) {
                button.disabled = false;
            }

        }

    }


    /* =================================================
       NOTIFICATION
    ================================================== */

    function showNotification(
        visitorName,
        message
    ) {

        const notification =
            document.getElementById(
                "adminMessageNotification"
            );

        const text =
            document.getElementById(
                "adminMessageNotificationText"
            );


        if (!notification) {

            console.warn(
                "MOLAS: Notification element not found."
            );

            return;
        }


        if (text) {

            text.textContent =
                `${visitorName}: ${
                    message ||
                    "New message"
                }`;

        }


        notification.classList.add(
            "show"
        );


        notification.setAttribute(
            "aria-hidden",
            "false"
        );


        clearTimeout(
            window.molasNotificationTimer
        );


        window.molasNotificationTimer =
            setTimeout(
                () => {

                    hideNotification();

                },
                6000
            );

    }


    function hideNotification() {

        const notification =
            document.getElementById(
                "adminMessageNotification"
            );


        if (!notification) {
            return;
        }


        notification.classList.remove(
            "show"
        );


        notification.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /* =================================================
       SCROLL
    ================================================== */

    function scrollMessagesToBottom() {

        const container =
            document.getElementById(
                "molas-admin-messages"
            );


        if (!container) {
            return;
        }


        requestAnimationFrame(
            () => {

                container.scrollTop =
                    container.scrollHeight;

            }
        );

    }


    /* =================================================
       TIME FORMAT
    ================================================== */

    function formatConversationTime(
        timestamp
    ) {

        if (!timestamp) {
            return "";
        }


        const date =
            new Date(timestamp);


        const now =
            new Date();


        const sameDay =
            date.toDateString() ===
            now.toDateString();


        if (sameDay) {

            return date.toLocaleTimeString(
                [],
                {
                    hour:
                        "numeric",

                    minute:
                        "2-digit"
                }
            );

        }


        return date.toLocaleDateString(
            [],
            {
                day:
                    "numeric",

                month:
                    "short"
            }
        );

    }


    function formatMessageTime(
        timestamp
    ) {

        if (!timestamp) {
            return "";
        }


        return new Date(
            timestamp
        ).toLocaleTimeString(
            [],
            {
                hour:
                    "numeric",

                minute:
                    "2-digit"
            }
        );

    }


    /* =================================================
       ESCAPE HTML
    ================================================== */

    function escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )
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


    /* =================================================
       CLEANUP
    ================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            document.body.style.overflow =
                "";

            if (conversationChannel) {

                supabaseClient.removeChannel(
                    conversationChannel
                );

            }

            if (messageChannel) {

                supabaseClient.removeChannel(
                    messageChannel
                );

            }

        }
    );

});