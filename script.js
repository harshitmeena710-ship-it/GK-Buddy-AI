
const SUPABASE_URL = "https://iuhwntsgaaynvioyweiq.supabase.co";
let selectedImage = null;
let selectedImageMimeType = null;
let guestChatHistory = [];
// Image upload state
function handleImageUpload(event) {
    const input = event.target;
    const file = input.files && input.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        input.value = "";
        return;
    }

    const previewContainer = document.getElementById("imagePreview");
    const previewImage = document.getElementById("previewImage");

    if (!previewContainer || !previewImage) {
        console.error("Image preview elements were not found.");
        alert("Image preview is unavailable. Please refresh the page.");
        input.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        if (typeof reader.result !== "string") {
            alert("Could not read the selected image. Please try again.");
            return;
        }

        const commaIndex = reader.result.indexOf(",");

        if (commaIndex === -1) {
            alert("The selected image could not be processed.");
            return;
        }

        selectedImage = reader.result.slice(commaIndex + 1);
        selectedImageMimeType = file.type;

        previewImage.src = reader.result;
        previewContainer.style.display = "flex";

        console.log("Image uploaded and preview displayed:", file.name);
    };

    reader.onerror = function () {
        console.error("Failed to read selected image.");
        alert("Could not read the selected image. Please try again.");
        removeSelectedImage();
    };

    reader.readAsDataURL(file);
}

function removeSelectedImage() {
    selectedImage = null;
    selectedImageMimeType = null;

    const input = document.getElementById("imageInput");
    const previewContainer = document.getElementById("imagePreview");
    const previewImage = document.getElementById("previewImage");

    if (input) {
        input.value = "";
    }

    if (previewImage) {
        previewImage.removeAttribute("src");
    }

    if (previewContainer) {
        previewContainer.style.display = "none";
    }
}
// Supabase browser client
// Replace the placeholder with your PUBLIC publishable/anon key.
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ODSCkw1QIhe-qa50404lGA_179KiztE";

if (!window.supabase) {
    throw new Error("Supabase JavaScript library is not loaded.");
}


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

let currentChatId = null;

async function authenticatedFetch(url, options = {}) {
    const sendRequest = async (token) => {
        const headers = new Headers(options.headers || {});

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        } else {
            headers.delete("Authorization");
        }

        return fetch(url, {
            ...options,
            headers
        });
    };

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        throw error;
    }

    let response = await sendRequest(session?.access_token);

    if (response.status !== 401) {
        return response;
    }

    const {
        data: { session: refreshedSession },
        error: refreshError
    } = await supabaseClient.auth.refreshSession();

    if (refreshError || !refreshedSession?.access_token) {
        throw new Error(
            "Your session could not be refreshed. Please sign out and sign in again."
        );
    }

    return sendRequest(refreshedSession.access_token);
}

function addMessage(content, sender) {
    const chatBox = document.getElementById("chatBox");
    if (!chatBox) return null;

    const message = document.createElement("div");
    message.className = `message ${sender}`;

    if (sender === "user") {
        message.textContent = content;
    } else {
        message.innerHTML = content;
    }

    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;

    return message;
}

console.log("Supabase library loaded:", !!window.supabase);
console.log("Supabase URL configured:", !!SUPABASE_URL);

// Selected image state


const imageCreationPhrases = [
    "create an image", "create image", "make an image",
    "generate an image", "generate image", "draw an image",
    "make a picture", "create a picture", "generate a picture",
    "create a photo", "generate a photo", "make a photo",
    "create artwork", "generate artwork", "make artwork",
    "create digital art", "generate digital art",
    "create an illustration", "generate an illustration",
    "create a drawing", "generate a drawing",
    "create a painting", "generate a painting",
    "make me an image", "make me a picture", "make me a photo",
    "i want an image", "i want a picture", "i want a photo",
    "i need an image", "i need a picture", "i need a photo",
    "please create an image", "please make an image",
    "please generate an image", "please draw an image",
    "create image of", "generate image of", "draw image of",
    "make image of", "create a picture of", "make a picture of",
    "generate a picture of", "create a photo of",
    "generate a photo of", "draw a picture of",
    "design an image", "design a picture", "design a poster",
    "create a poster", "generate a poster", "make a poster",
    "create a portrait", "generate a portrait", "draw a portrait",
    "create a wallpaper", "generate a wallpaper",
    "make a wallpaper", "create a background",
    "generate a background", "make a background",
    "create a thumbnail", "generate a thumbnail",
    "create a banner", "generate a banner",
    "make a banner", "create a logo", "generate a logo",
    "make a logo", "visualize this idea", "illustrate this idea",
    "turn my idea into an image", "bring this idea to life",
    "create a new image", "generate a new image",
    "create something visual", "make something artistic",
    "image banao", "photo banao", "tasveer banao",
    "tasvir banao", "chitra banao", "image bana do",
    "photo bana do", "tasveer bana do", "tasvir bana do",
    "picture bana do", "chitra bana do", "image bana",
    "photo bana", "tasveer bana", "chitra bana",
    "image create karo", "photo create karo",
    "image generate karo", "photo generate karo",
    "ek image banao", "ek photo banao", "ek tasveer banao",
    "ek tasvir banao", "ek chitra banao",
    "mujhe image chahiye", "mujhe photo chahiye",
    "mujhe tasveer chahiye", "mere liye image banao",
    "mere liye photo banao", "mere liye tasveer banao",
    "image bana ke do", "photo bana ke do",
    "tasveer bana ke do", "image bana kar do",
    "photo bana kar do", "ek image bana do",
    "ek photo bana do", "ek tasveer bana do",
    "इमेज बनाओ", "फोटो बनाओ", "तस्वीर बनाओ", "चित्र बनाओ",
    "इमेज बना दो", "फोटो बना दो", "तस्वीर बना दो", "चित्र बना दो",
    "एक इमेज बनाओ", "एक फोटो बनाओ", "एक तस्वीर बनाओ",
    "एक चित्र बनाओ", "मेरे लिए फोटो बनाओ",
    "मेरे लिए इमेज बनाओ", "मुझे फोटो चाहिए",
    "मुझे तस्वीर चाहिए", "मुझे चित्र चाहिए",
    "फोटो तैयार करो", "तस्वीर तैयार करो", "चित्र तैयार करो"
];

