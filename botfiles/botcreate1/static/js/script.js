// Core elements
const chatbotToggler = document.querySelector(".tabrobotics-chatbot-toggler");
const closeBtn = document.querySelector(".tabrobotics-close-btn");
const chatbox = document.querySelector(".tabrobotics-chatbox");
const chatInput = document.querySelector(".tabrobotics-chat-input textarea");
const sendChatBtn = document.querySelector(".tabrobotics-chat-input span");
const microphoneBtn = document.querySelector('.microphone-btn');
const chatbot = document.querySelector(".tabrobotics-chatbot");

const body = document.body;
const responseSound = document.getElementById('response-sound');
const audioElement = document.getElementById('audio-element');

let userMessage = null;
let chatbotOpened = false;
const patriciaVideo = document.getElementById('patricia-video');
const speakingVideo = document.getElementById('speaking-video');
const patricia2Video = document.getElementById('patricia2-video');

const lipsyncVideos = ['blabla.mp4', 'blabla1.mp4', 'blabla2.mp4'];

// Prevent default behavior on video elements
[patriciaVideo, speakingVideo, patricia2Video].forEach(video => {
    if (video) {
        video.addEventListener('touchstart', function(e) {
            e.preventDefault();
        });
        video.addEventListener('click', function(e) {
            e.preventDefault();
        });
    }
});

function getRandomLipsyncVideo() {
    const randomIndex = Math.floor(Math.random() * lipsyncVideos.length);
    return `/static/images/${lipsyncVideos[randomIndex]}`;
}

function playVideo(videoElement) {
    if (videoElement) {
        videoElement.style.opacity = '0';
        videoElement.style.display = 'block';
        fadeIn(videoElement, 500);
        videoElement.play().then(() => {
            console.log(`${videoElement.id} started playing`);
        }).catch(error => {
            console.error(`Error playing ${videoElement.id}:`, error);
        });
    } else {
        console.error("Video element not found");
    }
}

function fadeIn(element, duration = 200) {
    element.style.opacity = '0';
    element.style.display = 'block';
    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = Math.min(progress / duration, 1);
        if (progress < duration) {
            window.requestAnimationFrame(step);
        }
    }

    window.requestAnimationFrame(step);
}

function fadeOut(element, duration = 200, callback) {
    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = Math.max(1 - progress / duration, 0);
        if (progress < duration) {
            window.requestAnimationFrame(step);
        } else {
            element.style.display = 'none';
            if (callback) callback();
        }
    }

    window.requestAnimationFrame(step);
}

function playPatricia2Video() {
    if (patricia2Video) {
        if (speakingVideo) {
            fadeOut(speakingVideo, 200, () => {
                patricia2Video.style.display = 'block';
                patricia2Video.loop = true;
                playVideo(patricia2Video);
            });
        } else {
            patricia2Video.style.display = 'block';
            patricia2Video.loop = true;
            playVideo(patricia2Video);
        }
    } else {
        console.error("Patricia2 video element not found");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const popupChatbot = document.getElementById("tabrobotics-popup-chatbot");
    const videoContainer = document.querySelector(".tabrobotics-video-container");
    const demoPopup = document.getElementById('demo-popup');
    const loadChatbotBtn = document.getElementById('load-chatbot-btn');
    const chatbotContainer = document.querySelector('.tabrobotics-container');

    // Show the demo popup
    if (demoPopup) demoPopup.style.display = 'block';

    // Hide the chatbot container initially
    if (chatbotContainer) chatbotContainer.style.display = 'none';

    if (loadChatbotBtn) {
        loadChatbotBtn.addEventListener('click', function() {
            if (demoPopup) demoPopup.style.display = 'none';
            if (chatbotContainer) chatbotContainer.style.display = 'block';
            initializeChatbot();
        });
    }

    function initializeChatbot() {
        if (patriciaVideo) {
            patriciaVideo.style.display = 'block';
            playVideo(patriciaVideo);
            patriciaVideo.onended = playPatricia2Video;
        } else {
            console.error("Patricia video element not found");
        }

        body.classList.add("show-video");

        setTimeout(function() {
            if (popupChatbot && !chatbotOpened) {
                popupChatbot.style.display = "block";
                setTimeout(() => {
                    popupChatbot.classList.add('show');
                }, 10);
            }
        }, 2000);

        const closePopup = document.querySelector(".tabrobotics-close-popup");
        if (closePopup) {
            closePopup.addEventListener("click", function() {
                if (popupChatbot) {
                    popupChatbot.classList.remove('show');
                    popupChatbot.classList.add('hide');
                    setTimeout(() => {
                        popupChatbot.style.display = "none";
                        popupChatbot.classList.remove('hide');
                    }, 500);
                }
            });
        }

        if (videoContainer) {
            videoContainer.addEventListener("click", function() {
                if (popupChatbot) {
                    popupChatbot.classList.remove('show');
                    popupChatbot.classList.add('hide');
                    setTimeout(() => {
                        popupChatbot.style.display = "none";
                        popupChatbot.classList.remove('hide');
                    }, 500);
                }
            });
        }

        chatbox.scrollTop = chatbox.scrollHeight;

        // Reset all conversations when the page loads
        fetch('/reset-all-conversations', { method: 'POST' })
        .then(response => response.json())
        .then(data => console.log(data.response))
        .catch(error => console.error('Error resetting conversations:', error));
    }

    // Add event listener for when speaking video ends
    if (speakingVideo) {
        speakingVideo.addEventListener('ended', function() {
            if (audioElement && !audioElement.ended) {
                playVideo(speakingVideo);
            }
        });
    }
});

