// content.js
// This script runs on the Blue Bus schedule page and highlights the next bus time

console.log("Blue Bus extension is running!");

// test with now is Sat at 4:45 PM, March 15, 2025
let isCustomTime = false;
let customTime = null;
let updateIntervalId = null; // Store the interval ID for clearing later
const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const saturdayDayTable = "Saturday Daytime";
const saturdayNightTable = "Saturday Night";

/**
 * Gets the current time, either actual or custom if set
 * @returns {Date}
 */
function getCurrentTime() {
    if (isCustomTime && customTime) {
        console.log("Using custom time:", customTime);
        return customTime;
    } else {
        return new Date();
    }
}

function setCustomTime(time) {
    const dayIndex = daysOfWeek.indexOf(time.day);

    let hour = time.hour;
    // Convert to 24-hour format
    if (time.period === "pm" && hour < 12) {
        hour += 12;
    } else if (time.period === "am" && hour === 12) {
        hour = 0;
    }

    // Create a new date with the current year/month but custom day/time
    const now = new Date();
    customTime = new Date(now);
    
    // Find the next occurrence of the specified day
    const currentDay = now.getDay();
    const daysToAdd = (dayIndex + 7 - currentDay) % 7;
    
    customTime.setDate(now.getDate() + daysToAdd);
    customTime.setHours(hour, time.minute, 0, 0);
    
    isCustomTime = true;
    console.log("Custom time set to:", customTime);

    return customTime;
}

/**
 * Resets to using the current system time
 */
function useSystemTime() {
    isCustomTime = false;
    customTime = null;
    console.log("Reset to using system time");
}

/**
 * Returns the table element matching the given day index.
 * @param {number} dayName
 * @returns {HTMLElement|null}
 */
function getTableForDay(dayName) {
    const theads = document.querySelectorAll("thead.table-scroller");
    for (const thead of theads) {
        const header = thead.querySelector("h3");
        if (header && header.innerText.trim().toLowerCase() === dayName.toLowerCase()) {
            return thead.parentElement; 
        }
    }
    return null;
}

/**
 * Determines the cell index for departure time based on day and table type
 * @param {number} dayIndex - Day of week (0-6)
 * @param {HTMLElement} table - The table element, used for Saturday night table detection
 * @param {string} departureLocation - "BMC" or "HC"
 * @returns {number} - The cell index (0-based)
 */
function getDepartureTimeIndex(dayIndex, table, departureLocation) {
    // Check if this is a weekday (Monday-Friday)
    if (dayIndex >= 1 && dayIndex <= 5) {
        return departureLocation === "BMC" ? 0 : 2;
    }
    
    // Handle Saturday (check if day or night table)
    if (dayIndex === 6) {
        const isNightTable = checkIfNightTable(table);
        if (isNightTable) {
            console.log("Saturday night table detected");
            return departureLocation === "BMC" ? 0 : 1;
        } else {
            console.log("Saturday day table detected");
            return departureLocation === "BMC" ? 0 : 2; 
        }
    }
    
    // Handle Sunday (always night table format)
    if (dayIndex === 0) {
        return departureLocation === "BMC" ? 0 : 1;
    }
    
    // Default fallback
    return departureLocation === "BMC" ? 0 : 2;
}

/**
 * Checks if a Saturday table is a night table
 * @param {HTMLElement} table - The table element
 * @returns {boolean}
 */
function checkIfNightTable(table) {
    if (!table) return false;
    
    // Night tables typically have fewer columns and different header structure
    const headerRow = table.querySelector("thead tr");
    if (!headerRow) return false;
    
    const cells = headerRow.querySelectorAll("th");
    
    // If it has 2-3 columns, it's likely a night table
    //if (cells.length <= 3) return true;
    
    // Look for "Night" in table or headers
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].innerText.toLowerCase().includes("night")) {
            return true;
        }
    }
    
    return false;
}

/**
 * Gets bus schedule rows.
 * @param {HTMLElement} table
 * @returns {NodeListOf<HTMLTableRowElement>}
 */
function getBusRows(table) {
    try {
        return table ? table.querySelectorAll("tbody tr") : [];
    } catch (error) {
        console.error("Error getting bus rows:", error);
        return [];
    }
}

/**
 * Parses a time string (expected in format HH:MMa or HH:MMp) into a Date object.
 * Adjusts the date if the bus schedule is for a day other than today.
 *
 * @param {number} tableDayIndex - The day index (0 to 6) the schedule belongs to.
 * @param {string} timeStr - The time string (e.g., "12:30p").
 * @param {Date} now - The current date and time.
 * @returns {Date|null}
 */
