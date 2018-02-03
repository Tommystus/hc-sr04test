# Ultrasonic HC-SR04 Test

## Overview

Test echo time measurement from HC-SR04 ultrasonic sensor pulse on Mongoose OS.  Interrupt code based on IR library.

Examples build:
```
git clone https://github.com/Tommystus/hc-sr04test.git
mos build --arch esp8266
mos flash
```

Wiring circuit for this test:
![HC-SR04-Test](hc-sr04test/HC-SR04-Test.png)

Much time was spent on moving code around to prevent trigger interrupt from interfering with timer.  See code comment.