function showChatbot(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    console.log("showChatbot function called");
    chatbotOpened = true;
    const chatbotWrapper = document.querySelector('.tabrobotics-chatbot-wrapper');
    if (chatbotWrapper) chatbotWrapper.classList.add('fade-out');

    setTimeout(() => {
        if (chatbotWrapper) chatbotWrapper.style.display = 'none';
        body.classList.add("show-chatbot");

        // Delay video interaction
        setTimeout(() => {
            // Pause and reset videos
            [patriciaVideo, speakingVideo, patricia2Video].forEach(video => {
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
            });
        }, 100);
    }, 300);

    // Hide popup
    const popupChatbot = document.getElementById("tabrobotics-popup-chatbot");
    if (popupChatbot) {
        popupChatbot.classList.remove('show');
        popupChatbot.classList.add('hide');
        setTimeout(() => {
            popupChatbot.style.display = "none";
            popupChatbot.classList.remove('hide');
        }, 500);
    }
}

function hideChatbot() {
    console.log("hideChatbot function called");
    body.classList.remove("show-chatbot");
    chatbotOpened = false;
    const chatbotWrapper = document.querySelector('.tabrobotics-chatbot-wrapper');

    setTimeout(() => {
        if (chatbotWrapper) {
            chatbotWrapper.style.display = 'flex';
            chatbotWrapper.classList.remove('fade-out');
        }
        playPatricia2Video();
    }, 200);
}

