// System prompt for the chatbot: Only answer questions about L'Oréal products, routines, and recommendations.
const systemPrompt =
  "You are a helpful assistant for L’Oréal. Only answer questions related to L’Oréal products, beauty routines, and product recommendations. If a question is not about L’Oréal, politely guide the user back to L’Oréal topics.";

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Store the conversation history as an array of messages
const messages = [{ role: "system", content: systemPrompt }];

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message
  const message = userInput.value.trim();
  if (!message) return;

  // Add user's message to the conversation history
  messages.push({ role: "user", content: message });

  // Show user's message in the chat window
  appendMessage("user", message);
  userInput.value = "";

  // Show an animated loading message while waiting for the API
  appendLoadingMessage();

  // Prepare the request payload for the Cloudflare Worker
  const apiUrl = "https://lorealchatbox.robertralj22.workers.dev/";
  const payload = {
    model: "gpt-4o",
    messages: messages,
    max_tokens: 300,
    temperature: 0.7,
  };

  try {
    // Make the API request to the Cloudflare Worker using fetch and async/await
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Parse the response JSON
    const data = await response.json();

    // Remove the loading message
    removeLastMessage();

    // Get the chatbot's reply and show it
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiReply = data.choices[0].message.content;
      appendMessage("ai", aiReply);
      // Add AI's reply to the conversation history
      messages.push({ role: "assistant", content: aiReply });
    } else {
      appendMessage(
        "ai",
        "Sorry, I couldn't get a response. Please try again."
      );
    }
  } catch (error) {
    // Remove the loading message and show error
    removeLastMessage();
    appendMessage(
      "ai",
      "There was an error connecting to the chatbot. Please try again later."
    );
  }
});

// Helper function to add a message to the chat window
function appendMessage(role, text) {
  // Create the message container
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${role}`;

  // Create the bubble span for the message text
  const bubble = document.createElement("span");
  bubble.className = "bubble";
  bubble.textContent = text;

  msgDiv.appendChild(bubble);
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Helper function to add an animated loading message for AI
function appendLoadingMessage() {
  const msgDiv = document.createElement("div");
  msgDiv.className = "msg ai";

  const bubble = document.createElement("span");
  bubble.className = "bubble loading";
  // Add 3 animated dots
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.className = "dot";
    bubble.appendChild(dot);
  }
  msgDiv.appendChild(bubble);
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Helper function to remove the last message (used for loading)
function removeLastMessage() {
  const lastMsg = chatWindow.lastElementChild;
  if (lastMsg) {
    chatWindow.removeChild(lastMsg);
  }
}
