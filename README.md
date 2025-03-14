# Blue Bus Schedule Helper

This Chrome extension helps you quickly find the next available Blue Bus departure time without manual search on the bus schedule page. Here's what it can do:

## Features

### Core Features

1. **Automatic Bus Time Highlighting:**
    When enabled, the extension automatically scans the Blue Bus schedule page and highlights the next available departure time from now with a light blue background. 

2. **Choose Your Departure Location:** Select your preferred departure location:

- BMC (Bryn Mawr College): For buses departing from Bryn Mawr College
  
- HC (Haverford College): For buses departing from Haverford College

3. **Auto-Updating Schedule:** Once enabled, the extension will automatically refresh the highlighted departure time every 60 seconds, ensuring you always see the most current information without having to manually refresh the page.

### Advanced Features

**Custom Time Setting:**

The "Use custom time" feature lets you:

- Select any day of the week
  
- Set a specific time (`hour:minute` and `AM/PM`)

- View which bus would be next at that specific day and time

## How to Use
**Basic Usage**

1. Click the Blue Bus Tracker icon in your Chrome toolbar to open the popup

2. Toggle the switch to enable/disable the extension

3. Select your departure location (BMC or HC)

The extension will automatically highlight the next available bus time on the schedule page

**Using Custom Time**

1. Check the `use custom time` box

2. Select a day of the week from the dropdown menu

3. Enter the hour (1-12) and minute (0-59)

4. Select AM or PM

5. **Important**: Click `set time` to find what bus would be next at that time

6. Uncheck the `use custom time` box to return to current time

## Notes and Limitations

- The extension only works on the official Blue Bus schedule page: [https://www.brynmawr.edu/inside/offices-services/transportation/blue-bus-bi-co](https://www.brynmawr.edu/inside/offices-services/transportation/blue-bus-bi-co)

- The schedule webpage lists times past midnight (e.g., 12:30 AM) on the current day's table rather than the next day's table. The extension interprets these times as they appear on the website - as early morning times on the current day. If you're looking for buses that run shortly after midnight, you may need to check both the late-night section of today's schedule and the early morning section of tomorrow's schedule to find your options.
  
- The extension does not account for holidays or special schedules. It will display the next available bus time based on the regular schedule.

- Always click the `set time` button after entering a custom time to update the highlighted departure time.

## Installation (Developer Mode)

1. Download the source code or clone the repository:

    `git clone https://github.com/your-username/your-repo.git`

2. Open Google Chrome and navigate to `chrome://extensions/`.

3. Enable **Developer mode** (toggle at the top right).

4. Click **Load unpacked** and select the extension folder.

5. The extension is now installed and ready to use!

## Contact

For any issues or feature requests, feel free to open an issue or reach out at [cnguyen@brynmawr.edu]().