// Function to get or create a unique user ID
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    // URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, (match) => {
        // Check if the URL is an image link
        if (match.match(/\.(jpeg|jpg|gif|png)$/) != null) {
            return `<img src="${match}" alt="Image" style="max-width:100%;height:auto;">`;
        } else {
            return `<a href="${match}" target="_blank">here</a>`;
        }
    });

    // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    // Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-_.])+@[a-zA-Z0-9\-_.]+\.[a-zA-Z]{2,5})/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "tabrobotics-outgoing" ? 
        `<p>${message}</p>` : 
        `<span class="material-symbols-outlined"><img src="${chatbotIconUrl}" alt=""></span><p>${linkify(message)}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
};

const generateResponse = (chatElement, typingInterval) => {
    const SERVER_URL = "https://xlt-final-version-1-blbobcrypto.replit.app/get-response";
    const userId = getUserId();

    console.log("Sending request to server with message:", userMessage);

    fetch(SERVER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            message: userMessage,
            user_id: userId
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        clearInterval(typingInterval);
        console.log("Received response from server:", data.response);

        const incomingChatLi = createChatLi(data.response, "tabrobotics-incoming");
        chatbox.replaceChild(incomingChatLi, chatElement);
        chatbox.scrollTo(0, chatbox.scrollHeight);

        if (responseSound) {
            responseSound.volume = 0.05;
            responseSound.play().catch(error => {
                console.error("Error playing response sound:", error);
            });
        } else {
            console.warn("Response sound element not found");
        }

        // Call speakResponse with the generated text
        speakResponse(data.response);
    })
    .catch((error) => {
        clearInterval(typingInterval);
        console.error('Error in generateResponse:', error);

        if (chatElement && chatElement.querySelector("p")) {
            chatElement.querySelector("p").textContent = "Oops! Something went wrong. Please try again.";
        } else {
            console.error("Chat element or paragraph not found for error message");
            const errorChatLi = createChatLi("Oops! Something went wrong. Please try again.", "tabrobotics-incoming");
            chatbox.appendChild(errorChatLi);
        }

        chatbox.scrollTo(0, chatbox.scrollHeight);
    });
}


function speakResponse(text) {
    if (document.body.classList.contains('show-chatbot')) {
        console.log("Chatbot is open. Skipping speech and video functionality.");
        return;
    }

    fetch('/synthesize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'text=' + encodeURIComponent(text)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
    })
    .then(audioBlob => {
        const audioUrl = URL.createObjectURL(audioBlob);
        audioElement.src = audioUrl;

        // Start fading out patricia2Video immediately
        if (patricia2Video) {
            fadeOut(patricia2Video, 200);
        }

        audioElement.onloadedmetadata = function() {
            if (speakingVideo) {
                speakingVideo.style.display = 'block';
                playRandomLipsyncVideo();
            }
        };

        audioElement.onplay = function() {
            console.log("Audio started playing");
        };

        audioElement.onended = function() {
            console.log("Audio ended");
            if (speakingVideo) {
                fadeOut(speakingVideo, 200, () => {
                    playPatricia2Video();
                });
            } else {
                playPatricia2Video();
            }
        };

        audioElement.play().then(() => {
            console.log("Audio playback started");
        }).catch(error => {
            console.error("Error playing audio:", error);
        });
    })
    .catch(error => {
        console.error("Error in speakResponse:", error);
    });
}

function playRandomLipsyncVideo() {
    const videoSrc = getRandomLipsyncVideo();
    console.log("Setting speaking video source:", videoSrc);

    if (speakingVideo) {
        speakingVideo.src = videoSrc;
        speakingVideo.currentTime = 0;
        speakingVideo.playbackRate = 1;

        fadeIn(speakingVideo, 200);
        speakingVideo.play().catch(error => {
            console.error(`Error playing speaking video:`, error);
        });
    }
}

const handleSend = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Clear the input field
    chatInput.value = "";

    const outgoingChatLi = createChatLi(userMessage, "tabrobotics-outgoing");
    chatbox.appendChild(outgoingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Typing.", "tabrobotics-incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);

        let dotCount = 1;
        const typingInterval = setInterval(() => {
            incomingChatLi.innerHTML = `<span class="material-symbols-outlined"><img src="${chatbotIconUrl}" alt=""></span><p>Typing${'.'.repeat(dotCount)}</p>`;
            dotCount = (dotCount % 6) + 1;
        }, 500);

        generateResponse(incomingChatLi, typingInterval);
    }, 600);
};

function updateTypingMessage(message) {
    const typingElements = document.getElementsByClassName('typing');
    if(typingElements.length > 0) {
        typingElements[0].innerText = message;
    } else {
        const incomingChatLi = createChatLi(message, "tabrobotics-incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

sendChatBtn.addEventListener("click", handleSend);

// Speech Recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let isSpeechDetected = false;
let recognitionTimeout;

function updateMicrophoneIcon(isListening, button = microphoneBtn) {
    if (isListening) {
        button.classList.add('listening');
    } else {
        button.classList.remove('listening');
    }
}

recognition.onstart = function() {
    console.log('Voice recognition activated. Start speaking.');
    updateMicrophoneIcon(true);
    clearTimeout(recognitionTimeout);
    isSpeechDetected = false;
};

recognition.onspeechend = function() {
    console.log('Speech recognition ended.');
    setTimeout(() => {
        recognition.stop();
        if (!isSpeechDetected) {
            updateMicrophoneIcon(false);
            chatInput.placeholder = "Enter a message...";
            chatbox.appendChild(createChatLi("No speech detected. Please try again.", "tabrobotics-incoming"));
        }
    }, 2000);
};

recognition.onresult = function(event) {
    isSpeechDetected = true;
    const transcript = event.results[0][0].transcript;
    chatInput.value = transcript;
    chatInput.placeholder = "Enter a message...";
    updateMicrophoneIcon(false);
    handleSend();
};

recognition.onerror = function(event) {
    console.error('Speech recognition error detected: ' + event.error);
    updateMicrophoneIcon(false);
    chatInput.placeholder = "Enter a message...";
    chatbox.appendChild(createChatLi(`Error in speech recognition: ${event.error}`, "incoming"));
};

microphoneBtn.addEventListener('click', function() {
    if (microphoneBtn.classList.contains('listening')) {
        recognition.stop();
    } else {
        recognition.start();
        updateMicrophoneIcon(true);
        chatInput.placeholder = "Listening...";

        recognitionTimeout = setTimeout(() => {
            if (!isSpeechDetected) {
                recognition.stop();
                updateMicrophoneIcon(false);
                chatInput.placeholder = "Enter a message...";
                chatbox.appendChild(createChatLi("No speech detected. Please try again.", "tabrobotics-incoming"));
            }
        }, 12000);
    }
});

// Event listener for the chatbot wrapper
const chatbotWrapper = document.querySelector('.tabrobotics-chatbot-wrapper');
if (chatbotWrapper) {
    chatbotWrapper.addEventListener("click", function(event) {
        // Check if the click is on the video container or the chatbot toggler
        if (event.target.closest('#video-container') || event.target.closest('.tabrobotics-chatbot-toggler')) {
            console.log("Chatbot wrapper clicked");
            showChatbot(event);
        }
    });
}

// Make the entire chatbot toggler (video area) clickable to open the chatbot
if (chatbotToggler) {
    chatbotToggler.addEventListener("click", function(event) {
        console.log("Chatbot toggler clicked");
        showChatbot(event);
    });
}

if (closeBtn) {
    closeBtn.addEventListener("click", hideChatbot);
}

console.log("JavaScript loaded and initialized");