const photoTransformCommands = [
    "transform", "transformation", "change", "edit", "modify",
    "convert", "turn into", "turn it into", "make it",
    "make this", "make my photo", "make my picture",
    "change it to", "change it into", "convert it to",
    "convert it into", "transform it into", "transform my photo",
    "edit my photo", "edit this photo", "edit this image",
    "restyle", "re-style", "apply a style", "apply style",
    "in the style of", "style it as", "style this as",
    "give it a", "give this a", "make the photo",
    "make the image", "make the picture", "recreate",
    "reimagine", "remake", "retouch", "enhance",
    "improve this photo", "improve this image",
    "make it look like", "make this look like",
    "change the style", "change its style", "new style",
    "photo ko", "photo ko badlo", "photo badal do",
    "photo change karo", "photo edit karo", "photo ko edit karo",
    "image ko", "image badal do", "image change karo",
    "image edit karo", "tasveer ko", "tasveer badal do",
    "tasveer edit karo", "isko", "is photo ko",
    "is image ko", "is tasveer ko", "ise bana do",
    "isko bana do", "aisa bana do", "aisi bana do",
    "style mein banao", "style me banao", "jaisa bana do",
    "jaise bana do", "mein badal do", "me badal do",
    "में बदल दो", "जैसा बना दो", "जैसी बना दो",
    "फोटो बदल दो", "फोटो एडिट करो", "इमेज बदल दो",
    "तस्वीर बदल दो", "इस फोटो को", "इस तस्वीर को",
    "इस इमेज को", "इसे बना दो", "ऐसा बना दो",
    "ऐसी बना दो", "स्टाइल में बनाओ", "स्टाइल में बदलो"
];

 // Send question — restore the missing function wrapper and setup
async function sendQuestion() {
    const input = document.getElementById("questionInput");
    if (!input) return;

    const question = input.value.trim();
    const submittedImage = selectedImage;
    const submittedImageMimeType = selectedImageMimeType;

    if (!question) return;

    if (submittedImage) {
        const chatBox = document.getElementById("chatBox");
        const message = document.createElement("div");
        message.className = "message user";

        if (question) {
            const text = document.createElement("div");
            text.textContent = question;
            message.appendChild(text);
        }

        const img = document.createElement("img");
        img.src = "data:" + submittedImageMimeType + ";base64," + submittedImage;
        img.style.maxWidth = "220px";
        img.style.maxHeight = "220px";
        img.style.objectFit = "contain";
        img.style.borderRadius = "12px";
        img.style.display = "block";
        img.style.marginTop = question ? "8px" : "0";

        message.appendChild(img);
        chatBox.appendChild(message);
        chatBox.scrollTop = chatBox.scrollHeight;

        removeSelectedImage();
    } else {
        addMessage(question, "user");
    }

    input.value = "";

    addMessage(
        '🤔 Thinking<span class="dots">...</span>',
        "bot"
    );

    try {
        const normalizedQuestion = question
            .toLowerCase()
            .replace(/[’‘]/g, "'")
            .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
            .replace(/\s+/g, " ")
            .trim();

        // Restore the image-style matching declarations.
        const imageStyleKeywords = [
            "retro", "vintage", "luxury", "ghibli", "anime",
            "manga", "cartoon", "realistic", "photorealistic",
            "cinematic", "cyberpunk", "fantasy", "surreal",
            "dreamy", "minimalist", "elegant", "glamorous",
            "watercolor", "oil painting", "pencil sketch",
            "pixel art", "digital painting", "concept art",
            "3d render", "black and white", "monochrome",
            "golden hour", "soft lighting", "fashion photography",
            "portrait photography", "studio lighting", "art deco",
            "glassmorphism", "neon", "futuristic", "royal",
            "storybook", "medieval", "renaissance", "mughal miniature"
        ];

        const imageCommandStarts = [
            "create", "make", "generate", "draw", "design",
            "show me", "please create", "please make",
            "please generate", "please draw"
        ];

        const imageCommandObjects = [
            "image", "picture", "photo", "art", "artwork",
            "illustration", "drawing", "painting", "poster",
            "portrait", "wallpaper", "background", "logo",
            "thumbnail", "banner", "digital art"
        ];

        const generatedImageCommands = [
            ...imageCommandStarts,
            ...imageCommandStarts.flatMap(start =>
                imageCommandObjects.map(object => `${start} ${object}`)
            ),
            ...imageStyleKeywords.flatMap(style => [
                `create ${style} image`,
                `make ${style} image`,
                `generate ${style} image`,
                `draw ${style} image`,
                `create a ${style} picture`,
                `make a ${style} photo`
            ])
        ];

const photoTransformRequest =
    Boolean(submittedImage) &&
    Boolean(submittedImageMimeType) &&
    (
        photoTransformCommands.some(phrase =>
            normalizedQuestion.includes(phrase.toLowerCase())
        ) ||
        imageStyleKeywords.some(style =>
            normalizedQuestion.includes(style)
        )
    );

const imageRequest =
    !submittedImage &&
    (
        imageCreationPhrases.some(phrase =>
            normalizedQuestion.includes(phrase.toLowerCase())
        ) ||
        generatedImageCommands.some(phrase =>
            normalizedQuestion.includes(phrase.toLowerCase())
        )
    );
// VIDEO GENERATION — runs only when Video Creator is ON
if (videoGenerationMode) {
    const messages = document.querySelectorAll(".message");
    const botMessage = messages[messages.length - 1];

    try {
        botMessage.textContent = "🎬 Starting video generation...";

        // Step 1: Start the video request
        const response = await authenticatedFetch(
            "/api/generate-video",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt: question,
                    image: submittedImage || null,
                    imageMimeType: submittedImageMimeType || null,
                    duration: 10,
                    aspectRatio: "16:9"
                })
            }
        );

        const startData = await response.json();

        if (!response.ok || !startData.requestId) {
            throw new Error(
                startData.error || "Could not start video generation."
            );
        }

        // Step 2: Poll for the result, every 5 seconds
        const startedAt = Date.now();
        const timeoutMs = 4 * 60 * 1000;
        let videoUrl = null;

        while (Date.now() - startedAt < timeoutMs) {
            botMessage.textContent =
                "⏳ Creating your video... Please wait.";

            await new Promise(resolve => setTimeout(resolve, 5000));

            const statusResponse = await authenticatedFetch(
                "/api/video-status/" +
                    encodeURIComponent(startData.requestId)
            );

            const statusData = await statusResponse.json();

            if (!statusResponse.ok) {
                throw new Error(
                    statusData.error || "Could not check video status."
                );
            }

            if (statusData.status === "done" && statusData.videoUrl) {
                videoUrl = statusData.videoUrl;
                break;
            }

            if (
                statusData.status === "failed" ||
                statusData.status === "expired"
            ) {
                throw new Error(
                    statusData.error || "Video generation failed or expired."
                );
            }
        }

        if (!videoUrl) {
            throw new Error(
                "Video is taking longer than expected. Please try again."
            );
        }

        // Step 3: Display the actual generated video
        botMessage.replaceChildren();

        const heading = document.createElement("div");
        heading.textContent = "🎉 Your video is ready!";
        heading.style.marginBottom = "12px";
        botMessage.appendChild(heading);

        const video = document.createElement("video");
        video.src = videoUrl;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.style.width = "100%";
        video.style.maxWidth = "720px";
        video.style.borderRadius = "12px";
        video.style.display = "block";

        botMessage.appendChild(video);

        
const downloadLink = document.createElement("a");
downloadLink.href = "#";
downloadLink.textContent = "⬇️ Download Video";
downloadLink.style.display = "inline-block";
downloadLink.style.marginTop = "12px";

downloadLink.addEventListener("click", async (event) => {
    event.preventDefault();

    const originalText = downloadLink.textContent;
    downloadLink.textContent = "⏳ Preparing download...";
    downloadLink.style.pointerEvents = "none";

    try {
        const response = await authenticatedFetch(
            "/api/download-video?url=" +
            encodeURIComponent(videoUrl)
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                errorText || `Download failed (${response.status})`
            );
        }

        const blob = await response.blob();

        if (!blob.size) {
            throw new Error("The downloaded video file is empty.");
        }

        const objectUrl = URL.createObjectURL(blob);
        const tempLink = document.createElement("a");

        tempLink.href = objectUrl;
        tempLink.download = "zorvexa-video.mp4";
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();

        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);

        downloadLink.textContent = "✅ Download started";
    } catch (error) {
        console.error("Video download error:", error);
        downloadLink.textContent = "❌ Download failed";
        alert("Could not download the video: " + error.message);
    } finally {
        downloadLink.style.pointerEvents = "";
        if (downloadLink.textContent === "⏳ Preparing download...") {
            downloadLink.textContent = originalText;
        }
    }
});

