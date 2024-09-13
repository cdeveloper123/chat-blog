import { useState, useRef, useEffect } from "react";

import { RiExpandDiagonalLine, RiCollapseDiagonalLine } from "react-icons/ri";

import { userData } from "../constants/data.js";

const users = Object.keys(userData);

export default function ConversationUI() {
  const [messages, setMessages] = useState([]);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [inputMessage, setInputMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const toggleExpand = (index) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getResponse = (message) => {
    const mentionedUsers = message.match(/@(\w+(\s*\([^)]*\))?)/g) || [];
    let responses = [];

    mentionedUsers.forEach((mention) => {
      const user = mention.slice(1);
      if (userData[user]) {
        const topic = getTopic(message);
        const response = getRandomResponse(user, topic);
        responses.push({ user, message: response });
      }
    });

    if (!mentionedUsers.length) {
      users.forEach((user) => {
        const topic = getTopic(message);
        const response = getRandomResponse(user, topic);
        responses.push({ user, message: response });
      });
    }

    return responses;
  };

  const getTopic = (message) => {
    const topics = {
      intermittentFasting: ["intermittent fasting"],
      sleepHealth: ["sleep"],
      mentalWellness: ["mental", "wellness"],
      physicalFitness: ["fitness", "exercise"],
      nutrition: ["nutrition", "diet"],
      stressManagement: ["stress"],
      hydration: ["hydration", "water"],
    };

    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some((keyword) => message.toLowerCase().includes(keyword))) {
        return topic;
      }
    }

    return "generalResponses";
  };

  const getRandomResponse = (user, topic) => {
    const responses = userData[user][topic] || userData[user].generalResponses;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      { user: "Adi (User)", message: inputMessage.trim() },
      ...getResponse(inputMessage),
    ]);

    setInputMessage("");
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setInputMessage(value);

    const atIndex = value.lastIndexOf("@");
    if (atIndex !== -1) {
      const query = value.slice(atIndex + 1).toLowerCase();
      if (query === "" || query === "@") {
        setSuggestions(users);
        setShowSuggestions(true);
      } else {
        const filtered = users.filter((user) =>
          user.toLowerCase().includes(query)
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user) => {
    const lastAtSymbol = inputMessage.lastIndexOf("@");
    const newInputMessage = `${inputMessage.slice(
      0,
      lastAtSymbol
    )}@${user} ${inputMessage.slice(lastAtSymbol + user.length + 1)}`;

    setInputMessage(newInputMessage);
    setShowSuggestions(false);
    inputRef.current.focus();
    inputRef.current.setSelectionRange(
      newInputMessage.length,
      newInputMessage.length
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-bl from-[#0d0848] via-[#39295e] to-[#ae217a] p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Sample Conversation
      </h1>
      <p className="text-center mb-8 text-purple-300">
        (Adi, a Platform user getting perspective from different Experts and
        Product Marketing Team)
      </p>
      <div className="max-w-6xl mx-auto flex flex-col h-[70vh]">
        <div className="flex-grow overflow-y-auto mb-4 space-y-4 scrollbar-hide">
          {messages.map((msg, index) => (
            <div key={index} className="relative">
              {msg.user === "Adi (User)" && (
                <div className="absolute top-0 right-4 text-orange-400 font-semibold">
                  {msg.user}
                </div>
              )}
              <div
                className={`mt-6 rounded-lg p-4 ${
                  msg.user === "Adi (User)" ? "" : "bg-purple-800 bg-opacity-20"
                } ${expandedMessages[index] ? "text-left" : "line-clamp-2"}`}
              >
                <div className="flex justify-between items-center mb-2">
                  {msg.user !== "Adi (User)" && (
                    <h3 className="font-semibold text-purple-300">
                      {msg.user}
                    </h3>
                  )}
                  {msg.message.length > 300 && (
                    <button
                      onClick={() => toggleExpand(index)}
                      className="text-purple-400 hover:text-purple-200 focus:outline-none ml-auto"
                      aria-label={
                        expandedMessages[index]
                          ? "Collapse message"
                          : "Expand message"
                      }
                    >
                      <div className="rounded-md bg-purple-900 p-1.5 hover:bg-purple-600 mt-[8px] border-[2px] border-gray-500">
                        {expandedMessages[index] ? (
                          <RiCollapseDiagonalLine className=" w-5" />
                        ) : (
                          <RiExpandDiagonalLine className=" w-5" />
                        )}
                      </div>
                    </button>
                  )}
                </div>
                <p
                  className={`text-sm ${
                    expandedMessages[index] ? "text-left" : "line-clamp-2"
                  } ${msg.user === "Adi (User)" ? "text-right" : ""}`}
                  style={{ textAlign: "left", wordBreak: "break-word" }}
                >
                  {msg.message}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="mt-6 relative">
          <div className="flex items-center bg-purple-800 bg-opacity-50 rounded-lg p-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Enter your message here..."
              className="flex-grow bg-transparent text-white placeholder-purple-400 focus:outline-none"
            />
            <button
              type="submit"
              className="ml-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors"
            >
              Send
            </button>
          </div>
          {showSuggestions && (
            <div className="absolute bottom-full left-0 w-full bg-purple-700 rounded-t-lg shadow-lg">
              {suggestions.map((user, index) => (
                <button
                  key={index}
                  className="block w-full text-left px-4 py-2 hover:bg-purple-600 text-white"
                  onClick={() => insertMention(user)}
                >
                  {user}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
