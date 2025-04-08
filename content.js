console.log("Email writer extension-content script loaded");

function createButton(label, tooltip, className) {
    const button = document.createElement('div');
    button.className = `T-I J-J5-Ji aoO v7 T-I-atl L3 ${className}`;
    button.style.backgroundColor = '#0b57d0';
    button.style.color = 'white';
    button.style.fontSize = '14px';
    button.style.fontWeight = '500';
    button.style.padding = '8px 20px';
    button.style.height = '36px';
    button.style.minWidth = '80px';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.cursor = 'pointer';
    button.style.borderRadius = '20px';
    button.innerHTML = label;
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', tooltip);
    return button;
}

function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '[role="presentation"]', '.gmail_quote'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) return content.innerText.trim();
    }
    return null;
}

function findSendButton() {
    return document.querySelector('div[role="button"][data-tooltip^="Send"]');
}

function findComposeToolbar() {
    return document.querySelector('.aDh') || document.querySelector('.btC');
}

function isReplyWindow() {
    return document.querySelector('.gmail_quote') || document.querySelector('.adn.ads');
}

function injectButton() {
    const toolbar = findComposeToolbar();
    const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
    if (!toolbar || !composeBox) return;

    if (document.querySelector('.ai-compose-button') || document.querySelector('.ai-reply-button')) {
        return;
    }

if (isReplyWindow()) {
    console.log("Injecting AI Reply button");
    const replyButton = createButton("AI Reply", "Generate AI Reply", "ai-reply-button");

    replyButton.addEventListener('click', async () => {
        try {
            replyButton.innerHTML = 'Generating...';
            replyButton.disabled = true;

            const emailContent = getEmailContent();
            if (!emailContent) throw new Error("No email content found.");

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mode: "reply",
                    emailContent: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) throw new Error(`API Request Failed: ${response.statusText}`);

            const generatedReply = await response.text();
            composeBox.focus();
            document.execCommand('insertText', false, generatedReply);

        } catch (error) {
            console.error("Error:", error.message);
            alert('Failed to generate reply');
        } finally {
            replyButton.innerHTML = 'AI Reply';
            replyButton.disabled = false;
        }
    });

    const sendButton = findSendButton();
    if (sendButton && sendButton.parentNode) {
        // 🛠️ Apply styling fixes to visually separate the buttons
        replyButton.style.marginRight = '8px';
        replyButton.style.marginLeft = '4px';
        replyButton.style.display = 'inline-block';
        replyButton.style.zIndex = '1000';
        replyButton.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.05)';

        sendButton.parentNode.insertBefore(replyButton, sendButton);
    } else {
        toolbar.insertBefore(replyButton, toolbar.firstChild);
    }
}
else {
        console.log("Injecting AI Compose UI");

        const container = document.createElement('div');
        container.className = 'ai-compose-container';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '8px';
        container.style.margin = '8px 0';

        const input = document.createElement('input');
        input.placeholder = "What should the email say?";
        input.className = 'ai-compose-input';
        input.style.padding = '6px';
        input.style.borderRadius = '4px';
        input.style.border = '1px solid #ccc';
        input.style.width = '250px';

        const composeButton = createButton("AI Compose", "Generate Email from Prompt", "ai-compose-button");

        composeButton.addEventListener('click', async () => {
            try {
                const prompt = input.value.trim();
                if (!prompt) return alert("Enter a prompt.");

                composeButton.innerHTML = 'Generating...';
                composeButton.disabled = true;

                const response = await fetch('http://localhost:8080/api/email/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        mode: "compose",
                        tone: "professional",
                        emailContent: prompt
                    })
                });

                if (!response.ok) throw new Error(`API Request Failed: ${response.statusText}`);

                const generatedEmail = await response.text();
                console.log("Generated Email:", generatedEmail);
                composeBox.focus();
                document.execCommand('insertText', false, generatedEmail);

            } catch (error) {
                console.error("Error:", error.message);
                alert('Failed to generate email');
            } finally {
                composeButton.innerHTML = 'AI Compose';
                composeButton.disabled = false;
            }
        });

        container.appendChild(composeButton);
        container.appendChild(input);

        const formattingBar = document.querySelector('.aDh');
        if (formattingBar?.parentNode) {
            formattingBar.parentNode.insertBefore(container, formattingBar);
        }
    }
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const composeTriggered = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches?.('.aDh, .btC, [role="dialog"]') ||
             node.querySelector?.('.aDh, .btC, [role="dialog"]'))
        );
        if (composeTriggered) {
            console.log("Compose/Reply detected");
            setTimeout(injectButton, 500); // Let DOM settle
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
