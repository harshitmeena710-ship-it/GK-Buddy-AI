// Current chat
let currentChatId = null;

// Chat history stored in the browser
let chatHistory = [];


// Add message to screen
function addMessage(text, sender) {

    const chatBox = document.getElementById("chatBox");

    const message = document.createElement("div");

    message.className = "message " + sender;

   message.textContent = text;
    chatBox.appendChild(message);

    chatBox.scrollTop = chatBox.scrollHeight;
}


// Send question
async function sendQuestion() {

    const input = document.getElementById("questionInput");

    const question = input.value.trim();

    if (!question) return;

    addMessage(question, "user");

    input.value = "";

    addMessage("🤔 Thinking<span class=\"dots\">...</span>", "bot");

    try {

        const response = await fetch("/api/ask", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question,
                chatId: currentChatId
            })

        });

        const data = await response.json();

        currentChatId = data.chatId;

        // Add chat to history if it is new
        if (!chatHistory.some(chat => chat.id === currentChatId)) {

            chatHistory.push({
                id: currentChatId,
                title: question.substring(0, 30)
            });

            updateChatHistory();
        }

        const messages =
            document.querySelectorAll(".message");

        messages[messages.length - 1].textContent =
            data.answer;

    } catch (error) {

        console.error(error);

        const messages = document.querySelectorAll(".message");
const botMessage = messages[messages.length - 1];

botMessage.textContent = data.answer;

if (data.sources && data.sources.length > 0) {
    const sourcesDiv = document.createElement("div");
    sourcesDiv.className = "sources";

    const title = document.createElement("strong");
    title.textContent = "🌐 Sources:";
    sourcesDiv.appendChild(title);

    data.sources.forEach(source => {
        const link = document.createElement("a");

        link.href = source.url;
        link.textContent = "🔗 " + source.title;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        sourcesDiv.appendChild(link);
    });

    botMessage.appendChild(sourcesDiv);
}
    }
}


// Update sidebar
function updateChatHistory() {

    const history =
        document.getElementById("chatHistory");

    history.innerHTML = "";

    chatHistory.forEach(chat => {

        const item =
            document.createElement("div");

        item.className = "chat-item";

        item.textContent = "💬 " + chat.title;

        item.onclick = function () {
            switchChat(chat.id);
        };

        history.appendChild(item);

    });

}


// New Chat
async function newChat() {

    try {

        const response =
            await fetch("/api/new-chat", {
                method: "POST"
            });

        const data = await response.json();

        currentChatId = data.chatId;

        chatHistory.push({
            id: currentChatId,
            title: "New Conversation"
        });

        updateChatHistory();

        document.getElementById("chatBox").innerHTML = `
            <div class="message bot">
                Hello! 👋 I am GK Buddy AI.<br>
                New conversation started! 🆕
            </div>
        `;

        document
            .getElementById("questionInput")
            .focus();

    } catch (error) {

        console.error("New chat error:", error);

    }

}


// Switch chat
async function switchChat(chatId) {

    currentChatId = chatId;

    try {

        const response = await fetch(`/api/chat/${chatId}`);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Chat not found");
        }

        const chatBox = document.getElementById("chatBox");

        chatBox.innerHTML = "";

        if (data.messages.length === 0) {

            addMessage(
                "Hello! 👋 I am GK Buddy AI.\nContinue asking questions!",
                "bot"
            );

            return;
        }

        data.messages.forEach(message => {

            if (message.role === "user") {

                addMessage(
                    message.content,
                    "user"
                );

            } else {

                addMessage(
                    message.content,
                    "bot"
                );

            }

        });

    } catch (error) {

        console.error("Switch chat error:", error);

        document.getElementById("chatBox").innerHTML = `
            <div class="message bot">
                Sorry, this conversation could not be loaded. 😔
            </div>
        `;

    }
}


// Suggestion buttons
function askQuestion(question) {

    document.getElementById("questionInput").value =
        question;

    sendQuestion();

}


// Enter key
function handleKey(event) {

    if (event.key === "Enter") {
        sendQuestion();
    }

}


// Dark mode
function toggleDarkMode() {

    document.body.classList.toggle("dark");

}