function parseTime(tableDayIndex, timeStr, now) {
    const match = timeStr.match(/(\d+):(\d+)(a|p)/);
    if (!match) return null;

    let [, hourStr, minuteStr, period] = match;
    let hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);
    period = period.toLowerCase();

    if (minutes >= 60) {
        console.warn("Invalid minute value:", timeStr);
        return null;
    }

    if (period.toLowerCase().startsWith("p") && hours !== 12) {
        hours += 12;
    } else if (period.toLowerCase().startsWith("a") && hours === 12) {
        hours = 0;
    }

    let busTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    // Adjust the date if the bus schedule is for a day other than today
    // by finding days to add because we have to use setDate()
    if (tableDayIndex !== now.getDay()) {
        const daysToAdd = (tableDayIndex + 7 - now.getDay()) % 7;
        busTime.setDate(busTime.getDate() + daysToAdd);
    }

    return busTime;
}

/**
 * Highlights a table row by changing its background and font weight
 * @param {HTMLElement} row
 * @param {boolean} shouldScroll - Whether to scroll to the highlighted row
 * @param {number} timeIndex - BMC or HC slot
 */
function highlightRow(row, shouldScroll = false, timeIndex) {
    // Get all cells in the row
    const cells = row.querySelectorAll("td");
    if (!cells || cells.length === 0) return;

    // Make sure the index is valid
    if (timeIndex >= cells.length) return;
    
    // Get the specific cell
    const departureCell = cells[timeIndex];

    departureCell.style.backgroundColor = "#D4F1F4";

    if (shouldScroll) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

/**
 * Removes highlighting from all rows
 */
function removeAllHighlights() {
    // Get all table rows
    const allRows = document.querySelectorAll("tbody tr");
    
    // Remove highlighting from each row
    allRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        cells.forEach(cell => {
            // Ensure we remove background color for every cell
            cell.style.backgroundColor = ""; 
        });
    });
    
    // // Scroll to the top of the page
    // window.scrollTo({
    //     top: 0,
    //     behavior: "smooth"
    // });
    
    console.log("All highlights removed and returned to top");
}

/**
 * Finds the nearest bus time from the given rows based on the current time
 * @param {NodeListOf<HTMLTableRowElement>} rows
 * @param {Date} now
 * @param {number} tableDayIndex
 * @returns {Object} - An object containing the next bus row and time
 */
function nearestBusTime(now, tableDayIndex, table, departureLocation) {
    let nextBusTime = null;
    let nextBusRow = null;

    // Find today's table
    const rows = getBusRows(table); 
    console.log(`Found ${rows.length} rows for today`);

    // Get the correct cell index for the departure location
    const timeIndex = getDepartureTimeIndex(tableDayIndex, table, departureLocation);

    // Check today's schedule rows
    for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (!cells || cells.length <= timeIndex) continue;

        const timeCell = cells[timeIndex];
        if (!timeCell) continue;

        const timeStr = timeCell.innerText.trim();
        console.log(`Checking time: ${timeStr}`);

        const busTime = parseTime(tableDayIndex, timeStr, now);
        console.log(`Bus time: ${busTime} compared to now: ${now}`);

        if (busTime && busTime > now) {
            console.log(`Next bus time found: ${busTime}`);
            nextBusTime = busTime;
            nextBusRow = row;
            break;
        }
    }

    return { nextBusRow, nextBusTime, timeIndex };
}

/**
 * Finds and highlights the next bus row based on the current time
 */
