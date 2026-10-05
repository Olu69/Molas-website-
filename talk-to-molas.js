/* =====================================================
   TALK TO MOLAS
   SUPABASE LIVE CHAT
====================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    /* =================================================
       SUPABASE
    ================================================== */

    const SUPABASE_URL =
        "https://eidnzebqyxcpxbykybch.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Q81zflk66ijoYEpT_pqL1g_S-cSJSpj";

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    /* =================================================
       ELEMENTS
    ================================================== */

    const mobileMenuButton =
        document.getElementById("talk-mobile-menu-btn");

    const mainNav =
        document.getElementById("talk-nav");

    const navDropdowns =
        document.querySelectorAll(".talk-nav-dropdown");


    const openChatButton =
        document.getElementById("molas-chat-open");

    const startOverlay =
        document.getElementById("molas-chat-start-overlay");

    const startCloseButton =
        document.getElementById("molas-chat-start-close");

    const startForm =
        document.getElementById("molas-chat-start-form");

    const startError =
        document.getElementById("molas-chat-start-error");


    const visitorName =
        document.getElementById("molas-visitor-name");

    const visitorEmail =
        document.getElementById("molas-visitor-email");

    const visitorPhone =
        document.getElementById("molas-visitor-phone");

    const chatTopic =
        document.getElementById("molas-chat-topic");


    const liveChat =
        document.getElementById("molas-live-chat");

    const closeChatButton =
        document.getElementById("molas-chat-close-button");

    const chatStatus =
        document.getElementById("molas-chat-status");

    const chatMessages =
        document.getElementById("molas-chat-messages");

    const messageForm =
        document.getElementById("molas-chat-message-form");

    const messageInput =
        document.getElementById("molas-chat-message-input");


    const helpTopics =
        document.querySelectorAll(".talk-help-topic");


    /* =================================================
       CHAT STATE
    ================================================== */

    let currentConversationId = null;

    let realtimeChannel = null;

    let currentUser = null;

    /*
       Keeps track of messages already displayed.
       This prevents a message from appearing twice
       when Realtime and loadMessages overlap.
    */

    const displayedMessageIds =
        new Set();


    /* =================================================
       BASIC ELEMENT CHECK
    ================================================== */

    if (
        !mainNav ||
        !openChatButton ||
        !startOverlay ||
        !startForm ||
        !liveChat
    ) {

        console.error(
            "MOLAS: Required page elements were not found."
        );

        return;

    }


    /* =================================================
       SUPABASE ANONYMOUS AUTH
    ================================================== */

    async function initializeAuth() {

        try {

            const {
                data: {
                    session
                },
                error: sessionError
            } =
                await supabaseClient.auth.getSession();


            if (sessionError) {

                console.error(
                    "MOLAS: Could not get session.",
                    sessionError
                );

            }


            if (session?.user) {

                currentUser =
                    session.user;

                return currentUser;

            }


            const {
                data,
                error
            } =
                await supabaseClient.auth.signInAnonymously();


            if (error) {

                console.error(
                    "MOLAS: Anonymous sign-in failed.",
                    error
                );

                showStartError(
                    `Supabase authentication error: ${error.message || "Unknown error"}`
                );

                return null;

            }


            currentUser =
                data.user;


            return currentUser;

        } catch (error) {

            console.error(
                "MOLAS: Authentication error.",
                error
            );

            showStartError(
                `Supabase authentication error: ${error.message || "Unknown error"}`
            );

            return null;

        }

    }


    await initializeAuth();


    /* =================================================
       MOBILE NAVIGATION
    ================================================== */

    if (mobileMenuButton) {

        mobileMenuButton.addEventListener(
            "click",
            () => {

                const isOpen =
                    mainNav.classList.contains("active");


                mainNav.classList.toggle(
                    "active"
                );


                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    String(!isOpen)
                );


                const icon =
                    mobileMenuButton.querySelector("i");


                if (icon) {

                    if (!isOpen) {

                        icon.classList.remove(
                            "fa-bars"
                        );

                        icon.classList.add(
                            "fa-xmark"
                        );

                    } else {

                        icon.classList.remove(
                            "fa-xmark"
                        );

                        icon.classList.add(
                            "fa-bars"
                        );

                    }

                }

            }
        );

    }


    /* =================================================
       MOBILE NAV DROPDOWNS
    ================================================== */

    navDropdowns.forEach((dropdown) => {

        const button =
            dropdown.querySelector(":scope > button");

        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            (event) => {

                if (
                    window.innerWidth > 760
                ) {
                    return;
                }


                event.preventDefault();


                navDropdowns.forEach(
                    (otherDropdown) => {

                        if (
                            otherDropdown !== dropdown
                        ) {

                            otherDropdown.classList.remove(
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

    });


    /* =================================================
       CLOSE MOBILE NAV AFTER LINK CLICK
    ================================================== */

    mainNav.addEventListener(
        "click",
        (event) => {

            const link =
                event.target.closest("a");


            if (!link) {
                return;
            }


            if (
                window.innerWidth <= 760
            ) {

                mainNav.classList.remove(
                    "active"
                );


                navDropdowns.forEach(
                    (dropdown) => {

                        dropdown.classList.remove(
                            "open"
                        );

                    }
                );


                mobileMenuButton?.setAttribute(
                    "aria-expanded",
                    "false"
                );


                const icon =
                    mobileMenuButton?.querySelector("i");


                if (icon) {

                    icon.classList.remove(
                        "fa-xmark"
                    );

                    icon.classList.add(
                        "fa-bars"
                    );

                }

            }

        }
    );


    /* =================================================
       RESET MOBILE NAV ON RESIZE
    ================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 760
            ) {

                mainNav.classList.remove(
                    "active"
                );


                navDropdowns.forEach(
                    (dropdown) => {

                        dropdown.classList.remove(
                            "open"
                        );

                    }
                );


                mobileMenuButton?.setAttribute(
                    "aria-expanded",
                    "false"
                );


                const icon =
                    mobileMenuButton?.querySelector("i");


                if (icon) {

                    icon.classList.remove(
                        "fa-xmark"
                    );

                    icon.classList.add(
                        "fa-bars"
                    );

                }

            }

        }
    );


    /* =================================================
       OPEN START CHAT WINDOW
    ================================================== */

    function openStartWindow() {

        startOverlay.classList.add(
            "active"
        );


        startOverlay.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";


        setTimeout(
            () => {

                if (visitorName) {
                    visitorName.focus();
                }

            },
            100
        );

    }


    /* =================================================
       CLOSE START CHAT WINDOW
    ================================================== */

    function closeStartWindow() {

        startOverlay.classList.remove(
            "active"
        );


        startOverlay.setAttribute(
            "aria-hidden",
            "true"
        );


        if (
            !liveChat.classList.contains("active")
        ) {

            document.body.style.overflow =
                "";

        }

    }


    /* =================================================
       MAIN TALK TO MOLAS BUTTON
    ================================================== */

    openChatButton.addEventListener(
        "click",
        () => {

            openStartWindow();

        }
    );


    /* =================================================
       CLOSE START WINDOW
    ================================================== */

    if (startCloseButton) {

        startCloseButton.addEventListener(
            "click",
            () => {

                closeStartWindow();

            }
        );

    }


    /* =================================================
       CLICK OUTSIDE START WINDOW
    ================================================== */

    startOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target === startOverlay
            ) {

                closeStartWindow();

            }

        }
    );


    /* =================================================
       HELP TOPICS
    ================================================== */

    helpTopics.forEach(
        (topicButton) => {

            topicButton.addEventListener(
                "click",
                () => {

                    const selectedTopic =
                        topicButton.dataset.topic;


                    if (
                        chatTopic &&
                        selectedTopic
                    ) {

                        chatTopic.value =
                            selectedTopic;

                    }


                    openStartWindow();

                }
            );

        }
    );


    /* =================================================
       START CHAT
    ================================================== */

    startForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (startError) {

                startError.textContent =
                    "";

            }


            const name =
                visitorName
                    ? visitorName.value.trim()
                    : "";


            const email =
                visitorEmail
                    ? visitorEmail.value.trim()
                    : "";


            const phone =
                visitorPhone
                    ? visitorPhone.value.trim()
                    : "";


            const topic =
                chatTopic
                    ? chatTopic.value
                    : "Other";


            /* -----------------------------------------
               VALIDATION
            ------------------------------------------ */

            if (!name) {

                showStartError(
                    "Please enter your name."
                );

                visitorName?.focus();

                return;

            }


            if (!email) {

                showStartError(
                    "Please enter your email address."
                );

                visitorEmail?.focus();

                return;

            }


            if (
                !isValidEmail(email)
            ) {

                showStartError(
                    "Please enter a valid email address."
                );

                visitorEmail?.focus();

                return;

            }


            /* -----------------------------------------
               MAKE SURE AUTH EXISTS
            ----------------------------------------- */

            if (!currentUser) {

                currentUser =
                    await initializeAuth();

            }


            if (!currentUser) {

                return;

            }


            /* -----------------------------------------
               CREATE CONVERSATION
            ----------------------------------------- */

            if (chatStatus) {

                chatStatus.textContent =
                    "Starting chat...";

            }


            const {
                data: conversation,
                error
            } =
                await supabaseClient
                    .from("chat_conversations")
                    .insert({

                        visitor_name:
                            name,

                        visitor_email:
                            email,

                        visitor_phone:
                            phone || null,

                        topic:
                            topic,

                        visitor_user_id:
                            currentUser.id

                    })
                    .select()
                    .single();


            if (error) {

                console.error(
                    "MOLAS: Conversation creation failed.",
                    error
                );

                console.error(
                    "MOLAS error message:",
                    error.message
                );

                console.error(
                    "MOLAS error details:",
                    error.details
                );

                console.error(
                    "MOLAS error hint:",
                    error.hint
                );

                console.error(
                    "MOLAS error code:",
                    error.code
                );


                const errorMessage =
                    error.message ||
                    error.details ||
                    error.hint ||
                    "Unknown Supabase error.";


                showStartError(
                    `Supabase error: ${errorMessage}`
                );


                if (chatStatus) {

                    chatStatus.textContent =
                        "Unable to connect";

                }

                return;

            }


            currentConversationId =
                conversation.id;


            /* -----------------------------------------
               RESET MESSAGE TRACKING
            ------------------------------------------ */

            displayedMessageIds.clear();


            /* -----------------------------------------
               SAVE VISITOR DETAILS
            ------------------------------------------ */

            try {

                sessionStorage.setItem(
                    "molasVisitor",
                    JSON.stringify({

                        name:
                            name,

                        email:
                            email,

                        phone:
                            phone,

                        topic:
                            topic,

                        conversationId:
                            currentConversationId

                    })
                );

            } catch (error) {

                console.warn(
                    "MOLAS: Could not save visitor details.",
                    error
                );

            }


            /* -----------------------------------------
               CLOSE START WINDOW
            ----------------------------------------- */

            closeStartWindow();


            /* -----------------------------------------
               OPEN LIVE CHAT
            ----------------------------------------- */

            openLiveChat();


            /* -----------------------------------------
               CONNECT TO REALTIME FIRST
            ----------------------------------------- */

            await setupRealtime();


            /* -----------------------------------------
               THEN LOAD EXISTING MESSAGES
            ----------------------------------------- */

            await loadMessages();

        }
    );


    /* =================================================
       EMAIL VALIDATION
    ================================================== */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    /* =================================================
       SHOW START ERROR
    ================================================== */

    function showStartError(message) {

        if (!startError) {
            return;
        }


        startError.textContent =
            message;

    }


    /* =================================================
       OPEN LIVE CHAT
    ================================================== */

    function openLiveChat() {

        liveChat.classList.add(
            "active"
        );


        liveChat.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";


        if (chatStatus) {

            chatStatus.textContent =
                "Connecting...";

        }


        setTimeout(
            () => {

                if (messageInput) {

                    messageInput.focus();

                }

            },
            100
        );

    }


    /* =================================================
       CLOSE LIVE CHAT
    ================================================== */

    function closeLiveChat() {

        liveChat.classList.remove(
            "active"
        );


        liveChat.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.style.overflow =
            "";


        if (realtimeChannel) {

            supabaseClient
                .removeChannel(
                    realtimeChannel
                );

            realtimeChannel =
                null;

        }

    }


    /* =================================================
       CLOSE LIVE CHAT BUTTON
    ================================================== */

    if (closeChatButton) {

        closeChatButton.addEventListener(
            "click",
            () => {

                closeLiveChat();

            }
        );

    }


    /* =================================================
       LOAD MESSAGES
    ================================================== */

    async function loadMessages() {

        if (!currentConversationId) {
            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("chat_messages")
                .select("*")
                .eq(
                    "conversation_id",
                    currentConversationId
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "MOLAS: Could not load messages.",
                error
            );

            return;

        }


        if (chatMessages) {

            chatMessages.innerHTML =
                "";

        }


        displayedMessageIds.clear();


        data.forEach(
            (message) => {

                addChatMessage(
                    message.message,
                    message.sender_type,
                    message.id
                );

            }
        );

    }


    /* =================================================
       REALTIME CHAT
    ================================================== */

    function setupRealtime() {

        return new Promise((resolve) => {

            if (!currentConversationId) {

                resolve(false);

                return;

            }


            if (realtimeChannel) {

                supabaseClient
                    .removeChannel(
                        realtimeChannel
                    );

                realtimeChannel =
                    null;

            }


            let resolved =
                false;


            const finish =
                (success) => {

                    if (resolved) {
                        return;
                    }


                    resolved =
                        true;


                    resolve(success);

                };


            realtimeChannel =
                supabaseClient
                    .channel(
                        `molas-chat-${currentConversationId}-${Date.now()}`
                    )
                    .on(
                        "postgres_changes",
                        {
                            event:
                                "INSERT",

                            schema:
                                "public",

                            table:
                                "chat_messages",

                            filter:
                                `conversation_id=eq.${currentConversationId}`

                        },
                        (payload) => {

                            const newMessage =
                                payload.new;


                            addChatMessage(
                                newMessage.message,
                                newMessage.sender_type,
                                newMessage.id
                            );

                        }
                    )
                    .subscribe(
                        (status) => {

                            if (chatStatus) {

                                if (
                                    status === "SUBSCRIBED"
                                ) {

                                    chatStatus.textContent =
                                        "Connected";

                                    finish(true);

                                } else if (
                                    status === "CHANNEL_ERROR"
                                ) {

                                    chatStatus.textContent =
                                        "Connection issue";

                                    console.error(
                                        "MOLAS: Realtime channel error."
                                    );

                                    finish(false);

                                } else if (
                                    status === "TIMED_OUT"
                                ) {

                                    chatStatus.textContent =
                                        "Connection timed out";

                                    console.error(
                                        "MOLAS: Realtime channel timed out."
                                    );

                                    finish(false);

                                } else if (
                                    status === "CLOSED"
                                ) {

                                    chatStatus.textContent =
                                        "Disconnected";

                                    finish(false);

                                } else {

                                    chatStatus.textContent =
                                        "Connecting...";

                                }

                            }

                        }
                    );


            /*
               Safety timeout.

               If Supabase does not respond within
               8 seconds, continue loading messages
               instead of leaving the visitor stuck.
            */

            setTimeout(
                () => {

                    if (!resolved) {

                        console.warn(
                            "MOLAS: Realtime subscription took too long."
                        );

                        finish(false);

                    }

                },
                8000
            );

        });

    }


    /* =================================================
       ADD CHAT MESSAGE
    ================================================== */

    function addChatMessage(
        message,
        sender,
        messageId = null
    ) {

        if (!chatMessages) {
            return;
        }


        /*
           If we already displayed this exact
           database message, don't add it again.
        */

        if (
            messageId &&
            displayedMessageIds.has(messageId)
        ) {

            return;

        }


        if (messageId) {

            displayedMessageIds.add(
                messageId
            );

        }


        const messageElement =
            document.createElement(
                "div"
            );


        /*
           These class names match the CSS:

           admin   = left
           visitor = right
        */

        messageElement.className =
            `molas-chat-message molas-chat-message-${sender}`;


        const bubble =
            document.createElement(
                "div"
            );


        bubble.className =
            "molas-chat-message-bubble";


        bubble.textContent =
            message;


        messageElement.appendChild(
            bubble
        );


        chatMessages.appendChild(
            messageElement
        );


        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }


    /* =================================================
       SEND CHAT MESSAGE
    ================================================== */

    if (messageForm) {

        messageForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const message =
                    messageInput
                        ? messageInput.value.trim()
                        : "";


                if (
                    !message ||
                    !currentConversationId ||
                    !currentUser
                ) {

                    return;

                }


                messageInput.disabled =
                    true;


                try {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from("chat_messages")
                            .insert({

                                conversation_id:
                                    currentConversationId,

                                sender_type:
                                    "visitor",

                                message:
                                    message

                            })
                            .select()
                            .single();


                    if (error) {

                        console.error(
                            "MOLAS: Message send failed.",
                            error
                        );

                        return;

                    }


                    /*
                       Realtime normally adds the message.

                       If Realtime is slightly delayed,
                       add it immediately as a fallback.
                       The message ID prevents duplicates.
                    */

                    if (data) {

                        addChatMessage(
                            data.message,
                            data.sender_type,
                            data.id
                        );

                    }


                    messageInput.value =
                        "";

                } finally {

                    messageInput.disabled =
                        false;

                    messageInput.focus();

                }

            }
        );

    }


    /* =================================================
       ESCAPE KEY
    ================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            if (
                startOverlay.classList.contains(
                    "active"
                )
            ) {

                closeStartWindow();

                return;

            }


            if (
                liveChat.classList.contains(
                    "active"
                )
            ) {

                closeLiveChat();

            }

        }
    );


    /* =================================================
       CLEANUP
    ================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            document.body.style.overflow =
                "";

        }
    );

});