let selectedImage = null;
let selectedImageMimeType = null;
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
function handleImageUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    selectedImageMimeType = file.type;

    const reader = new FileReader();

    reader.onload = function () {
        selectedImage = reader.result.split(",")[1];
        alert("Image data is ready! Size: " + selectedImage.length);
        console.log("Image data ready:", selectedImage.length);
        alert("Image selected successfully! 📷");
    };

    reader.readAsDataURL(file);
}

// Send question
async function sendQuestion() {

    const input = document.getElementById("questionInput");

    const question = input.value.trim();
console.log("TEST: sendQuestion is running", question);
    if (!question) return;

    addMessage(question, "user");

    input.value = "";
    addMessage("🤔 Thinking<span class=\"dots\">...</span>", "bot");

    try {
const imageRequest = ["image", "picture", "illustration"].some(word =>
    question.toLowerCase().includes(word)
);

const photoTransformRequest =
    selectedImage &&
    selectedImageMimeType &&
    !imageRequest;

if (photoTransformRequest) {

    const imageResponse = await fetch("/api/transform-image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            prompt: question,
            image: selectedImage,
            imageMimeType: selectedImageMimeType
        })
    });

    const imageData = await imageResponse.json();

    if (!imageResponse.ok) {
        throw new Error(
            imageData.error || "Photo transformation failed."
        );
    }

    const messages = document.querySelectorAll(".message");
    const botMessage = messages[messages.length - 1];

    botMessage.innerHTML = `
        <div>✨ Here is your transformed photo:</div>
        <img
            src="${imageData.imageUrl}"
            alt="Transformed photo"
            style="max-width:100%; border-radius:12px; margin-top:10px;"
        >
    `;

    selectedImage = null;
    selectedImageMimeType = null;

    document.getElementById("imageInput").value = "";

    return;
}

if (imageRequest) {

    const imageResponse = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            prompt: question
        })
    });

    const imageData = await imageResponse.json();

    if (!imageResponse.ok) {
        throw new Error(
            imageData.error || "Image generation failed."
        );
    }

    const messages = document.querySelectorAll(".message");
    const botMessage = messages[messages.length - 1];

    botMessage.innerHTML = `
        <div>🎨 Here is your generated image:</div>
        <img
            src="${imageData.imageUrl}"
            alt="Generated image"
            style="max-width:100%; border-radius:12px; margin-top:10px;"
        >
    `;

    return;
}
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