
document.addEventListener('DOMContentLoaded', function () {

    // --- Element References ---
    const customSelect = document.querySelector('.custom-select');
    const selectedOption = customSelect.querySelector('.selected-option');
    const options = customSelect.querySelector('.options');
    const togglableButtons = document.querySelectorAll('.search-button, .reason-button, .mic-button');
    const plusBtn = document.getElementById('plusBtn');
    const fileInput = document.getElementById('fileInput');
    const searchButton = document.getElementById('searchButton'); // Reference the Web Search button by ID
    const reasonButton = document.getElementById('reasonButton'); // Reference the Think button by ID
    const uploadButton = document.getElementById('uploadButton'); // Reference the Upload button by ID
    const micButton = document.getElementById('micButton'); // Reference the Mic button by ID
    const messageInput = document.getElementById('messageInput');
    const conversationDiv = document.getElementById('conversation');
    const headerContainer = document.querySelector('.header-container');
    const conversationContainer = document.querySelector('.conversation-container');
    const panelToggleButton = document.getElementById('panelToggleButton');
    const sidePanel = document.getElementById('sidePanel');
    const closePanelButton = document.getElementById('closePanelButton');
    const chatList = document.querySelector('.chat-list');
    const createChatButton = document.getElementById('createChatButton');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer'); // Reference the image preview container
    const imagePreview = document.getElementById('imagePreview'); // Reference the image preview element
    const removeImageButton = document.getElementById('removeImageButton'); // Reference the remove image button
    const contextMenu = document.getElementById('contextMenu'); // Reference the context menu container

    // References for settings panels and buttons
    const settingsButton = document.getElementById('settingsButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const darkModeToggle = document.getElementById('darkModeToggle'); // Dark Mode toggle button
    const profileButton = document.getElementById('profileButton'); // New Profile button
    const customizeButton = document.getElementById('customizeButton'); // New Customize button
    const upgradeButton = document.getElementById('upgradeButton'); // New Upgrade Plan button

    // References for customization panel elements
    const customizePanel = document.getElementById('customizePanel'); // Customization panel
    const backToSettingsFromCustomizeButton = document.getElementById('backToSettingsFromCustomizeButton'); // Back button in customize panel
    const fontSizeSelect = document.getElementById('fontSizeSelect'); // Font Size dropdown
    const languageSelect = document.getElementById('languageSelect'); // Language dropdown
    const aiPersonaTextarea = document.getElementById('aiPersonaTextarea'); // AI Persona textarea
    const userNameInput = document.getElementById('userNameInput'); // User Name input
    const saveCustomizationButton = document.getElementById('saveCustomizationButton'); // Save button

    // References for profile panel elements (NEW)
    const profilePanel = document.getElementById('profilePanel'); // Profile panel
    const backToSettingsFromProfileButton = document.getElementById('backToSettingsFromProfileButton'); // Back button in profile panel
    const profileNameInput = document.getElementById('profileNameInput'); // Profile Name input
    const profileEmailInput = document.getElementById('profileEmailInput'); // Profile Email input
    const deleteAllChatsButton = document.getElementById('deleteAllChatsButton'); // Delete All Chats button
    const logoutButton = document.getElementById('logoutButton'); // Logout button


    // --- API Keys and Configuration ---
    // WARNING: Embedding API keys directly in client-side code is INSECURE.
    // Use a backend server to handle API calls in a production environment.
    const SERPER_API_KEY = "aedd7dfbf722e827726285764edcd39d46a31ce0"; // Your Serper API Key
    const SERPER_API_URL = "https://google.serper.dev/search";
    const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
    // Mapping from model version display text to API details
    const apiKeys = {
        'Gemma 3': {
            key: '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', // Replace with your actual key
            model: 'google/gemma-3-27b-it:free',
            supportsImage: true
        },
        'DeepSeek:V3': {
            key: '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', // Replace with your actual key
            model: 'deepseek/deepseek-chat-v3-0324:free',
            supportsImage: false
        },
        'DeepSeek:R1': {
            key: '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', // Replace with your actual key
            model: 'deepseek/deepseek-r1:free',
            supportsImage: false
        },
        'GPT-4o-mini': {
            key: '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',
            model: 'openai/gpt-4o-mini',
            supportsImage: true
        },
        'Meta:Liama-3': {
            key: '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', // Replace with your actual key
            model: 'meta-llama/llama-3.3-70b-instruct',
            supportsImage: false
        },
        'mistral-7b': {
            key: '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', // Replace with your actual key
            model: 'mistralai/mistral-7b-instruct:free',
            supportsImage: false
        }
        // Add other models here if needed
    };

    // --- State Variables ---
    let chats = {}; // Stores conversations { chatName: [messageObj1, messageObj2] }
    let currentChat = "New Chat"; // Default active chat name
    if (!chats[currentChat]) {
        chats[currentChat] = []; // Initialize default chat history
    }
    let selectedAiModelKey = 'Gemma 3'; // Default selected model key (matches display text)
    let firstMessageSent = false;
    let selectedFile = null; // Store selected file for upload
    let thinkingAnimationInterval = null; // To hold the interval ID for thinking animation
    let currentSpeechUtterance = null; // To keep track of the ongoing speech

    // State variable for customization settings
    let customizationSettings = {
        fontSize: 'medium', // Default font size
        language: 'en', // Default language
        aiPersona: '', // Default AI Persona
        userName: '' // Default User Name
    };

    // State variable for profile settings (NEW)
    let profileSettings = {
        name: '', // Default name
        email: '' // Default email
    };


    // --- Initialization ---
    initializeChatList(); // Setup chat list from storage or default
    loadChat(currentChat, document.querySelector('.chat-item.active')); // Load the initial chat
    applySavedTheme(); // Apply theme preference from localStorage on load
    loadCustomizationSettings(); // Load customization settings from localStorage
    applySavedCustomization(); // Apply loaded customization settings
    loadProfileSettings(); // Load profile settings from localStorage (NEW)
    applySavedProfileSettings(); // Apply loaded profile settings (NEW)


    // --- Event Listeners ---

    // Model Selection Dropdown
    selectedOption.addEventListener('click', function (event) {
        event.stopPropagation(); // Prevent document click listener from closing immediately
        customSelect.classList.toggle('open');
    });

    options.addEventListener('click', function (event) {
        const option = event.target.closest('.option');
        if (option) {
            const aiName = option.querySelector('.ai-name').textContent;
            const modelVersion = option.querySelector('.model-version').textContent;
            selectedOption.querySelector('.ai-name').textContent = aiName;
            selectedOption.querySelector('.model-version').textContent = modelVersion;
            selectedAiModelKey = modelVersion; // Update the selected model key
            customSelect.classList.remove('open');
            console.log("Selected AI Model:", selectedAiModelKey); // Log selected model
        }
    });

    // Close dropdown/panel/context menu/settings panel/customize panel/profile panel on outside click
    document.addEventListener('click', function (event) {
        // Close dropdown if click is outside
        if (!customSelect.contains(event.target)) {
            customSelect.classList.remove('open');
        }
        // Close side panel if click is outside (and not on toggle button or context menu)
        if (sidePanel.classList.contains('open') &&
            !sidePanel.contains(event.target) &&
            event.target !== panelToggleButton &&
            !panelToggleButton.contains(event.target) &&
            !event.target.closest('.context-menu')) { // Don't close if clicking context menu
            sidePanel.classList.remove('open');
        }
        // Close context menu if click is outside
        if (contextMenu.style.display === 'block' && !contextMenu.contains(event.target)) {
            contextMenu.style.display = 'none';
        }
        // Close settings panel if click is outside (and not on settings button, customize panel, or profile panel)
         if (settingsPanel.classList.contains('open') &&
             !settingsPanel.contains(event.target) &&
             event.target !== settingsButton &&
             !settingsButton.contains(event.target) &&
             !customizePanel.contains(event.target) && // Don't close if clicking inside customize panel
             !profilePanel.contains(event.target)) { // Don't close if clicking inside profile panel (NEW)
             settingsPanel.classList.remove('open');
         }
         // Close customize panel if click is outside (and not on settings button or settings panel)
          if (customizePanel.classList.contains('open') &&
              !customizePanel.contains(event.target) &&
              event.target !== settingsButton && // Allow clicking settings button to toggle back
              !settingsButton.contains(event.target) &&
              !settingsPanel.contains(event.target)) { // Allow clicking inside settings panel to toggle back
              customizePanel.classList.remove('open');
          }
         // Close profile panel if click is outside (and not on settings button or settings panel) (NEW)
          if (profilePanel.classList.contains('open') &&
              !profilePanel.contains(event.target) &&
              event.target !== settingsButton && // Allow clicking settings button to toggle back
              !settingsButton.contains(event.target) &&
              !settingsPanel.contains(event.target)) { // Allow clicking inside settings panel to toggle back
              profilePanel.classList.remove('open');
          }
    });

    // Toggle buttons (Search, Think, Mic)
    togglableButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    });

    // File Upload (+) Button
    plusBtn.addEventListener('click', () => {
        fileInput.click(); // Trigger hidden file input
    });

    fileInput.addEventListener('change', () => {
        const files = fileInput.files;
        if (files.length > 0) {
            selectedFile = files[0];
            // Display image preview
            displayImagePreview(selectedFile);
        } else {
            selectedFile = null;
            removeImagePreview();
        }
    });

    // Remove Image Button
    removeImageButton.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = ''; // Clear the file input
        removeImagePreview();
    });


    // Microphone Button
    micButton.addEventListener('click', () => {
        // Check for browser support
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            alert("Sorry, your browser doesn't support Speech Recognition.");
            return;
        }
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = customizationSettings.language || 'en-US'; // Use selected language
        recognition.interimResults = false; // We only want final results

        micButton.classList.add('active'); // Indicate recording

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript; // Fill input with transcript
        };

        recognition.onerror = function (event) {
            console.error("Speech Recognition Error:", event.error);
            alert(`Speech Recognition Error: ${event.error}`);
            micButton.classList.remove('active');
        };

        recognition.onend = function () {
            micButton.classList.remove('active'); // Stop indication
        };

        recognition.start();
    });

    // Send (Upload) Button
    uploadButton.addEventListener('click', () => {
        const messageText = messageInput.value.trim();
        const isWebSearchActive = searchButton.classList.contains('active');
        const isThinkActive = reasonButton.classList.contains('active'); // Check if Think button is active


        // Handle text message OR file message
        if (messageText !== '' || selectedFile) {
            // Hide initial header if it's the first message
            if (!firstMessageSent) {
                headerContainer.style.display = 'none';
                conversationContainer.style.marginTop = '20px'; // Adjust margin
                firstMessageSent = true;
            }

            // Determine if it's a file message
            const hasFile = selectedFile !== null;
            const effectiveMessage = hasFile ? (messageText || `Processing file: ${selectedFile.name}`) : messageText; // Use text or default file message

            // Add user message to UI and history
            addMessage('user', effectiveMessage, true); // Save user message

            // Clear input and reset file state
            messageInput.value = '';
            const fileToProcess = selectedFile; // Keep a reference before clearing
            selectedFile = null;
            fileInput.value = ''; // Clear file input
            removeImagePreview();

            // Get current AI model details
            const selectedModelInfo = apiKeys[selectedAiModelKey];
            if (!selectedModelInfo || !selectedModelInfo.key) {
                addMessage('ai', `Error: Configuration missing for model: ${selectedAiModelKey}`, true, selectedAiModelKey);
                return;
            }

            // --- Handle AI Response and Optional Web Search ---
            // Disable web search if a file is being processed (simplification)
            const performWebSearch = isWebSearchActive && !hasFile;

            // Pass the state of the Think button
            handleAiInteraction(effectiveMessage, selectedModelInfo, performWebSearch, fileToProcess, isThinkActive);

        }
    });

    // Send message on Enter key (if not Shift+Enter)
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default newline behavior
            uploadButton.click(); // Trigger send button click
        }
    });

    // Side Panel Toggle/Close
    if (panelToggleButton) {
        panelToggleButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent document click listener
            sidePanel.classList.toggle('open');
        });
    }
    if (closePanelButton) {
        closePanelButton.addEventListener('click', () => {
            sidePanel.classList.remove('open');
        });
    }

    // "New Chat" Button in Panel
    if (createChatButton) {
        createChatButton.addEventListener('click', () => {
            // Find a unique name like "New Chat", "New Chat (1)", etc.
            let baseName = "New Chat";
            let newName = baseName;
            let count = 1;
            while (chats[newName]) {
                newName = `${baseName} (${count})`;
                count++;
            }
            addChatItem(newName, true); // Add new chat item and switch to it
            // Optional: Save chats to localStorage here
        });
    }

    // Dark Mode Toggle (now inside settings panel)
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            // Save the preference to localStorage
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            // Update button text/icon if desired (optional)
            // darkModeToggle.querySelector('i').className = isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            // darkModeToggle.lastChild.textContent = isDarkMode ? ' Light Mode' : ' Dark Mode';
        });
    }

    // Settings Button Toggle
    if (settingsButton) {
        settingsButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent document click listener
            // Toggle settings panel, hide customize and profile panels if open
            settingsPanel.classList.toggle('open');
            customizePanel.classList.remove('open'); // Ensure customize panel is closed
            profilePanel.classList.remove('open'); // Ensure profile panel is closed (NEW)
        });
    }

    // --- Settings Panel Button Listeners ---

    if (profileButton) {
        profileButton.addEventListener('click', () => {
            console.log("Profile button clicked!");
            settingsPanel.classList.remove('open'); // Hide settings panel
            loadProfileSettings(); // Load profile settings into the form (NEW)
            profilePanel.classList.add('open'); // Show profile panel (NEW)
        });
    }

    if (customizeButton) {
        customizeButton.addEventListener('click', () => {
            console.log("Customize button clicked!");
            settingsPanel.classList.remove('open'); // Hide settings panel
            loadCustomizationSettings(); // Load settings into the form
            customizePanel.classList.add('open'); // Show customize panel
        });
    }

    if (upgradeButton) {
        upgradeButton.addEventListener('click', () => {
            console.log("Upgrade Plan button clicked!");
            alert("Upgrade functionality not implemented yet."); // Placeholder
            settingsPanel.classList.remove('open'); // Close panel
        });
    }

    // --- Customization Panel Listeners ---

    if (backToSettingsFromCustomizeButton) {
        backToSettingsFromCustomizeButton.addEventListener('click', () => {
            console.log("Back to Settings from Customize button clicked!");
            customizePanel.classList.remove('open'); // Hide customize panel
            settingsPanel.classList.add('open'); // Show settings panel
        });
    }

    if (saveCustomizationButton) {
        saveCustomizationButton.addEventListener('click', () => {
            console.log("Save Customization button clicked!");
            saveCustomizationSettings(); // Save settings to localStorage
            applySavedCustomization(); // Apply the saved settings
            alert("Customization settings saved!"); // Confirmation
            customizePanel.classList.remove('open'); // Close customize panel after saving
        });
    }

    // --- Profile Panel Listeners (NEW) ---

    if (backToSettingsFromProfileButton) {
        backToSettingsFromProfileButton.addEventListener('click', () => {
            console.log("Back to Settings from Profile button clicked!");
            profilePanel.classList.remove('open'); // Hide profile panel
            settingsPanel.classList.add('open'); // Show settings panel
        });
    }

    if (deleteAllChatsButton) {
        deleteAllChatsButton.addEventListener('click', () => {
            console.log("Delete All Chats button clicked!");
            if (confirm("Are you sure you want to delete all your chats? This action cannot be undone.")) {
                chats = { "New Chat": [] }; // Reset chats to only a new, empty chat
                currentChat = "New Chat"; // Set current chat to the new one
                initializeChatList(); // Re-render the chat list
                loadChat(currentChat, document.querySelector('.chat-item.active')); // Load the new chat
                // Optional: Clear chats from localStorage here if you implemented persistence
                alert("All chats have been deleted.");
                profilePanel.classList.remove('open'); // Close panel after action
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log("Logout button clicked!");
            if (confirm("Are you sure you want to log out?")) {
                // In a real application, you would clear session/auth tokens here
                // For this client-side example, we'll just clear localStorage and reload
                localStorage.clear(); // Clear all local storage (including theme, settings, etc.)
                alert("You have been logged out.");
                window.location.reload(); // Reload the page
            }
        });
    }

    // Add a listener to the Save Profile button (even if it's removed in HTML, keep the placeholder logic)
    // if (saveProfileButton) {
    //     saveProfileButton.addEventListener('click', () => {
    //         console.log("Save Profile button clicked!");
    //         saveProfileSettings(); // Save profile settings to localStorage (NEW)
    //         alert("Profile settings saved!"); // Confirmation
    //         profilePanel.classList.remove('open'); // Close profile panel after saving
    //     });
    // }


    // --- Core Interaction Functions ---

    /**
     * Handles fetching AI response and optionally web search results.
     * @param {string} prompt The user's message/prompt.
     * @param {object} modelInfo Configuration object for the selected AI model.
     * @param {boolean} performWebSearch Whether to perform a web search.
     * @param {File|null} file Optional file for image input.
     * @param {boolean} isThinkActive Whether the "Think" button is active.
     */
    async function handleAiInteraction(prompt, modelInfo, performWebSearch, file = null, isThinkActive = false) {
        // Add placeholder AI message
        const aiMessageDiv = addMessage('ai', 'Thinking...', true, modelInfo.model); // Save placeholder
        const aiResponseTarget = aiMessageDiv.querySelector('.ai-response-content'); // Get the content div

        // Start thinking animation if 'Think' mode is active
        if (isThinkActive) {
             startThinkingAnimation(aiResponseTarget, prompt);
        } else {
             // If not thinking mode, just show a simple placeholder
             aiResponseTarget.textContent = 'Thinking...';
        }


        // Modify the prompt based on AI Persona and User Name settings
        let modifiedPrompt = prompt;
        if (customizationSettings.aiPersona) {
            modifiedPrompt = `Instructions for AI Persona: ${customizationSettings.aiPersona}\n\n${modifiedPrompt}`;
        }
        if (customizationSettings.userName) {
             // You might instruct the AI to use the user's name here
             // This is a simple example, more complex prompt engineering might be needed
             modifiedPrompt = `The user's name is ${customizationSettings.userName}. ${modifiedPrompt}`;
        }
        // Also include profile name/email in the prompt if they are set (optional)
        if (profileSettings.name) {
             modifiedPrompt = `The user's profile name is ${profileSettings.name}. ${modifiedPrompt}`;
        }
        if (profileSettings.email) {
             modifiedPrompt = `The user's profile email is ${profileSettings.email}. ${modifiedPrompt}`;
        }


        // Further modify the prompt if "Think" mode is active
        if (isThinkActive) {
            modifiedPrompt = `Provide a detailed, comprehensive, and insightful response to the following: ${modifiedPrompt}`;
            // You can experiment with different phrasing here to get the desired level of detail.
        }


        // Start AI and Search requests (if applicable)
        // Use the modifiedPrompt when calling getAiCompletion
        const aiPromise = getAiCompletion(modifiedPrompt, modelInfo, file);
        // Web search query still uses the original prompt, not the modified one for search terms
        const searchPromise = performWebSearch ? getWebSearchResults(prompt) : Promise.resolve(null);

        try {
            // Wait for both promises to settle (complete, either success or failure)
            const [aiResult, searchResult] = await Promise.allSettled([aiPromise, searchPromise]);

            // Stop thinking animation regardless of success/failure
            stopThinkingAnimation(aiResponseTarget);

            let aiContent = 'Error fetching AI response.'; // Default error message

            // Process AI Result
            if (aiResult.status === 'fulfilled') {
                aiContent = aiResult.value; // Get the AI text
            } else {
                console.error("AI Fetch Error:", aiResult.reason);
                aiContent = `Error: ${aiResult.reason?.message || 'Failed to get AI response.'}`;
            }

             // Update the placeholder message content with the AI response
            aiResponseTarget.innerHTML = parseMarkdown(aiContent); // Render markdown
            // Update the stored message content
            updateStoredMessageContent(aiMessageDiv.dataset.messageId, aiContent);

            // Process Search Result (if search was performed)
            if (performWebSearch) {
                let searchResults = null;
                if (searchResult.status === 'fulfilled' && searchResult.value) {
                    searchResults = searchResult.value; // Get the search results array
                    // Append search results to the AI message div
                    appendSearchResults(aiResponseTarget, searchResults);
                    // Update the stored message with search results
                    updateStoredMessageSearchResults(aiMessageDiv.dataset.messageId, searchResults);
                } else {
                    console.error("Web Search Error:", searchResult.reason);
                    // Optionally display a search error message
                    const searchErrorDiv = document.createElement('div');
                    searchErrorDiv.className = 'search-error'; // Use CSS class
                    searchErrorDiv.textContent = 'Error fetching web search results.';
                    aiResponseTarget.appendChild(searchErrorDiv);
                }
            }

        } catch (error) {
            // This catch block might not be strictly necessary with Promise.allSettled
            // unless there's an error outside the promises themselves.
            console.error("Error handling AI interaction:", error);
            // Ensure animation stops even if an unexpected error occurs
            stopThinkingAnimation(aiResponseTarget);
            aiResponseTarget.innerHTML = `An unexpected error occurred: ${error.message}`;
            updateStoredMessageContent(aiMessageDiv.dataset.messageId, aiResponseTarget.innerHTML);
        } finally {
            // Ensure conversation scrolls to the bottom
            conversationDiv.scrollTo({ top: conversationDiv.scrollHeight, behavior: 'smooth' });
        }
    }

    /**
     * Starts a typing-like animation with dynamic text lines.
     * @param {HTMLElement} targetElement The element to display the thinking text in.
     * @param {string} userPrompt The user's original prompt.
     */
    function startThinkingAnimation(targetElement, userPrompt) {
        const thinkingTexts = [
            `Analyzing "${userPrompt.substring(0, 30)}${userPrompt.length > 30 ? '...' : ''}"`, // Show part of the prompt
            "Consulting knowledge base...",
            "Considering different perspectives...",
            "Structuring the information...",
            "Performing complex calculations...", // Example of a more technical phrase
            "Formulating a comprehensive reply..."
        ];
        let textIndex = 0;
        let charIndex = 0;
        const typingSpeed = 50; // Milliseconds per character
        const lineDelay = 1000; // Milliseconds delay before starting next line

        // Clear any previous content (like "Thinking...")
        targetElement.innerHTML = '';
        let currentLineElement = document.createElement('p'); // Use paragraph for each line
        currentLineElement.style.margin = '0'; // Remove default paragraph margin for tight lines
        currentLineElement.style.padding = '0';
        targetElement.appendChild(currentLineElement);

        function typeCharacter() {
            if (textIndex < thinkingTexts.length) {
                const currentText = thinkingTexts[textIndex];
                if (charIndex < currentText.length) {
                    currentLineElement.textContent += currentText.charAt(charIndex);
                    charIndex++;
                    thinkingAnimationInterval = setTimeout(typeCharacter, typingSpeed);
                } else {
                    // Line finished, move to the next line
                    textIndex++;
                    charIndex = 0;
                    if (textIndex < thinkingTexts.length) {
                        currentLineElement = document.createElement('p'); // Create new paragraph for next line
                        currentLineElement.style.margin = '0';
                        currentLineElement.style.padding = '0';
                        targetElement.appendChild(currentLineElement);
                         // Scroll to keep the new line in view
                        conversationDiv.scrollTo({ top: conversationDiv.scrollHeight, behavior: 'smooth' });
                        thinkingAnimationInterval = setTimeout(typeCharacter, lineDelay); // Delay before next line
                    } else {
                        // All lines displayed, loop back to the start
                         textIndex = 0; // Reset to loop
                         charIndex = 0;
                         targetElement.innerHTML = ''; // Clear previous lines
                         currentLineElement = document.createElement('p');
                         currentLineElement.style.margin = '0';
                         currentLineElement.style.padding = '0';
                         targetElement.appendChild(currentLineElement);
                         thinkingAnimationInterval = setTimeout(typeCharacter, lineDelay); // Delay before looping
                    }
                }
            }
        }

        // Start the typing animation
        typeCharacter();
    }

    /**
     * Stops the thinking animation and clears the interval.
     * @param {HTMLElement} targetElement The element where the thinking text was displayed.
     */
    function stopThinkingAnimation(targetElement) {
        clearInterval(thinkingAnimationInterval);
        thinkingAnimationInterval = null;
        // The handleAiInteraction function will overwrite the content with the final response
        // So we don't need to clear it here, just stop the animation.
    }


    /**
     * Fetches completion from the OpenRouter AI API.
     * @param {string} prompt The user's prompt (potentially modified for "Think" mode and customization).
     * @param {object} modelInfo Configuration for the selected model.
     * @param {File|null} file Optional file for image input.
     * @returns {Promise<string>} A promise resolving with the AI's response text.
     */
    async function getAiCompletion(prompt, modelInfo, file = null) {
        const headers = {
            "Authorization": `Bearer ${modelInfo.key}`,
            // "HTTP-Referer": "<YOUR_SITE_URL>", // Optional: Replace with your site URL
            // "X-Title": "<YOUR_SITE_NAME>", // Optional: Replace with your site name
            "Content-Type": "application/json"
        };

        const requestBody = {
            "model": modelInfo.model,
            "messages": []
        };

        // Handle image input if file is provided and model supports it
        if (file && modelInfo.supportsImage) {
            try {
                const base64Image = await readFileAsBase64(file);
                requestBody.messages.push({
                    role: "user",
                    content: [
                        { type: "text", text: prompt || "Describe this image." }, // Use prompt or default
                        { type: "image_url", image_url: { url: `data:${file.type};base64,${base64Image}` } }
                    ]
                });
            } catch (error) {
                console.error("Error reading file for AI:", error);
                return Promise.reject(new Error("Could not process the image file."));
            }
        } else if (file && !modelInfo.supportsImage) {
             return Promise.reject(new Error(`The selected model (${modelInfo.model}) does not support image input.`));
        }
        else {
            // Standard text message
            requestBody.messages.push({ "role": "user", "content": prompt });
        }

        // If history is needed, add previous messages here:
        // const history = chats[currentChat].slice(-5); // Get last 5 messages (example)
        // requestBody.messages = [...history.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content })), ...requestBody.messages];


        try {
            const response = await fetch(OPENROUTER_API_URL, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({})); // Try to parse error JSON
                const errorMsg = `API Error: ${response.status} ${response.statusText}. ${errData?.error?.message || 'No specific error message provided.'}`;
                throw new Error(errorMsg);
            }

            const data = await response.json();

            if (data?.choices?.length > 0 && data.choices[0].message?.content) {
                return data.choices[0].message.content; // Resolve with the AI text
            } else {
                console.warn("Received unexpected AI response structure:", data);
                throw new Error('Received an empty or invalid response from the AI.');
            }
        } catch (error) {
            console.error("Fetch AI Completion Error:", error);
            throw error; // Re-throw the error to be caught by the caller
        }
    }

    /**
     * Fetches search results from the Serper Google Search API.
     * @param {string} query The search query.
     * @returns {Promise<Array|null>} A promise resolving with an array of search results [{ title, link }] or null/rejecting on error.
     */
    async function getWebSearchResults(query) {
        const headers = new Headers();
        headers.append("X-API-KEY", SERPER_API_KEY);
        headers.append("Content-Type", "application/json");

        const raw = JSON.stringify({ "q": query });

        const requestOptions = {
            method: "POST",
            headers: headers,
            body: raw,
            redirect: "follow"
        };

        try {
            console.log("Fetching Serper for:", query); // Log search query
            const response = await fetch(SERPER_API_URL, requestOptions);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Serper API Error Response:", errorText);
                throw new Error(`Serper API Error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log("Serper Result:", result); // Log Serper result

            // Extract relevant results (e.g., organic results)
            if (result.organic && result.organic.length > 0) {
                return result.organic.slice(0, 5).map(item => ({ // Limit to top 5 results
                    title: item.title,
                    link: item.link,
                    snippet: item.snippet // Optionally include snippet
                }));
            } else {
                return []; // Return empty array if no organic results
            }
        } catch (error) {
            console.error("Fetch Web Search Results Error:", error);
            throw error; // Re-throw error
        }
    }


    /**
     * Appends formatted search results to an AI message element.
     * @param {HTMLElement} aiMessageContentElement The container element within the AI message bubble.
     * @param {Array} searchResults Array of { title, link, snippet }.
     */
    function appendSearchResults(aiMessageContentElement, searchResults) {
        if (!searchResults || searchResults.length === 0) return;

        // Find or create the search resources div within the AI message content
        let resourcesDiv = aiMessageContentElement.querySelector('.search-resources');
        if (!resourcesDiv) {
            resourcesDiv = document.createElement('div');
            resourcesDiv.className = 'search-resources';
            const title = document.createElement('h4'); // Use a heading for the resources section
            title.textContent = 'Resources:';
            resourcesDiv.appendChild(title);
            const list = document.createElement('ul');
            resourcesDiv.appendChild(list);
            aiMessageContentElement.appendChild(resourcesDiv); // Append to the content div
        }

        const list = resourcesDiv.querySelector('ul');
        list.innerHTML = ''; // Clear existing list items if any (e.g., during re-render)

        searchResults.forEach(result => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = result.link;
            link.textContent = result.title;
            link.target = '_blank'; // Open in new tab
            link.rel = 'noopener noreferrer';
            item.appendChild(link);
            // Optionally add snippet:
            // if (result.snippet) {
            //     const snippetP = document.createElement('p');
            //     snippetP.className = 'search-snippet'; // Use CSS class
            //     snippetP.textContent = result.snippet;
            //     item.appendChild(snippetP);
            // }
            list.appendChild(item);
        });
    }


    /**
     * Adds a message to the conversation UI and optionally saves it to the current chat history.
     * Also adds action icons for AI messages.
     * @param {string} sender 'user' or 'ai'.
     * @param {string} message The message content (text or initial placeholder like 'Thinking...').
     * @param {boolean} saveMessage Whether to save the message to the `chats` object.
     * @param {string|null} aiModel The model name (used for AI messages).
     * @returns {HTMLElement} The created message div element.
     */
    function addMessage(sender, message, saveMessage = true, aiModel = null) {
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; // Unique ID
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.dataset.messageId = messageId; // Store ID on the element

        if (sender === 'user') {
            // Use textContent for user messages to prevent XSS from user input
            messageDiv.textContent = message;
        } else { // AI message
            // Create the structure defined in HTML for AI messages
            const aiContainer = document.createElement('div');
            aiContainer.className = 'ai-message-container';

            const aiNameDiv = document.createElement('div');
            aiNameDiv.className = 'ai-name-display';
            aiNameDiv.textContent = aiModel || apiKeys[selectedAiModelKey]?.model || selectedAiModelKey; // Show model identifier
            aiContainer.appendChild(aiNameDiv);

            const aiResponseContent = document.createElement('div');
            aiResponseContent.className = 'ai-response-content'; // Target this for updates
            // Initial content (e.g., 'Thinking...' or rendered markdown)
            aiResponseContent.innerHTML = parseMarkdown(message); // Parse initial markdown
            aiContainer.appendChild(aiResponseContent);

            // Add the action icons container for AI messages
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';

            // Copy Icon
            const copyIcon = document.createElement('i');
            copyIcon.classList.add('fa-regular', 'fa-copy', 'message-action-icon');
            copyIcon.title = 'Copy'; // Add tooltip
            copyIcon.addEventListener('click', () => copyMessage(messageDiv, copyIcon)); // Pass the icon element
            actionsDiv.appendChild(copyIcon);

            // Regenerate Icon
            const regenerateIcon = document.createElement('i');
            regenerateIcon.classList.add('fa-solid', 'fa-arrows-rotate', 'message-action-icon');
            regenerateIcon.title = 'Regenerate response'; // Add tooltip
            regenerateIcon.addEventListener('click', () => regenerateMessage(messageDiv));
            actionsDiv.appendChild(regenerateIcon);

            // Read Aloud Icon
            const readAloudIcon = document.createElement('i');
            readAloudIcon.classList.add('fa-solid', 'fa-volume-high', 'message-action-icon'); // Using volume-high for speaker icon
            readAloudIcon.title = 'Read aloud'; // Add tooltip
            // Pass the icon element to the read aloud function
            readAloudIcon.addEventListener('click', () => readAloudMessage(messageDiv, readAloudIcon));
            actionsDiv.appendChild(readAloudIcon);

            aiContainer.appendChild(actionsDiv); // Append actions after content

            messageDiv.appendChild(aiContainer);
        }

        conversationDiv.appendChild(messageDiv);

        // Scroll to bottom (might be slightly delayed if content updates later)
        // Consider scrolling again after content is fully loaded/updated
        setTimeout(() => conversationDiv.scrollTo({ top: conversationDiv.scrollHeight, behavior: 'smooth' }), 100);


        // Save message to history if requested
        if (saveMessage) {
            if (!chats[currentChat]) {
                chats[currentChat] = []; // Ensure chat history exists
            }
            const msgObj = {
                id: messageId, // Store the ID
                sender,
                content: message, // Store initial content (will be updated for AI)
                timestamp: new Date().toISOString()
            };
            if (sender === 'ai') {
                msgObj.model = aiModel || apiKeys[selectedAiModelKey]?.model || selectedAiModelKey;
                msgObj.searchResults = null; // Initialize search results placeholder
            }
            chats[currentChat].push(msgObj);
            // console.log("Saved message:", msgObj, "to chat:", currentChat);
            // Optional: Save chats to localStorage here after adding a message
            // saveChatsToLocalStorage();
        }

        return messageDiv; // Return the created element
    }

    /**
     * Updates the content of a stored message in the `chats` object.
     * @param {string} messageId The unique ID of the message to update.
     * @param {string} newContent The final AI response content.
     */
    function updateStoredMessageContent(messageId, newContent) {
        if (chats[currentChat]) {
            const messageIndex = chats[currentChat].findIndex(msg => msg.id === messageId);
            if (messageIndex !== -1) {
                chats[currentChat][messageIndex].content = newContent;
                // console.log("Updated stored content for:", messageId);
                // Optional: Save chats to localStorage after updating content
                // saveChatsToLocalStorage();
            }
        }
    }

    /**
     * Updates the search results of a stored message in the `chats` object.
     * @param {string} messageId The unique ID of the message to update.
     * @param {Array|null} searchResults The fetched search results.
     */
    function updateStoredMessageSearchResults(messageId, searchResults) {
         if (chats[currentChat]) {
            const messageIndex = chats[currentChat].findIndex(msg => msg.id === messageId);
            if (messageIndex !== -1) {
                chats[currentChat][messageIndex].searchResults = searchResults;
                 // console.log("Updated stored search results for:", messageId);
                 // Optional: Save chats to localStorage after updating search results
                 // saveChatsToLocalStorage();
            }
        }
    }


    // --- Chat Management Functions ---

    /** Initializes the chat list on page load */
    function initializeChatList() {
        // Clear existing list items (except maybe a template)
        chatList.innerHTML = '';
        // Load chats from localStorage (or initialize default)
        // For simplicity, we are starting fresh each time now.
        // Implement localStorage persistence if needed.
        // loadChatsFromLocalStorage(); // Call this if you implement persistence

        if (Object.keys(chats).length === 0) {
             chats = { "New Chat": [] };
             currentChat = "New Chat";
        }
        // Populate the list
        Object.keys(chats).forEach(chatName => {
            const isActive = chatName === currentChat;
            addChatItem(chatName, false, isActive); // Add without switching, mark active if needed
        });
    }

    /**
     * Adds a chat item to the side panel list using the pre-existing HTML structure.
     * @param {string} name Name of the chat.
     * @param {boolean} switchToChat Whether to immediately switch to this chat.
     * @param {boolean} isActive Mark this chat as active initially.
     */
    function addChatItem(name, switchToChat = false, isActive = false) {
        // Create the list item structure defined in HTML
        const li = document.createElement('li');
        li.classList.add('chat-item');
        li.dataset.chatName = name; // Store chat name on element

        if (isActive) {
            li.classList.add('active');
        }

        const span = document.createElement('span');
        span.classList.add('chat-title');
        span.textContent = name;
        li.appendChild(span);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('chat-actions');
        actionsDiv.innerHTML = '<i class="fa-solid fa-ellipsis-v"></i>'; // Options icon
        // Add event listener for context menu
        actionsDiv.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent li click event
            showContextMenu(e, li, name);
        });
        li.appendChild(actionsDiv);

        // Add event listener to switch chat on click
        const clickListener = () => {
             loadChat(name, li);
         };
        li.addEventListener('click', clickListener);
         // Store the listener so we can remove it during rename
         li._clickListener = clickListener;


        chatList.appendChild(li);

        // Switch to the new chat if requested
        if (switchToChat) {
            loadChat(name, li);
        }
    }

    /**
     * Loads a specific chat's history into the conversation view.
     * @param {string} chatName The name of the chat to load.
     * @param {HTMLElement} chatItemElement The list item element in the side panel.
     */
    function loadChat(chatName, chatItemElement) {
        if (currentChat === chatName && conversationDiv.children.length > 0 && chatItemElement && chatItemElement.classList.contains('active')) {
             // Avoid reloading if already active and conversation is not empty
             // console.log("Chat already loaded:", chatName);
            // return; // Might uncomment this later if performance is an issue
        }

        console.log("Loading chat:", chatName);
        currentChat = chatName; // Set the active chat

        // Update active state in the list
        const allChatItems = chatList.querySelectorAll('.chat-item');
        allChatItems.forEach(item => item.classList.remove('active'));
        if (chatItemElement) {
            chatItemElement.classList.add('active');
        } else {
            // Find the element if not passed (e.g., on initial load)
            const activeItem = chatList.querySelector(`.chat-item[data-chat-name="${chatName}"]`);
            if (activeItem) activeItem.classList.add('active');
        }


        // Ensure chat history exists
        if (!chats[currentChat]) {
            chats[currentChat] = [];
        }

        // Render messages for the selected chat
        renderChatMessages(currentChat);

        // Show/hide header based on whether messages exist
        if (chats[currentChat].length > 0) {
             headerContainer.style.display = 'none';
             conversationContainer.style.marginTop = '20px';
             firstMessageSent = true;
        } else {
             headerContainer.style.display = 'block'; // Or 'flex' depending on its style
             conversationContainer.style.marginTop = '0'; // Reset margin
             firstMessageSent = false;
        }
    }

    /**
     * Renders messages from the history of a given chat name.
     * @param {string} chatName The name of the chat whose messages to render.
     */
    function renderChatMessages(chatName) {
        conversationDiv.innerHTML = ""; // Clear existing messages
        if (chats[chatName]) {
            chats[chatName].forEach(msg => {
                // Re-create message element from stored data
                const messageDiv = addMessage(msg.sender, msg.content, false, msg.model); // Don't save again
                // If it's an AI message and has search results, append them
                if (msg.sender === 'ai' && msg.searchResults && msg.searchResults.length > 0) {
                    const aiContentElement = messageDiv.querySelector('.ai-response-content');
                    if (aiContentElement) {
                        appendSearchResults(aiContentElement, msg.searchResults);
                    }
                }
            });
        }
         // Scroll to bottom after rendering
        setTimeout(() => conversationDiv.scrollTo({ top: conversationDiv.scrollHeight, behavior: 'smooth' }), 50);
    }

    /**
     * Shows a context menu (Rename, Delete, Share) for a chat item using the pre-existing HTML element.
     * @param {MouseEvent} event The click event.
     * @param {HTMLElement} chatItem The chat list item element.
     * @param {string} chatName The name of the chat.
     */
    function showContextMenu(event, chatItem, chatName) {
        // Clear existing menu items
        contextMenu.innerHTML = '';

        // Menu options
        const options = [
            { label: 'Rename', action: () => renameChat(chatItem, chatName) },
            { label: 'Delete', action: () => deleteChat(chatItem, chatName) },
            // { label: 'Share', action: () => shareChat(chatName) } // Share functionality TBD
        ];

        // Create and add menu items
        options.forEach(opt => {
            const item = document.createElement('div');
            item.classList.add('context-menu-item'); // Use CSS class
            item.textContent = opt.label;
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering other listeners
                opt.action(); // Execute the action
                contextMenu.style.display = 'none'; // Close the menu
            });
            contextMenu.appendChild(item);
        });

        // Position the menu near the click event
        // Prevent menu from going off-screen to the right
        const menuWidth = contextMenu.offsetWidth || 100; // Estimate width if not yet rendered
        const posX = (event.clientX + menuWidth) > window.innerWidth ? window.innerWidth - menuWidth - 10 : event.clientX;
        const posY = event.clientY;


        contextMenu.style.top = `${posY}px`;
        contextMenu.style.left = `${posX}px`;
        contextMenu.style.display = 'block'; // Show the menu
    }

    /**
     * Initiates the renaming process for a chat item.
     * @param {HTMLElement} chatItem The chat list item element.
     * @param {string} oldName The current name of the chat.
     */
    function renameChat(chatItem, oldName) {
        const titleSpan = chatItem.querySelector('.chat-title');
        const actionsDiv = chatItem.querySelector('.chat-actions');
        if (!titleSpan) return;

        // Create input field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = oldName;
        input.classList.add('chat-rename-input'); // Use CSS class for styling

        // Replace span with input
        chatItem.insertBefore(input, actionsDiv);
        titleSpan.style.display = 'none'; // Hide original title
        input.focus(); // Focus the input
        input.select(); // Select existing text

        // Event listeners for finishing rename
        const finishRename = () => {
            const newName = input.value.trim();

            // Remove listeners to prevent multiple triggers
            input.removeEventListener('blur', finishRename);
            input.removeEventListener('keydown', handleKeyDown);

            if (newName && newName !== oldName && !chats[newName]) { // Check if valid, changed, and unique
                // Update chats object
                chats[newName] = chats[oldName]; // Copy history
                delete chats[oldName]; // Remove old entry

                // Update UI
                titleSpan.textContent = newName;
                chatItem.dataset.chatName = newName; // Update data attribute

                 // Update click listener for the item
                 // Remove old listener to prevent duplicates
                 const oldClickListener = chatItem._clickListener; // Assuming you stored it
                 if(oldClickListener) {
                     chatItem.removeEventListener('click', oldClickListener);
                 }
                 const newClickListener = () => loadChat(newName, chatItem);
                 chatItem.addEventListener('click', newClickListener);
                 chatItem._clickListener = newClickListener; // Store the new listener


                // If the renamed chat was the current one, update currentChat
                if (currentChat === oldName) {
                    currentChat = newName;
                }
                console.log(`Renamed chat "${oldName}" to "${newName}"`);
                // Optional: Save chats to localStorage after renaming
                // saveChatsToLocalStorage();
            } else if (newName !== oldName && chats[newName]) {
                 alert("A chat with this name already exists.");
                 // Keep input visible for correction or revert
                 input.focus();
                 // Re-add listeners if keeping input visible
                 input.addEventListener('blur', finishRename);
                 input.addEventListener('keydown', handleKeyDown);
                 return; // Don't revert UI yet
            }
             // else: name is empty, unchanged, or invalid - revert UI

            // Revert UI: remove input, show span
            input.remove();
            titleSpan.style.display = ''; // Show original title (now updated or reverted)
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishRename(); // Finish on Enter
            } else if (e.key === 'Escape') {
                e.preventDefault();
                // Revert without saving
                input.remove();
                titleSpan.style.display = '';
                 // Remove listeners explicitly
                 input.removeEventListener('blur', finishRename);
                 input.removeEventListener('keydown', handleKeyDown);
            }
        };

        // Add listeners
        input.addEventListener('blur', finishRename); // Finish on losing focus
        input.addEventListener('keydown', handleKeyDown); // Finish on Enter, cancel on Escape
    }


    /**
     * Deletes a chat item and its history.
     * @param {HTMLElement} chatItem The chat list item element.
     * @param {string} chatName The name of the chat to delete.
     */
    function deleteChat(chatItem, chatName) {
        if (!confirm(`Are you sure you want to delete the chat "${chatName}"?`)) {
            return; // User cancelled
        }

        // Remove from UI
        chatItem.remove();

        // Delete history
        delete chats[chatName];
        console.log("Deleted chat:", chatName);

        // If the deleted chat was the active one, load the first available chat or create 'New Chat'
        if (currentChat === chatName) {
            const remainingChatItems = chatList.querySelectorAll('.chat-item');
            if (remainingChatItems.length > 0) {
                // Load the first remaining chat
                const firstChatName = remainingChatItems[0].dataset.chatName;
                loadChat(firstChatName, remainingChatItems[0]);
            } else {
                // No chats left, create and load a default 'New Chat'
                addChatItem("New Chat", true); // Create and switch
            }
        }
        // Optional: Persist changes to localStorage here after deleting
        // saveChatsToLocalStorage();
    }

    // --- AI Message Action Functions ---

    /**
     * Copies the text content of an AI message to the clipboard and provides feedback.
     * @param {HTMLElement} messageDiv The AI message div element.
     * @param {HTMLElement} iconElement The copy icon element.
     */
    function copyMessage(messageDiv, iconElement) {
        const aiResponseContent = messageDiv.querySelector('.ai-response-content');
        if (aiResponseContent) {
            // Use textContent to get plain text, ignoring HTML structure
            const textToCopy = aiResponseContent.textContent;
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    console.log("AI message copied to clipboard:", textToCopy);
                    // Provide visual feedback: Change icon to checkmark temporarily
                    const originalClass = iconElement.className;
                    iconElement.classList.remove('fa-regular', 'fa-copy');
                    iconElement.classList.add('fa-solid', 'fa-check');
                    iconElement.title = 'Copied!';

                    // Revert icon after a few seconds
                    setTimeout(() => {
                        iconElement.classList.remove('fa-solid', 'fa-check');
                        iconElement.classList.add('fa-regular', 'fa-copy');
                        iconElement.title = 'Copy';
                    }, 2000); // 2000 milliseconds = 2 seconds
                })
                .catch(err => {
                    console.error("Failed to copy AI message:", err);
                    // Optional: Provide error feedback to the user (e.g., a temporary "Failed to copy" message)
                    alert("Failed to copy message."); // Simple alert for now
                });
        }
    }

    /**
     * Regenerates the AI response for the preceding user message.
     * Finds the previous user message and triggers a new AI interaction.
     * @param {HTMLElement} aiMessageDiv The AI message div element to regenerate.
     */
    function regenerateMessage(aiMessageDiv) {
        console.log("Regenerating response for message:", aiMessageDiv.dataset.messageId);

        // Find the index of the current AI message in the chat history
        const messageIndex = chats[currentChat].findIndex(msg => msg.id === aiMessageDiv.dataset.messageId);

        if (messageIndex > 0) {
            // The previous message should be the user's prompt for this AI response
            const previousMessage = chats[currentChat][messageIndex - 1];

            if (previousMessage.sender === 'user') {
                // Remove the current AI message from the UI and history
                aiMessageDiv.remove();
                chats[currentChat].splice(messageIndex, 1);
                console.log("Removed old AI message for regeneration.");
                // Optional: Save chats to localStorage after removing
                // saveChatsToLocalStorage();

                // Get the original prompt and trigger a new AI interaction
                const originalPrompt = previousMessage.content;

                // Get current AI model details (use the currently selected model)
                const selectedModelInfo = apiKeys[selectedAiModelKey];
                 if (!selectedModelInfo || !selectedModelInfo.key) {
                    addMessage('ai', `Error: Configuration missing for model: ${selectedAiModelKey}`, true, selectedAiModelKey);
                    return;
                }

                // Determine if web search or think mode was active for the original prompt
                // This information is NOT currently stored with the user message.
                // For a more robust solution, you might need to store these flags with user messages.
                // For now, we'll assume default behavior (no search, no think mode) for regeneration
                // or you could potentially re-use the state of the buttons at the time of regeneration.
                // Let's re-use the current state of the buttons for simplicity in this example.
                 const isWebSearchActive = searchButton.classList.contains('active');
                 const isThinkActive = reasonButton.classList.contains('active');

                // Trigger a new AI interaction with the original prompt
                // Note: File upload is not supported for regeneration in this simple implementation.
                handleAiInteraction(originalPrompt, selectedModelInfo, isWebSearchActive, null, isThinkActive);

            } else {
                console.warn("Previous message is not a user message. Cannot regenerate.");
                // Optional: Provide user feedback that regeneration is not possible
            }
        } else {
            console.warn("Cannot regenerate the first message in a chat.");
             // Optional: Provide user feedback
        }
    }

    /**
     * Uses the Web Speech API to read the text content of an AI message aloud.
     * Toggles speech on/off with repeated clicks.
     * @param {HTMLElement} messageDiv The AI message div element.
     * @param {HTMLElement} iconElement The read aloud icon element.
     */
    function readAloudMessage(messageDiv, iconElement) {
        const aiResponseContent = messageDiv.querySelector('.ai-response-content');
        if (!aiResponseContent) return;

        const textToSpeak = aiResponseContent.textContent;

        // Check if speech synthesis is supported
        if (!('speechSynthesis' in window)) {
            alert("Sorry, your browser doesn't support text-to-speech.");
            return;
        }

        // If speech is currently speaking this utterance, stop it
        if (window.speechSynthesis.speaking && currentSpeechUtterance && window.speechSynthesis.speaking && currentSpeechUtterance.text === textToSpeak) {
             window.speechSynthesis.cancel();
             currentSpeechUtterance = null; // Clear the reference
             iconElement.classList.remove('fa-volume-xmark'); // Change icon back if needed
             iconElement.classList.add('fa-volume-high');
             iconElement.title = 'Read aloud';
             return; // Stop here
        } else if (window.speechSynthesis.speaking) {
             // If speaking a *different* utterance, stop it before starting the new one
             window.speechSynthesis.cancel();
             if (currentSpeechUtterance && currentSpeechUtterance._iconElement) {
                 // Revert the icon of the previously speaking message
                 currentSpeechUtterance._iconElement.classList.remove('fa-volume-xmark');
                 currentSpeechUtterance._iconElement.classList.add('fa-volume-high');
                 currentSpeechUtterance._iconElement.title = 'Read aloud';
             }
             currentSpeechUtterance = null; // Clear the reference
        }


        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        currentSpeechUtterance = utterance; // Store reference to the current utterance
        utterance._iconElement = iconElement; // Store reference to the icon element

        // Optional: Configure voice, rate, pitch, etc.
        // You can get available voices like this:
        // const voices = window.speechSynthesis.getVoices();
        // utterance.voice = voices.find(voice => voice.lang === 'en-US'); // Example: find an English voice
        // utterance.rate = 1.0;
        // utterance.pitch = 1.0;

        // Event listeners for speech start and end
        utterance.onstart = function() {
            console.log("Speech started.");
            iconElement.classList.remove('fa-volume-high');
            iconElement.classList.add('fa-volume-xmark'); // Change icon to indicate speaking/stop
            iconElement.title = 'Stop reading';
        };

        utterance.onend = function() {
            console.log("Speech ended.");
            currentSpeechUtterance = null; // Clear reference when speech ends
            iconElement.classList.remove('fa-volume-xmark');
            iconElement.classList.add('fa-volume-high'); // Change icon back
            iconElement.title = 'Read aloud';
        };

         utterance.onerror = function(event) {
            console.error("Speech synthesis error:", event.error);
             currentSpeechUtterance = null; // Clear reference on error
             iconElement.classList.remove('fa-volume-xmark');
             iconElement.classList.add('fa-volume-high'); // Change icon back
             iconElement.title = 'Read aloud';
             // Optional: Provide user feedback about the error
             alert(`Text-to-speech error: ${event.error}`);
        };


        window.speechSynthesis.speak(utterance);
    }


    // --- Utility Functions ---

    /**
     * Parses markdown text to HTML using the 'marked' library.
     * Configures highlight.js for code block syntax highlighting.
     * @param {string} text Markdown text.
     * @returns {string} HTML string.
     */
    function parseMarkdown(text) {
        if (!text) return ''; // Handle null or empty input
        try {
             // Configure marked library
            marked.setOptions({
                highlight: function(code, lang) {
                    // Attempt to highlight code; fallback to plaintext if language not found
                    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                    try {
                        return hljs.highlight(code, { language, ignoreIllegals: true }).value;
                    } catch (e) {
                        console.error("Highlight.js error:", e);
                        return hljs.highlight(code, { language: 'plaintext', ignoreIllegals: true }).value; // Fallback highlighting
                    }
                },
                langPrefix: 'hljs language-', // Prefix for CSS classes
                pedantic: false, // Don't be overly strict
                gfm: true, // Enable GitHub Flavored Markdown (tables, etc.)
                breaks: true, // Convert single line breaks to <br>
                sanitize: false, // IMPORTANT: Set to true if input is untrusted. Assumes AI output is safe.
                smartypants: false, // Don't auto-correct quotes, dashes, etc.
                xhtml: false // Don't output self-closing tags
            });
            return marked.parse(text); // Parse the markdown text
        } catch (e) {
            console.error("Markdown Parsing Error:", e);
            // Return the original text or a safe version in case of error
            const escapedText = document.createElement('div');
            escapedText.textContent = text;
            return `<p>Error parsing response.</p><pre><code>${escapedText.innerHTML}</code></pre>`;
        }
    }

    /**
     * Reads a File object as a Base64 encoded string.
     * @param {File} file The file to read.
     * @returns {Promise<string>} Promise resolving with the Base64 string (without data: prefix).
     */
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // result includes "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
                // We only want the part after the comma
                if (reader.result) {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error("FileReader result is null"));
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file); // Read the file as Data URL
        });
    }

    /**
     * Displays a preview of the selected image file using the pre-existing HTML elements.
     * @param {File} file The image file.
     */
    function displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'inline-block'; // Show the container
        }
        reader.readAsDataURL(file);
    }

    /** Removes the image preview element by hiding its container. */
    function removeImagePreview() {
        imagePreviewContainer.style.display = 'none'; // Hide the container
        imagePreview.src = '#'; // Clear the image source
    }

    /** Applies the saved theme preference from localStorage on page load. */
    function applySavedTheme() {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme === 'enabled') {
            document.body.classList.add('dark-mode');
            // Optional: Update the dark mode toggle button's icon/text here if you change it
            // const darkModeToggle = document.getElementById('darkModeToggle');
            // if (darkModeToggle) {
            //     darkModeToggle.querySelector('i').className = 'fa-solid fa-sun';
            //     darkModeToggle.lastChild.textContent = ' Light Mode';
            // }
        }
    }

    /** Loads customization settings from localStorage and populates the form. */
    function loadCustomizationSettings() {
        const savedSettings = localStorage.getItem('customizationSettings');
        if (savedSettings) {
            try {
                customizationSettings = JSON.parse(savedSettings);
                // Populate the form fields
                fontSizeSelect.value = customizationSettings.fontSize || 'medium';
                languageSelect.value = customizationSettings.language || 'en';
                aiPersonaTextarea.value = customizationSettings.aiPersona || '';
                userNameInput.value = customizationSettings.userName || '';
                console.log("Loaded customization settings:", customizationSettings);
            } catch (e) {
                console.error("Error parsing customization settings from localStorage:", e);
                // Reset to default if parsing fails
                customizationSettings = { fontSize: 'medium', language: 'en', aiPersona: '', userName: '' };
            }
        } else {
             // If no settings saved, ensure form is populated with defaults
             fontSizeSelect.value = customizationSettings.fontSize;
             languageSelect.value = customizationSettings.language;
             aiPersonaTextarea.value = customizationSettings.aiPersona;
             userNameInput.value = customizationSettings.userName;
        }
    }

    /** Saves current customization settings from the form to localStorage. */
    function saveCustomizationSettings() {
        customizationSettings.fontSize = fontSizeSelect.value;
        customizationSettings.language = languageSelect.value;
        customizationSettings.aiPersona = aiPersonaTextarea.value.trim();
        customizationSettings.userName = userNameInput.value.trim();

        try {
            localStorage.setItem('customizationSettings', JSON.stringify(customizationSettings));
            console.log("Saved customization settings:", customizationSettings);
        } catch (e) {
            console.error("Error saving customization settings to localStorage:", e);
            alert("Could not save settings. Please check browser storage permissions.");
        }
    }

     /** Applies the saved customization settings to the UI. */
    function applySavedCustomization() {
        // Apply font size to conversation
        conversationDiv.style.fontSize = getFontSizeValue(customizationSettings.fontSize);

        // Apply language to speech recognition (already done in micButton listener)

        // AI Persona and User Name are used when constructing the prompt in handleAiInteraction

        console.log("Applied customization settings.");
    }

    /**
     * Helper function to get pixel value for font size setting.
     * @param {string} size 'small', 'medium', or 'large'.
     * @returns {string} CSS font-size value (e.g., '14px').
     */
    function getFontSizeValue(size) {
        switch (size) {
            case 'small':
                return '14px';
            case 'large':
                return '18px';
            case 'medium':
            default:
                return '16px'; // Default
        }
    }

    // --- Profile Settings Functions (NEW) ---

    /** Loads profile settings from localStorage and populates the form. */
    function loadProfileSettings() {
        const savedProfileSettings = localStorage.getItem('profileSettings');
        if (savedProfileSettings) {
            try {
                profileSettings = JSON.parse(savedProfileSettings);
                // Populate the form fields
                profileNameInput.value = profileSettings.name || '';
                profileEmailInput.value = profileSettings.email || '';
                console.log("Loaded profile settings:", profileSettings);
            } catch (e) {
                console.error("Error parsing profile settings from localStorage:", e);
                // Reset to default if parsing fails
                profileSettings = { name: '', email: '' };
            }
        } else {
             // If no settings saved, ensure form is populated with defaults
             profileNameInput.value = profileSettings.name;
             profileEmailInput.value = profileSettings.email;
        }
    }

    /** Saves current profile settings from the form to localStorage. */
    function saveProfileSettings() {
        profileSettings.name = profileNameInput.value.trim();
        profileSettings.email = profileEmailInput.value.trim();

        try {
            localStorage.setItem('profileSettings', JSON.stringify(profileSettings));
            console.log("Saved profile settings:", profileSettings);
        } catch (e) {
error_log("Error saving profile settings to localStorage:", e); // Use error_log for server-side logging if available, or console.error
            alert("Could not save profile settings. Please check browser storage permissions.");
        }
    }

    /** Applies the saved profile settings (currently only used in prompt modification). */
    function applySavedProfileSettings() {
        // Profile Name and Email are used when constructing the prompt in handleAiInteraction
        console.log("Applied profile settings.");
    }

    // --- Optional: Chat History Persistence (Example) ---
    // You would need to call saveChatsToLocalStorage() after any action that modifies `chats`
    // and loadChatsFromLocalStorage() on initialization.

    // function saveChatsToLocalStorage() {
    //     try {
    //         localStorage.setItem('chatHistory', JSON.stringify(chats));
    //         localStorage.setItem('currentChat', currentChat);
    //         console.log("Chats saved to localStorage.");
    //     } catch (e) {
    //         console.error("Error saving chats to localStorage:", e);
    //     }
    // }

    // function loadChatsFromLocalStorage() {
    //     try {
    //         const savedChats = localStorage.getItem('chatHistory');
    //         const savedCurrentChat = localStorage.getItem('currentChat');
    //         if (savedChats) {
    //             chats = JSON.parse(savedChats);
    //             if (savedCurrentChat && chats[savedCurrentChat]) {
    //                 currentChat = savedCurrentChat;
    //             } else if (Object.keys(chats).length > 0) {
    //                  currentChat = Object.keys(chats)[0]; // Load the first chat if saved current chat is invalid
    //             } else {
    //                 chats = { "New Chat": [] }; // Default if no chats saved
    //                 currentChat = "New Chat";
    //             }
    //             console.log("Chats loaded from localStorage.");
    //         } else {
    //             chats = { "New Chat": [] }; // Default if no chats saved
    //             currentChat = "New Chat";
    //         }
    //     } catch (e) {
    //         console.error("Error loading chats from localStorage:", e);
    //         // Reset to default if loading fails
    //         chats = { "New Chat": [] };
    //         currentChat = "New Chat";
    //     }
    // }


}); // End DOMContentLoaded