botMessage.appendChild(downloadLink);

        botMessage.appendChild(downloadLink);

    } catch (videoError) {
        console.error("Video generation error:", videoError);
        botMessage.textContent =
            "❌ " + (videoError.message || "Video generation failed.");
    }

    return;
}

        // PHOTO TRANSFORMATION
        if (photoTransformRequest) {

            const imageResponse = await authenticatedFetch(
    "/api/transform-image",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        prompt: question,
                        image: submittedImage,
imageMimeType: submittedImageMimeType
                    })
                }
            );

            const imageData =
                await imageResponse.json();

            if (!imageResponse.ok) {
                throw new Error(
                    imageData.error ||
                    "Photo transformation failed."
                );
            }

            const messages =
                document.querySelectorAll(".message");

            const botMessage =
                messages[messages.length - 1];

               botMessage.innerHTML = `
    div>✨ Here is your transformed photo:</div>

    <img
        src="${imageData.imageUrl}"
        alt="Transformed photo"
        style="max-width:100%; border-radius:12px; margin-top:10px;"
    >

    <br>

    <a
        href="${imageData.imageUrl}"
        download="gk-buddy-transformed-image.jpg"
        target="_self"
        style="display:inline-block; margin-top:10px;"
    >
        ⬇️ Download Image
    </a>
`;

            selectedImage = null;
            selectedImageMimeType = null;

            document.getElementById("imageInput").value = "";

            return;
        }


        // IMAGE GENERATI<ON
        
        if (imageRequest) {

            const imageResponse = await authenticatedFetch(
    "/api/generate-image",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        prompt: question
                    })
                }
            );

            const imageData =
                await imageResponse.json();

            if (!imageResponse.ok) {
                throw new Error(
                    imageData.error ||
                    "Image generation failed."
                );
            }

            const messages =
                document.querySelectorAll(".message");

            const botMessage =
                messages[messages.length - 1];

           botMessage.innerHTML = `
    <div>🎨 Here is your generated image:</div>

    <img
        src="${imageData.imageUrl}"
        alt="Generated image"
        style="max-width:100%; border-radius:12px; margin-top:10px;"
    >

    <br>

    <a
        href="${imageData.imageUrl}"
        download="gk-buddy-generated-image.jpg"
        target="_self"
        style="display:inline-block; margin-top:10px;"
    >
        ⬇️ Download Image
    </a>
`;

            return;
        }

        // NORMAL AI CHAT
        console.log("TEST: ABOUT TO CALL /api/ask");
