const urlParams =
    new URLSearchParams(window.location.search);

const orderId =
    urlParams.get("order");

const RECEIPT_BUCKET =
    "jamb-payment-receipts";


/* =====================================================
   LOAD BANK ACCOUNTS FROM SUPABASE
===================================================== */

async function loadBankAccounts() {

    const container =
        document.getElementById(
            "bank-accounts-container"
        );

    if (!container) {
        return;
    }

    container.textContent =
        "Loading payment accounts...";

    try {

        const {
            data: accounts,
            error
        } = await supabaseClient
            .from("payment_bank_accounts")
            .select(`
                id,
                bank_name,
                account_name,
                account_number,
                is_primary,
                display_order
            `)
            .eq("is_active", true)
            .order("display_order", {
                ascending: true
            });

        if (error) {
            throw error;
        }

        container.replaceChildren();

        if (!accounts || accounts.length === 0) {

            container.textContent =
                "Payment accounts are currently unavailable. Please contact MOLAS for assistance.";

            return;
        }

        accounts.forEach(account => {

            const card =
                document.createElement("article");

            card.className =
                "bank-account-card";

            if (account.is_primary) {

                card.classList.add(
                    "primary-bank-account"
                );
            }


            const header =
                document.createElement("div");

            header.className =
                "bank-account-card-header";


            const bankName =
                document.createElement("h4");

            bankName.className =
                "bank-account-name";

            bankName.textContent =
                account.bank_name;


            header.appendChild(bankName);


            if (account.is_primary) {

                const badge =
                    document.createElement("span");

                badge.className =
                    "bank-primary-badge";

                badge.textContent =
                    "Recommended";

                header.appendChild(badge);
            }


            const accountNameLabel =
                document.createElement("span");

            accountNameLabel.className =
                "bank-detail-label";

            accountNameLabel.textContent =
                "Account Name";


            const accountName =
                document.createElement("p");

            accountName.className =
                "bank-account-holder";

            accountName.textContent =
                account.account_name;


            const numberLabel =
                document.createElement("span");

            numberLabel.className =
                "bank-detail-label";

            numberLabel.textContent =
                "Account Number";


            const numberRow =
                document.createElement("div");

            numberRow.className =
                "bank-account-number-row";


            const accountNumber =
                document.createElement("strong");

            accountNumber.className =
                "bank-account-number";

            accountNumber.textContent =
                account.account_number;


            const copyButton =
                document.createElement("button");

            copyButton.type =
                "button";

            copyButton.className =
                "bank-copy-button";

            copyButton.textContent =
                "Copy Number";


            copyButton.addEventListener(
                "click",
                async function () {

                    try {

                        await navigator.clipboard.writeText(
                            account.account_number
                        );

                        copyButton.textContent =
                            "Copied!";

                    } catch (error) {

                        const temporaryInput =
                            document.createElement("textarea");

                        temporaryInput.value =
                            account.account_number;

                        temporaryInput.style.position =
                            "fixed";

                        temporaryInput.style.opacity =
                            "0";

                        document.body.appendChild(
                            temporaryInput
                        );

                        temporaryInput.select();

                        let copied = false;

                        try {

                            copied =
                                document.execCommand("copy");

                        } catch (copyError) {

                            console.error(
                                "Copy failed:",
                                copyError
                            );
                        }

                        temporaryInput.remove();

                        if (copied) {

                            copyButton.textContent =
                                "Copied!";

                        } else {

                            copyButton.textContent =
                                "Copy failed";

                        }
                    }

                    setTimeout(() => {

                        copyButton.textContent =
                            "Copy Number";

                    }, 2000);
                }
            );


            numberRow.appendChild(
                accountNumber
            );

            numberRow.appendChild(
                copyButton
            );


            card.appendChild(header);

            card.appendChild(
                accountNameLabel
            );

            card.appendChild(
                accountName
            );

            card.appendChild(
                numberLabel
            );

            card.appendChild(
                numberRow
            );


            container.appendChild(card);
        });

    } catch (error) {

        console.error(
            "Unable to load bank accounts:",
            error
        );

        container.textContent =
            "Unable to load payment accounts. Please refresh the page or contact MOLAS.";
    }
}


/* =====================================================
   LOAD PAYMENT ORDER
===================================================== */

