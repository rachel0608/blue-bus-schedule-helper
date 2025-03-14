// popup.js
// This script handles the popup UI and sends messages to the content script

document.addEventListener("DOMContentLoaded", function () {
    const mainToggleSwitch = document.getElementById("mainToggleSwitch");
    const bmcOption = document.getElementById("bmcButton");
    const hcOption = document.getElementById("hcButton");
    const customTimeCheckbox = document.getElementById("customTimeCheckbox");
    const customTimeSettings = document.getElementById("timeSettings");
    const confirmBtn = document.getElementById("confirm-btn");
    const daySelect = document.getElementById("day");
    const hourInput = document.getElementById("hour");
    const minuteInput = document.getElementById("minute");
    const amOption = document.getElementById("am");
    const pmOption = document.getElementById("pm");

    let period = "am"; // Default to AM
    let bmc = "BMC";
    let hc = "HC";
    
    // Load the saved state every time the pop-up is opened
    chrome.storage.local.get(['toggleState', 'departureLocation', 'customTimeEnabled', 'customTime'], function(result) {
        // Set ON/OFF default to enabled if no state is saved
        mainToggleSwitch.checked = result.toggleState !== undefined ? result.toggleState : true;
        
        // Set departure location (default to BMC)
        const departureLocation = result.departureLocation || bmc;
        
        if (departureLocation === bmc && bmcOption) {
            bmcOption.classList.add("active");
            hcOption.classList.remove("active");
        } else if (departureLocation === hc && hcOption) {
            hcOption.classList.add("active");
            bmcOption.classList.remove("active");
        }     

        // Set custom time toggle and values if they exist
        if (result.customTimeEnabled) {
            customTimeCheckbox.checked = true;
            customTimeSettings.style.display = "block";
            
            if (result.customTime) {
                // Set day
                if (result.customTime.day) {
                    daySelect.value = result.customTime.day;
                }
                
                // Set hour
                if (result.customTime.hour !== undefined) {
                    hourInput.value = result.customTime.hour;
                }
                
                // Set minute
                if (result.customTime.minute !== undefined) {
                    minuteInput.value = result.customTime.minute; 
                }
                
                // Set AM/PM
                period = result.customTime.period || "am";
                if (period === "am") {
                    amOption.classList.add("active");
                    pmOption.classList.remove("active");
                } else {
                    pmOption.classList.add("active");
                    amOption.classList.remove("active");
                }
            }
        }
    });

    // Listen to ON/OFF toggle
    if (mainToggleSwitch) {
        mainToggleSwitch.addEventListener("change", function() {
            const isEnabled = mainToggleSwitch.checked;
            
            // Save the toggle state to chrome storage
            chrome.storage.local.set({ toggleState: isEnabled });
            
            // Send message to background script
            chrome.runtime.sendMessage({
                source: "popup",
                target: "content",
                action: "toggleExtension", 
                isEnabled: isEnabled 
            });
        });
    }

    // Listen to BMC/HC buttons
    if (bmcOption && hcOption) {
        bmcOption.addEventListener("click", function() {
            console.log("BMC Button Clicked!");
            bmcOption.classList.add("active");
            hcOption.classList.remove("active");
            updateDepartureLocation(bmc);
        });
        
        hcOption.addEventListener("click", function() {
            console.log("HC Button Clicked!");
            hcOption.classList.add("active");
            bmcOption.classList.remove("active");
            updateDepartureLocation(hc);
        });
    }

    // Listen to AM/PM buttons
    if (amOption && pmOption) {
        amOption.addEventListener("click", function() {
            console.log("AM Button Clicked!");
            amOption.classList.add("active");
            pmOption.classList.remove("active");
            period = "am";
        });
        
        pmOption.addEventListener("click", function() {
            console.log("PM Button Clicked!");
            pmOption.classList.add("active");
            amOption.classList.remove("active");
            period = "pm";
        });
    }

    // Listen to hour and minute
    if (hourInput) {
        hourInput.addEventListener("input", function() {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Enforce hour range (1-12)
            let val = parseInt(this.value);
            if (val > 12) {
                alert("oopsie! hour between 1 and 12 only ~");
                this.value = "12";
            }
            
            if (val < 1 && this.value !== "") {
                alert("oopsie! hour between 1 and 12 only ~");
                this.value = "1";
            }
        });
    }

    if (minuteInput) {
        minuteInput.addEventListener("input", function() {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Enforce minute range (0-59)
            let val = parseInt(this.value);
            if (val > 59) {
                alert("oopsie! minute between 0 and 59 only ~");
                this.value = "59";
            }
            // if (isNaN(val)) this.value = "0";
        });
    }

    // Listen to confirm button
    if (confirmBtn) {
        confirmBtn.addEventListener("click", function() {   
            console.log("Confirm Button Clicked!");
            const day = daySelect.value;
            const hour = parseInt(hourInput.value) || 12;
            const minute = parseInt(minuteInput.value) || 0;

            // Create custom time object
            const customTime = {
                day: day,
                hour: hour,
                minute: minute,
                period: period
            };

            // Save custom time to chrome storage
            chrome.storage.local.set({ 
                customTimeEnabled: true,
                customTime: customTime 
            });

            // Send message to content script
            chrome.runtime.sendMessage({
                source: "popup",
                target: "content",
                action: "useCustomTime",
                customTime: customTime
            });
            
            console.log("Custom time set:", customTime);
        });
    }

    // Send location to content script
    function updateDepartureLocation(location) {
        // Set the location to chrome storage
        chrome.storage.local.set({ departureLocation: location });
        console.log("Departure location updated to: " + location);
        
        // Update if extension is enabled
        chrome.storage.local.get(['toggleState'], function(result) {
            const isEnabled = result.toggleState !== undefined ? result.toggleState : true;
            
            if (isEnabled) {
                chrome.runtime.sendMessage({
                    source: "popup", 
                    target: "content",
                    action: "changeDepartureLocation", 
                    location: location,
                    updateNow: true
                });
            }
        });
    }

    // Listen to custom time checkbox
    if (customTimeCheckbox) {
        customTimeCheckbox.addEventListener("change", function () {
            const isChecked = customTimeCheckbox.checked;
            customTimeSettings.style.display = customTimeCheckbox.checked ? "block" : "none";

            // If unchecked, disable custom time
            if (!isChecked) {
                chrome.storage.local.set({ customTimeEnabled: false });
                
                // Send message to content script to use current time
                chrome.runtime.sendMessage({
                    source: "popup",
                    target: "content",
                    action: "useCurrentTime"
                });
            }
        });
    }
   
});