console.log("Text question:", question);
console.log("TEST: Sending request to", window.location.origin + "/api/ask");
        const response = await authenticatedFetch(
    "/api/ask",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: question,
                    chatId: currentChatId,
                    image: submittedImage,
imageMimeType: submittedImageMimeType,
                     intelligentUI: intelligentUIMode
                })
            }
        );

        console.log(
            "TEST: /api/ask RESPONSE RECEIVED",
            response.status
        );
console.log("Text API request succeeded:", response.ok);
        const data =
            await response.json();
if (data.chatId) {
    currentChatId = data.chatId;
}

        const messages =
            document.querySelectorAll(".message");

        const botMessage =
            messages[messages.length - 1];

        

const answer = data.answer || data.response || "No answer received.";

if (intelligentUIMode && typeof renderIntelligentAnswer === "function") {
    renderIntelligentAnswer(botMessage, data.visualAnswer || answer, {
        generatedVisuals: data.generatedVisuals || [],
        generatedVisual: data.generatedVisual || null,
        visualImages: Array.isArray(data.visualImages) ? data.visualImages : []
    });
} else {
    botMessage.textContent = answer;
}


if (window.isGuestMode && currentChatId) {
    let guestChat = guestChatHistory.find(
        chat => chat.chatId === currentChatId
    );

    if (!guestChat) {
        guestChat = {
            chatId: currentChatId,
            title: question.slice(0, 35) || "New Chat",
            messages: []
        };

        guestChatHistory.unshift(guestChat);
    }

    guestChat.messages.push(
        { role: "user", content: question },
        {
            role: "assistant",
            content: data.answer || data.response || "No answer received."
        }
    );

    await loadChatHistory();
} else {
    await loadChatHistory();
}
  } catch (error) {
    console.error("sendQuestion error:", error);

    const messageElements = document.querySelectorAll(".message");
    const botMessage = messageElements[messageElements.length - 1];

    if (botMessage) {
        botMessage.textContent = "Sorry, something went wrong. 😔";
    }
}
}
 // Switch chat
