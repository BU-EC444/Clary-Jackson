#  WiFi-ESP-Station

Author: Jackson Clary

Date: 2026-04-12

### Summary

For this skill, I set up the ESP32 as a WiFi station (STA) using ESP-IDF's official station example. The firmware brings up the WiFi STA interface, registers handlers for WIFI_EVENT and IP_EVENT_STA_GOT_IP, and waits on a FreeRTOS event group until the board gets an IP or hits the retry limit.
To get it working, I set the Example Connection Configuration in menuconfig (SSID, password, auth options), then flashed the image and checked the serial monitor to confirm it associated with the AP and printed "got ip" with a valid address.

### Evidence of Completion

![Skill 21 Evidence 1](images/Skill21_1.png)

![Skill 21 Evidence 2](images/Skill21_2.png)


### AI and Open Source Code Assertions

- I have documented in my code readme.md and in my code any
software that we have adopted from elsewhere
- I used AI for coding and this is documented in my code as
indicated by comments "AI generated" 



