# Ultrasonic HC-SR04 Test

## Overview

Concept testing of time measurement from HC-SR04 ultrasonic sensor echo pulse on [Mongoose OS](https://mongoose-os.com/).  Interrupt code based on [IR library](https://github.com/mongoose-os-libs/ir).  Eventually, code need to be converted to a lib for general use.

Examples build:
```
git clone https://github.com/Tommystus/hc-sr04test.git
mos build --arch esp8266
mos flash
```

Wiring circuit for this test:
![HC-SR04-Test](https://github.com/Tommystus/hc-sr04test/blob/master/HC-SR04-Test.png)

The diode is there to protect ESP8266 from 5v signal of the HC-SR04 module (just in case!).

Much time was spent on moving code around to prevent trigger interrupt from interfering with timer.  See code comment.  Also, keep trigger and echo lines separated to prevent signal crosstalk which may cause false trigger.

Rough formula for converting echo pulse width micro-second time to centimeter:  d = (t+14)/55

Examples ping to sound [pingbuz.js](https://github.com/Tommystus/hc-sr04test/blob/master/examples/pingbuz.js) demo [video](https://www.youtube.com/watch?v=fkWPz4LJ7Sw)