async function switchChat(chatId) {
    currentChatId = chatId;

    // Load guest conversations from the temporary browser list.
    if (window.isGuestMode) {
        const chat = guestChatHistory.find(
            item => item.chatId === chatId
        );

        if (!chat) {
            console.error("Guest conversation not found:", chatId);
            return;
        }

        const chatBox = document.getElementById("chatBox");
        chatBox.querySelectorAll(".message").forEach(message => message.remove());

        if (!chat.messages || chat.messages.length === 0) {
            addMessage(
                "Hello! 👋 I am Zorvexa AI.\nContinue asking questions!",
                "bot"
            );
            return;
        }

        chat.messages.forEach(message => {
            addMessage(
                message.content,
                message.role === "user" ? "user" : "bot"
            );
        });

        return;
    }

    // Registered users continue to load saved conversations.
    try {
        const response = await authenticatedFetch(
            `/api/chat/${encodeURIComponent(chatId)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Chat not found");
        }

        const chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = "";

        if (!data.messages || data.messages.length === 0) {
            addMessage(
                "Hello! 👋 I am Zorvexa AI.\nContinue asking questions!",
                "bot"
            );
            return;
        }

        data.messages.forEach(message => {
            addMessage(
                message.content,
                message.role === "user" ? "user" : "bot"
            );
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
// Suggestion buttons

function askQuestion(question) {
    const input = document.getElementById("questionInput");

    if (!input) {
        alert("Chat input is missing. Please refresh the page.");
        return;
    }

    input.value = question;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    sendQuestion();
}


// Enter key
// Enter key and multiline prompt handling
function handleKey(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendQuestion();
    }
}

// Automatically resize the prompt box
function autoResizeQuestionInput(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 180) + "px";
}

let intelligentUIMode = false;
let videoGenerationMode = false;

function toggleVideoGenerationMode() {
    videoGenerationMode = !videoGenerationMode;

    const button = document.getElementById("videoGenerationToggle");

    if (!button) {
        console.error("Video Generation button not found");
        return;
    }

    button.setAttribute("aria-pressed", String(videoGenerationMode));
    button.classList.toggle("active", videoGenerationMode);

    console.log(
        "Video Generation Mode:",
        videoGenerationMode ? "ON" : "OFF"
    );

    if (typeof showToast === "function") {
        showToast(
            videoGenerationMode
                ? "Video Generation Mode enabled"
                : "Video Generation Mode disabled"
        );
    }
}
function toggleIntelligentUI() {
    intelligentUIMode = !intelligentUIMode;

    const button = document.getElementById("intelligentUiToggle");
    if (!button) {
        console.error("Intelligent UI button not found");
        return;
    }

    button.setAttribute("aria-pressed", String(intelligentUIMode));
    button.classList.toggle("active", intelligentUIMode);

    console.log(
        "Intelligent UI:",
        intelligentUIMode ? "ON" : "OFF"
    );

    if (typeof showToast === "function") {
        showToast(
            intelligentUIMode
                ? "Intelligent UI enabled"
                : "Intelligent UI disabled"
        );
    } else {
        alert(
            intelligentUIMode
                ? "Intelligent UI is ON"
                : "Intelligent UI is OFF"
        );
    }
}


// Dark mode
function toggleDarkMode() {

    document.body.classList.toggle("dark");

}

async function newChat() {
    // Guests start a fresh temporary chat without logging in.
    if (window.isGuestMode) {
        currentChatId = null;

        const chatBox = document.getElementById("chatBox");
        if (chatBox) {
    chatBox.innerHTML = `
        <div class="welcome-screen">
            <div class="welcome-icon" aria-hidden="true"></div>
            <div class="welcome-content">
                <span class="welcome-eyebrow">YOUR PERSONAL AI ASSISTANT</span>
                <h2 id="welcomeTitle">Intelligence, beautifully simple.</h2>
                <p>Ask anything, discover new ideas, create images, and explore a world of knowledge.</p>
            </div>
            <div class="welcome-features">
                <button type="button" class="welcome-feature"
                    onclick="askQuestion('Explain the Indian Constitution in simple words')">
                    <span class="feature-icon">◇</span>
                    <span class="feature-text"><strong>Indian Constitution</strong><small>Understand the fundamentals</small></span>
                    <span class="feature-arrow">↗️</span>

<button
    type="button"
    class="welcome-feature intelligent-ui-feature"
    id="intelligentUiToggle"
    aria-pressed="false"
    onclick="toggleIntelligentUI()"
>
    <span class="feature-icon">✦</span>
    <span class="feature-text">
        <strong>Intelligent UI <small class="intelligent-ui-new">NEW</small></strong>
        <small>Explore smart, interactive AI answers</small>
    </span>
    <span class="feature-arrow">↗️</span>
</button>

                </button>
                <button type="button" class="welcome-feature"
                    onclick="askQuestion('Explain photosynthesis with examples')">
                    <span class="feature-icon">✳️</span>
                    <span class="feature-text"><strong>Explore Science</strong><small>Discover how the world works</small></span>
                    <span class="feature-arrow">↗️</span>
                </button>
                <button type="button" class="welcome-feature"
                    onclick="askQuestion('Give me an interesting general knowledge quiz')">
                    <span class="feature-icon">◎</span>
                    <span class="feature-text"><strong>Knowledge Quiz</strong><small>Challenge your knowledge</small></span>
                    <span class="feature-arrow">↗️</span>
                </button>
                <button type="button" class="welcome-feature"
                    onclick="askQuestion('Give me some creative ideas for a new project')">
                    <span class="feature-icon">✧</span>
                    <span class="feature-text"><strong>Creative Ideas</strong><small>Turn inspiration into action</small></span>
                    <span class="feature-arrow">↗️</span>
                </button>
            </div>
        </div>
    `;
}

        const historyBox = document.getElementById("chatHistory");
        if (historyBox) {
            historyBox.innerHTML = "";
        }

        return;
    }

    // Registered users continue to use saved chats.
    try {
        const response = await authenticatedFetch("/api/new-chat", {
            method: "POST"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not create new chat");
        }

        currentChatId = data.chatId;

        
document.getElementById("chatBox").innerHTML = `
    <div class="welcome-screen">
        <div class="welcome-icon" aria-hidden="true"></div>

        <div class="welcome-content">
            <span class="welcome-eyebrow">YOUR PERSONAL AI ASSISTANT</span>
            <h2 id="welcomeTitle">Intelligence, beautifully simple.</h2>
            <p>
                Ask anything, discover new ideas, create images,
                and explore a world of knowledge.
            </p>
        </div>

        
<div class="welcome-features">

    <button
        type="button"
        class="welcome-feature intelligent-ui-feature"
        id="intelligentUiToggle"
        aria-pressed="false"
        onclick="toggleIntelligentUI()"
    >
        <span class="feature-icon">✦</span>
        <span class="feature-text">
            <strong>Intelligent UI <small class="intelligent-ui-new">NEW</small></strong>
            <small>Explore smart, interactive AI answers</small>
        </span>
        <span class="feature-arrow">↗️</span>
    </button>

    <button
        type="button"
        class="welcome-feature"
        id="videoGenerationToggle"
        aria-pressed="false"
        onclick="toggleVideoGenerationMode()"
    >
        <span class="feature-icon">🎬</span>
        <span class="feature-text">
            <strong>Video Generation</strong>
            <small>Create videos from your ideas</small>
        </span>
        <span class="feature-arrow">↗️</span>
    </button>

    <button
        type="button"
        class="welcome-feature"
        onclick="askQuestion('Explain the Indian Constitution in simple words')"
    >
        <span class="feature-icon">◇</span>
        <span class="feature-text">
            <strong>Indian Constitution</strong>
            <small>Understand the fundamentals</small>
        </span>
        <span class="feature-arrow">↗️</span>
    </button>

    <button
        type="button"
        class="welcome-feature"
        onclick="askQuestion('Explain photosynthesis with examples')"
    >
        <span class="feature-icon">✳️</span>
        <span class="feature-text">
            <strong>Explore Science</strong>
            <small>Discover how the world works</small>
        </span>
        <span class="feature-arrow">↗️</span>
    </button>

    <button
        type="button"
        class="welcome-feature"
        onclick="askQuestion('Give me an interesting general knowledge quiz')"
    >
        <span class="feature-icon">◎</span>
        <span class="feature-text">
            <strong>Knowledge Quiz</strong>
            <small>Challenge your knowledge</small>
        </span>
        <span class="feature-arrow">↗️</span>
    </button>

    <button
        type="button"
        class="welcome-feature"
        onclick="askQuestion('Give me some creative ideas for a new project')"
    >
        <span class="feature-icon">✧</span>
        <span class="feature-text">
            <strong>Creative Ideas</strong>
            <small>Turn inspiration into action</small>
        </span>
        <span class="feature-arrow">↗️</span>
    </button>

</div>
    </div>
`;
const intelligentButton = document.getElementById("intelligentUiToggle");
intelligentButton?.classList.toggle("active", intelligentUIMode);


        await loadChatHistory();

    } catch (error) {
        console.error("New chat error:", error);
    }
}

async function loadChatHistory() {
    const historyBox = document.getElementById("chatHistory");

    if (window.isGuestMode) {
    historyBox.innerHTML = "";

    guestChatHistory.forEach(chat => {
        const chatItem = document.createElement("div");
        chatItem.className = "chat-history-item";

        const title = document.createElement("span");
        title.textContent = chat.title || "New Chat";
        title.style.cursor = "pointer";
        title.style.flex = "1";
        title.onclick = () => switchChat(chat.chatId);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "🗑️";
        deleteButton.title = "Delete this chat";
        deleteButton.setAttribute("aria-label", "Delete this chat");

        deleteButton.onclick = (event) => {
            event.stopPropagation();

            const confirmed = confirm(
                "Delete this temporary conversation?"
            );

            if (!confirmed) return;

            guestChatHistory = guestChatHistory.filter(
                item => item.chatId !== chat.chatId
            );

            if (currentChatId === chat.chatId) {
                currentChatId = null;

                const chatBox = document.getElementById("chatBox");
                if (chatBox) {
                    chatBox.innerHTML = `
                        <div class="message bot">
                            Conversation deleted. Start a new chat!
                        </div>
                    `;
                }
            }

            loadChatHistory();
        };

        chatItem.style.display = "flex";
        chatItem.style.alignItems = "center";
        chatItem.style.gap = "8px";

        chatItem.appendChild(title);
        chatItem.appendChild(deleteButton);
        historyBox.appendChild(chatItem);
    });

    return;
}

    try {
        const response = await authenticatedFetch("/api/chats");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not load chats");
        }

        const historyBox = document.getElementById("chatHistory");
        historyBox.innerHTML = "";

       data.chats.forEach(chat => {
            const chatItem = document.createElement("div");
            chatItem.className = "chat-history-item";

            const title = document.createElement("span");
            title.textContent = chat.title || "New Chat";
            title.style.cursor = "pointer";
            title.style.flex = "1";
            title.onclick = () => switchChat(chat.chatId);

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "🗑️";
            deleteButton.title = "Delete this chat";
            deleteButton.setAttribute(
                "aria-label",
                "Delete chat: " + (chat.title || "New Chat")
            );

            deleteButton.onclick = async (event) => {
                event.stopPropagation();

                const confirmed = confirm(
                    "Delete this conversation permanently?"
                );

                if (!confirmed) return;

                try {
                    const response = await authenticatedFetch(
    `/api/chats/${encodeURIComponent(chat.chatId)}`,
    { method: "DELETE" }
);

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.error || "Could not delete chat");
                    }

                    if (currentChatId === chat.chatId) {
                        currentChatId = null;
                        document.getElementById("chatBox").innerHTML = `
                            <div class="message bot">
                                Conversation deleted. Start a new chat!
                            </div>
                        `;
                    }

                    await loadChatHistory();
                } catch (error) {
                    console.error("Delete chat error:", error);
                    
                }
            };

            chatItem.style.display = "flex";
            chatItem.style.alignItems = "center";
            chatItem.style.gap = "8px";

            chatItem.appendChild(title);
            chatItem.appendChild(deleteButton);
            historyBox.appendChild(chatItem);
        });

    } catch (error) {
        console.error("Load chat history error:", error);
    }
}

window.addEventListener("load", async () => {
    document.querySelector(".app").style.display = "none";
    authScreen.style.display = "flex";

    const { data: { session } } =
        await supabaseClient.auth.getSession();

    if (session) {
        authScreen.style.display = "none";
        document.querySelector(".app").style.display = "flex";
        await loadChatHistory();
    }
});

function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const button = document.getElementById("sidebarToggle");
    const overlay = document.getElementById("sidebarOverlay");

    const willOpen = sidebar.classList.contains("sidebar-hidden");

    sidebar.classList.toggle("sidebar-hidden", !willOpen);
    button?.setAttribute("aria-expanded", String(willOpen));

    const isMobile = window.matchMedia("(max-width: 620px)").matches;

    if (overlay) {
        overlay.classList.toggle("is-visible", isMobile && willOpen);
        overlay.setAttribute("aria-hidden", String(!isMobile || !willOpen));
    }
}

function closeSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const button = document.getElementById("sidebarToggle");
    const overlay = document.getElementById("sidebarOverlay");

    if (!sidebar) return;

    sidebar.classList.add("sidebar-hidden");
    button?.setAttribute("aria-expanded", "false");

    if (overlay) {
        overlay.classList.remove("is-visible");
        overlay.setAttribute("aria-hidden", "true");
    }
}

let authMode = "login";

const authScreen = document.getElementById("authScreen");
const authForm = document.getElementById("authForm");
const authMessage = document.getElementById("authMessage");
const authSubmit = document.getElementById("authSubmit");

document.getElementById("loginTab").addEventListener("click", () => {
    authMode = "login";
    authSubmit.textContent = "Login";
    authMessage.textContent = "";
});

document.getElementById("signupTab").addEventListener("click", () => {
    authMode = "signup";
    authSubmit.textContent = "Create Account";
    authMessage.textContent = "";
});

const continueGuestButton = document.getElementById("continueGuestButton");

continueGuestButton.addEventListener("click", async () => {
    authScreen.style.display = "none";
    document.querySelector(".app").style.display = "flex";

    window.isGuestMode = true;

    // Clear the guest chat selection.
    window.currentChatId = null;

    // Clear the chat history sidebar so it doesn't show saved chats.
    const chatHistory = document.getElementById("chatHistory");
    if (chatHistory) {
        chatHistory.innerHTML = "";
    }

    // Show the welcome screen for guest users.
await newChat();
});
authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;

    authSubmit.disabled = true;
    authMessage.textContent = "Please wait...";

    try {
        if (authMode === "signup") {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password
            });

            if (error) throw error;

            
if (data.session) {
    authMessage.textContent = "Account created successfully!";
    authScreen.style.display = "none";
    document.querySelector(".app").style.display = "flex";
    await loadChatHistory();
} else {
    authMessage.textContent =
        "Please check your email to confirm your account, then log in.";

    authMode = "login";
    authSubmit.textContent = "Login";
}

        } else {
            const { error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            authMessage.textContent = "Login successful!";
authScreen.style.display = "none";
document.querySelector(".app").style.display = "flex";
await loadChatHistory();
        }
    } catch (error) {
        authMessage.textContent = error.message || "Authentication failed.";
    } finally {
        authSubmit.disabled = false;
    }
});

async function logoutUser() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert("Could not log out: " + error.message);
        return;
    }

    document.querySelector(".app").style.display = "none";
    authScreen.style.display = "flex";
    authForm.reset();
    authMessage.textContent = "You have logged out successfully.";
}
// Voice input using browser speech recognition
let voiceRecognition = null;
let isVoiceListening = false;

function toggleVoiceInput() {
    const voiceButton = document.getElementById("voiceButton");
    const questionInput = document.getElementById("questionInput");

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice input is not supported by this browser. Please try Google Chrome.");
        return;
    }

    if (isVoiceListening && voiceRecognition) {
        voiceRecognition.stop();
        return;
    }

    voiceRecognition = new SpeechRecognition();
    voiceRecognition.lang = "en-IN";
    voiceRecognition.continuous = false;
    voiceRecognition.interimResults = false;

    voiceRecognition.onstart = () => {
        isVoiceListening = true;
        voiceButton.textContent = "🔴";
        voiceButton.title = "Stop voice input";
    };

    voiceRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;

        questionInput.value = (
            questionInput.value.trim()
                ? questionInput.value.trim() + " "
                : ""
        ) + transcript;

        autoResizeQuestionInput(questionInput);
        questionInput.focus();
    };

    voiceRecognition.onerror = (event) => {
        console.error("Voice input error:", event.error);
    };

    voiceRecognition.onend = () => {
        isVoiceListening = false;
        voiceButton.textContent = "🎙️";
        voiceButton.title = "Voice input";
        voiceButton.setAttribute("aria-label", "Start voice input");
    };

    voiceRecognition.start();
}

let realtimePeerConnection = null;
let realtimeDataChannel = null;
let realtimeAudioElement = null;
let realtimeVoiceActive = false;

async function toggleRealtimeVoice() {
    if (realtimeVoiceActive) {
        stopRealtimeVoice();
        return;
    }

    const button = document.getElementById("voiceModeButton");

    try {
        button.disabled = true;
        button.textContent = "Connecting...";

        // Ask our server for a short-lived voice credential.
        const sessionResponse = await authenticatedFetch(
            "/api/voice-session",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            }
        );

        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok || !sessionData.value) {
            throw new Error(
                sessionData.error || "Could not create voice session."
            );
        }

        // Request microphone access.
        if (
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== "function"
) {
    throw new Error(
        "Microphone access requires HTTPS on mobile. Open ZORVEXA AI using a secure HTTPS connection and allow microphone access."
    );
}

const microphoneStream =
    await navigator.mediaDevices.getUserMedia({ audio: true });

        realtimePeerConnection = new RTCPeerConnection();

        realtimeAudioElement = document.createElement("audio");
        realtimeAudioElement.autoplay = true;
        realtimeAudioElement.playsInline = true;
        document.body.appendChild(realtimeAudioElement);

        realtimePeerConnection.ontrack = (event) => {
            realtimeAudioElement.srcObject = event.streams[0];
            realtimeAudioElement.play().catch(console.error);
        };

        microphoneStream.getTracks().forEach(track => {
            realtimePeerConnection.addTrack(track, microphoneStream);
        });

        realtimeDataChannel =
            realtimePeerConnection.createDataChannel("oai-events");

        realtimeDataChannel.onopen = () => {
            realtimeVoiceActive = true;
            button.disabled = false;
            button.textContent = "⏹ End Voice";
            button.title = "End Voice Mode";
        };

        realtimeDataChannel.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "error") {
                console.error("Realtime voice error:", message.error);
            }
        };

        const offer = await realtimePeerConnection.createOffer();
        await realtimePeerConnection.setLocalDescription(offer);

        const realtimeResponse = await fetch(
            "https://api.openai.com/v1/realtime/calls",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sessionData.value}`,
                    "Content-Type": "application/sdp"
                },
                body: offer.sdp
            }
        );

        if (!realtimeResponse.ok) {
            throw new Error(
                "Realtime connection failed: HTTP " +
                realtimeResponse.status
            );
        }

        const answerSdp = await realtimeResponse.text();

        await realtimePeerConnection.setRemoteDescription({
            type: "answer",
            sdp: answerSdp
        });

    } catch (error) {
        console.error("Voice mode error:", error);
        alert("Could not start Voice Mode: " + error.message);
        stopRealtimeVoice();
    } finally {
        button.disabled = false;

        if (!realtimeVoiceActive) {
            button.textContent = "🎙️ Voice Mode";
        }
    }
}