async function loadPaymentOrder() {

    const resourceElement =
        document.getElementById(
            "order-resource"
        );

    const subjectsElement =
        document.getElementById(
            "order-subjects"
        );

    const amountElement =
        document.getElementById(
            "order-amount"
        );

    const orderIdElement =
        document.getElementById(
            "order-id"
        );

    const statusElement =
        document.getElementById(
            "order-status"
        );


    if (!orderId) {

        resourceElement.textContent =
            "Order not found";

        subjectsElement.textContent =
            "—";

        amountElement.textContent =
            "—";

        orderIdElement.textContent =
            "—";

        statusElement.textContent =
            "Invalid order";

        return;
    }


    orderIdElement.textContent =
        `#${orderId}`;


    const {
        data: {
            session
        }
    } =
        await supabaseClient.auth.getSession();


    if (!session) {

        window.location.replace(
            "account.html?resource=jamb"
        );

        return;
    }


    const {
        data: order,
        error
    } =
        await supabaseClient
            .from("jamb_payment_orders")
            .select(`
                id,
                order_type,
                amount,
                status,
                jamb_payment_order_items (
                    subject_id
                )
            `)
            .eq("id", orderId)
            .eq("user_id", session.user.id)
            .single();


    if (error) {

        console.error(
            "Unable to load payment order:",
            error
        );

        resourceElement.textContent =
            "Unable to load order";

        subjectsElement.textContent =
            "Please try again.";

        statusElement.textContent =
            "Error";

        return;
    }


    const resourceNames = {

        syllabus:
            "JAMB Syllabus",

        past_questions:
            "JAMB Past Questions",

        cbt:
            "JAMB CBT Practice"
    };


    resourceElement.textContent =
        resourceNames[order.order_type] ||
        order.order_type;


    const subjectIds =
        (order.jamb_payment_order_items || [])
            .map(item =>
                item.subject_id
            );


    if (subjectIds.length) {

        const {
            data: subjects,
            error: subjectError
        } =
            await supabaseClient
                .from("past_subjects")
                .select(
                    "id, subject_name"
                )
                .in(
                    "id",
                    subjectIds
                );


        if (!subjectError && subjects) {

            subjectsElement.textContent =
                subjects
                    .map(subject =>
                        subject.subject_name
                    )
                    .join(", ");
        }

    } else {

        subjectsElement.textContent =
            "—";
    }


    amountElement.textContent =
        `₦${Number(
            order.amount
        ).toLocaleString()}`;


    statusElement.textContent =
        order.status === "approved"
            ? "Approved"
            : order.status === "rejected"
                ? "Rejected"
                : order.status === "pending"
                    ? "Pending"
                    : "Submitted";


    setupPaymentSubmission(
        order,
        session
    );
}


/* =====================================================
   PAYMENT SUBMISSION
===================================================== */

function setupPaymentSubmission(
    order,
    session
) {

    const referenceInput =
        document.getElementById(
            "payment-reference"
        );

    const receiptInput =
        document.getElementById(
            "payment-receipt"
        );

    const submitButton =
        document.getElementById(
            "submit-payment-button"
        );

    const messageElement =
        document.getElementById(
            "payment-form-message"
        );


    if (
        !referenceInput ||
        !receiptInput ||
        !submitButton ||
        !messageElement
    ) {
        return;
    }


    if (order.status !== "pending") {

        submitButton.disabled =
            true;

        referenceInput.disabled =
            true;

        receiptInput.disabled =
            true;

        return;
    }


    submitButton.onclick =
        async function () {

            const reference =
                referenceInput.value.trim();

            const receiptFile =
                receiptInput.files[0];


            if (!reference) {

                showPaymentMessage(
                    messageElement,
                    "Please enter your payment reference."
                );

                return;
            }


            if (!receiptFile) {

                showPaymentMessage(
                    messageElement,
                    "Please upload your payment receipt."
                );

                return;
            }


            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "application/pdf"
            ];


            if (
                !allowedTypes.includes(
                    receiptFile.type
                )
            ) {

                showPaymentMessage(
                    messageElement,
                    "Please upload a JPG, PNG, WEBP or PDF receipt."
                );

                return;
            }


            const maxSize =
                5 * 1024 * 1024;


            if (receiptFile.size > maxSize) {

                showPaymentMessage(
                    messageElement,
                    "Receipt file must not be larger than 5 MB."
                );

                return;
            }


            submitButton.disabled =
                true;

            submitButton.textContent =
                "Submitting...";


            try {

                const extension =
                    receiptFile.name
                        .split(".")
                        .pop()
                        .toLowerCase();


                const filePath =
                    `${session.user.id}/${order.id}/${Date.now()}.${extension}`;


                const {
                    error: uploadError
                } =
                    await supabaseClient
                        .storage
                        .from(RECEIPT_BUCKET)
                        .upload(
                            filePath,
                            receiptFile,
                            {
                                cacheControl: "3600",
                                upsert: false
                            }
                        );


                if (uploadError) {

                    throw uploadError;
                }


                const {
                    data: submitResult,
                    error: submitError
                } =
                    await supabaseClient
                        .rpc(
                            "submit_jamb_payment_order",
                            {
                                p_order_id: order.id,
                                p_payment_reference: reference,
                                p_receipt_url: filePath
                            }
                        );


                if (submitError) {

                    throw submitError;
                }


                console.log(
                    "Payment submitted:",
                    submitResult
                );


                messageElement.textContent =
                    "Payment submitted successfully. MOLAS will review your payment and activate your access after approval.";

                messageElement.classList.add(
                    "visible"
                );


                submitButton.textContent =
                    "Payment Submitted";


                referenceInput.disabled =
                    true;

                receiptInput.disabled =
                    true;


                const statusElement =
                    document.getElementById(
                        "order-status"
                    );


                if (statusElement) {

                    statusElement.textContent =
                        "Submitted";
                }


            } catch (error) {

                console.error(
                    "Payment submission error:",
                    error
                );


                showPaymentMessage(
                    messageElement,
                    error.message ||
                    "Unable to submit payment. Please try again."
                );


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Payment";
            }
        };
}


/* =====================================================
   PAYMENT MESSAGE
===================================================== */

function showPaymentMessage(
    element,
    message
) {

    element.textContent =
        message;

    element.classList.add(
        "visible"
    );
}


/* =====================================================
   INITIALIZE PAYMENT PAGE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await Promise.all([
            loadBankAccounts(),
            loadPaymentOrder()
        ]);

    }
);