function findAndHighlightNextBus(shouldScroll = false) {
    chrome.storage.local.get(['departureLocation'], function(result) {
        let nextBusTime = null;
        let nextBusRow = null;

        // Default to BMC if no location is saved
        const departureLocation = result.departureLocation || "BMC";
        console.log(`Finding next bus departing from ${departureLocation}`);

        // Find today's table
        const now = getCurrentTime();
        // For testing: now is 11:34pm on Friday, Mar 14 2025
        // const now = new Date(2025, 2, 14, 23, 34);
        const todayIndex = now.getDay();

        removeAllHighlights();

        // Check if today is Saturday, which has two different schedules
        if (todayIndex === 6) {
            console.log("Saturday detected");
            const tables = [getTableForDay(saturdayDayTable), getTableForDay(saturdayNightTable)];
            
            for (const table of tables) {
                if (!table) continue;

                ({ nextBusRow, nextBusTime, timeIndex } = nearestBusTime(now, todayIndex, table, departureLocation));

                if (nextBusRow) {
                    highlightRow(nextBusRow, shouldScroll, timeIndex);
                    return;
                }
            }

        } else { // regular weekday or Sunday
            const todayTable = getTableForDay(daysOfWeek[todayIndex]);

            // Check today's schedule rows
            ({ nextBusRow, nextBusTime, timeIndex } = nearestBusTime(now, todayIndex, todayTable, departureLocation));

            if (nextBusTime) {
                highlightRow(nextBusRow, shouldScroll, timeIndex);
                return;
            }
        }

        // If no buses remain today, check subsequent days' schedule
        if (!nextBusTime) {
            console.log("No more buses today, checking subsequent days' schedule...");
            for (let i = 1; i <= 7; i++) { // Check up to 7 days ahead
                const nextDayIndex = (todayIndex + i) % 7;
                console.log(`Checking ${daysOfWeek[nextDayIndex]}`);

                if (nextDayIndex === 6) {
                    console.log("Checking Saturday schedule...");
                    const tables = [getTableForDay(saturdayDayTable), getTableForDay(saturdayNightTable)];
                    
                    for (const table of tables) {
                        if (!table) continue;
        
                        const result = nearestBusTime(now, nextDayIndex, table, departureLocation);
                        if (result.nextBusTime && (!nextBusTime || result.nextBusTime < nextBusTime)) {
                            nextBusTime = result.nextBusTime;
                            nextBusRow = result.nextBusRow;
                        }
        
                        if (nextBusRow) {
                            highlightRow(nextBusRow, shouldScroll, timeIndex);
                            return;
                        }
                    }
        
                } else {
                    const nextDayTable = getTableForDay(daysOfWeek[nextDayIndex]);

                    ({ nextBusRow, nextBusTime, timeIndex } = nearestBusTime(now, nextDayIndex, nextDayTable, departureLocation));
                    if (nextBusTime) {
                        highlightRow(nextBusRow, shouldScroll, timeIndex);
                        return;
                    }
                }
    
            }
        }

        if (!nextBusTime) {
            console.log("Could not find next bus time");
            return;
        }

        // Highlight the next bus row
        highlightRow(nextBusRow, shouldScroll, timeIndex);
        
    });
}


/**
 * Starts automatic updating at regular intervals
 */
function startAutoUpdate() {
    // Clear any existing interval first
    if (updateIntervalId) {
        clearInterval(updateIntervalId);
    }
    
    // Set up new interval (60 seconds = 60000 milliseconds)
    updateIntervalId = setInterval(function() {
        console.log("Auto-updating bus times...");
        findAndHighlightNextBus(false);
    }, 60000);
}

/**
 * Stops automatic updating
 */
function stopAutoUpdate() {
    if (updateIntervalId) {
        clearInterval(updateIntervalId);
        updateIntervalId = null;
        console.log("Auto-update stopped");
    }
}

/**
 * Toggles the extension features on or off
 * @param {boolean} isEnabled - Whether the extension should be enabled
 */
function toggleExtension(isEnabled) {
    if (isEnabled) {
        console.log("Extension enabled");
        findAndHighlightNextBus(true);
        startAutoUpdate();
    } else {
        console.log("Extension disabled");
        stopAutoUpdate();
        removeAllHighlights();

        // Scroll to the top of the page
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}

// Run automatically when the page loads
function initializeExtension() {
    chrome.storage.local.get(['toggleState'], function(result) {
        // Default to true (enabled) if no state is saved
        const isEnabled = result.toggleState !== undefined ? result.toggleState : true;
        toggleExtension(isEnabled);
    });
}

// Run when page is fully loaded
if (document.readyState === 'complete') {
    initializeExtension();
} else {
    window.addEventListener('load', initializeExtension);
}

// Listen for the message from popup.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "findNextBus") {
        toggleExtension(true);
    } else if (message.action === "disableHighlight") {
        toggleExtension(false);
    } else if (message.action === "toggleExtension") {
        toggleExtension(message.isEnabled);
    } else if (message.action === "changeDepartureLocation") {
        chrome.storage.local.set({ departureLocation: message.location }, function() {
            if (message.updateNow) {
                findAndHighlightNextBus(true);
            }
        });
    } else if (message.action === "useCustomTime") {
        // Set custom time and update display
        setCustomTime(message.customTime);
        findAndHighlightNextBus(true);
    } else if (message.action === "useCurrentTime") {
        // Reset to current time and update display
        useSystemTime();
        findAndHighlightNextBus(true);
    } 
}); 