function stopRealtimeVoice() {
    if (realtimeDataChannel) {
        realtimeDataChannel.close();
        realtimeDataChannel = null;
    }

    if (realtimePeerConnection) {
        realtimePeerConnection.getSenders().forEach(sender => {
            if (sender.track) {
                sender.track.stop();
            }
        });

        realtimePeerConnection.close();
        realtimePeerConnection = null;
    }

    if (realtimeAudioElement) {
        realtimeAudioElement.pause();
        realtimeAudioElement.srcObject = null;
        realtimeAudioElement.remove();
        realtimeAudioElement = null;
    }

    realtimeVoiceActive = false;

    const button = document.getElementById("voiceModeButton");

    if (button) {
        button.disabled = false;
        button.textContent = "🎙️ Voice Mode";
        button.title = "Start Voice Mode";
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("sidebarOverlay");

    if (overlay) {
        overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
        closeSidebar();
    }
});
    }
});
// Fix: close the mobile sidebar when tapping outside it.
document.addEventListener("click", function (event) {
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.getElementById("sidebarToggle");

    if (!sidebar || !toggleButton) return;

    const isMobile = window.matchMedia("(max-width: 620px)").matches;
    const sidebarIsOpen = !sidebar.classList.contains("sidebar-hidden");

    if (!isMobile || !sidebarIsOpen) return;

    if (
        !sidebar.contains(event.target) &&
        !toggleButton.contains(event.target)
    ) {
        closeSidebar();
    }
});



