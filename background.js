// background.js - Persistent background script
// This handles events and state that need to persist across browser sessions

// Store the default state
const defaultState = {
    toggleState: true,
    departureLocation: "BMC",
    customTimeEnabled: false,
    customTime: null
};
  
// Initialize extension data when installed
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.get(['toggleState', 'departureLocation'], function(result) {
        // Set default values if they don't exist
        if (result.toggleState === undefined) {
            chrome.storage.local.set({ toggleState: defaultState.toggleState });
        }
        if (result.departureLocation === undefined) {
            chrome.storage.local.set({ departureLocation: defaultState.departureLocation });
        }
        if (result.customTimeEnabled === undefined) {
            chrome.storage.local.set({ customTimeEnabled: defaultState.customTimeEnabled });
        }
    });
});

// Listen for messages from popup.js or content.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "getState") {
        // Return the current state to whoever asked
        chrome.storage.local.get(['toggleState', 'departureLocation', 'customTimeEnabled', 'customTime'], function(result) {
            sendResponse(result);
        });
        
        return true; // Required for asynchronous response
    }

    // Forward messages from popup to content script
    if (message.source === "popup" && message.target === "content") {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: message.action,
                    isEnabled: message.isEnabled,
                    location: message.location,
                    updateNow: message.updateNow,
                    customTime: message.customTime
                });
            }
        });
    }
});