function renderIntelligentAnswer(element, answer, options = {}) {
    if (!element) return;

    element.replaceChildren();

    const content = document.createElement("div");
    content.className = "intelligent-answer-content";

    const text = String(answer || "No answer received.");
    const lines = text.split("\n");

    let currentList = null;
    let ingredientSection = false;
    let stepNumber = 0;

    function finishList() {
        currentList = null;
        ingredientSection = false;
    }

    function addParagraph(value) {
        const paragraph = document.createElement("p");
        paragraph.textContent = value;
        content.appendChild(paragraph);
    }

    function addImage(index) {
        const item = options.generatedVisuals?.[index - 1];
        const src = typeof item === "string"
            ? item
            : item?.dataUrl || item?.url || item?.src;

        if (!src || !/^(data:image\/|https?:\/\/)/i.test(src)) return;

        const figure = document.createElement("figure");
        figure.className = "intelligent-inline-visual";

        const image = document.createElement("img");
        image.src = src;
        image.alt = item?.description || "Illustration for this section";
        image.loading = "lazy";

        figure.appendChild(image);

        if (item?.description) {
            const caption = document.createElement("figcaption");
            caption.textContent = item.description;
            figure.appendChild(caption);
        }

        content.appendChild(figure);
    }

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            finishList();
            continue;
        }

        const visualMatch = line.match(/^\[\[VISUAL:(\d+)\]\]$/i);

        if (visualMatch) {
            finishList();
            addImage(Number(visualMatch[1]));
            continue;
        }

        if (/^#{1,3}\s+/.test(line)) {
            finishList();

            const headingText = line.replace(/^#{1,3}\s+/, "");
            const heading = document.createElement("h3");
            heading.textContent = headingText;
            content.appendChild(heading);

            ingredientSection = /ingredient|materials|what you need/i.test(headingText);
            stepNumber = /step|method|instructions|directions/i.test(headingText) ? 0 : stepNumber;
            continue;
        }

        const bulletMatch = line.match(/^[-*]\s+(.+)$/);

        if (bulletMatch) {
            const itemText = bulletMatch[1];

            if (ingredientSection) {
                const label = document.createElement("label");
                label.className = "intelligent-ingredient";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";

                const span = document.createElement("span");
                span.textContent = itemText;

                label.append(checkbox, span);
                content.appendChild(label);
            } else {
                if (!currentList) {
                    currentList = document.createElement("ul");
                    content.appendChild(currentList);
                }

                const item = document.createElement("li");
                item.textContent = itemText;
                currentList.appendChild(item);
            }

            continue;
        }

        const numberedMatch = line.match(/^(?:\d+[.)]|step\s+\d+:?)\s*(.+)$/i);

        if (numberedMatch) {
            finishList();
            stepNumber++;

            const step = document.createElement("section");
            step.className = "intelligent-step";

            const title = document.createElement("h4");
            title.textContent = `Step ${stepNumber}`;

            const description = document.createElement("p");
            description.textContent = numberedMatch[1];

            step.append(title, description);
            content.appendChild(step);
            continue;
        }

        finishList();
        addParagraph(line);
    }

    element.appendChild(content);

    // Fallback for the existing single generated image.
    if (
        !content.querySelector(".intelligent-inline-visual") &&
        options.generatedVisual
    ) {
        addImageFromSingle(options.generatedVisual, element);
    }

    // Web images are supplementary, not a replacement for the explanation.
    // Add relevant web images between the answer sections.
// Keep the written explanation visible at all times.
if (Array.isArray(options.visualImages) && options.visualImages.length > 0) {
    const headings = Array.from(
        content.querySelectorAll("h3")
    );

    const images = options.visualImages.slice(0, 4);

    headings.forEach((heading, index) => {
        if (index >= images.length) return;

        const item = images[index];
        const url = typeof item === "string" ? item : item?.url;

        if (!url || !/^https?:\/\//i.test(url)) return;

        const figure = document.createElement("figure");
        figure.className = "intelligent-inline-visual";

        const image = document.createElement("img");
        image.src = url;
        image.alt = item?.description || heading.textContent;
        image.loading = "lazy";
        image.referrerPolicy = "no-referrer";

        figure.appendChild(image);

        const caption = document.createElement("figcaption");
        caption.textContent = item?.description || heading.textContent;
        figure.appendChild(caption);

        heading.insertAdjacentElement("afterend", figure);
    });
}
}
function addImageFromSingle(src, element) {
    if (!src || !/^(data:image\/|https?:\/\/)/i.test(src)) return;

    const figure = document.createElement("figure");
    figure.className = "intelligent-inline-visual";

    const image = document.createElement("img");
    image.src = src;
    image.alt = "AI-generated illustration";
    image.loading = "lazy";

    figure.appendChild(image);
    element.appendChild(figure);
}

function renderVisualImages(element, images) {
    if (!element || !Array.isArray(images)) return;

    const gallery = document.createElement("div");
    gallery.className = "intelligent-visual-gallery";

    const heading = document.createElement("h3");
    heading.textContent = "Related web images";
    gallery.appendChild(heading);

    images.slice(0, 4).forEach(imageData => {
        const url = typeof imageData === "string"
            ? imageData
            : imageData?.url;

        if (!url || !/^https?:\/\//i.test(url)) return;

        const card = document.createElement("article");
        card.className = "intelligent-visual-card";

        const image = document.createElement("img");
        image.src = url;
        image.alt = imageData?.description || "Related image";
        image.loading = "lazy";
        image.referrerPolicy = "no-referrer";
        image.onerror = () => card.remove();

        const caption = document.createElement("p");
        caption.textContent = imageData?.description || "Related image";

        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View image ↗";

        card.append(image, caption, link);
        gallery.appendChild(card);
    });

    if (gallery.querySelector(".intelligent-visual-card")) {
        element.appendChild(gallery);
    }
}
