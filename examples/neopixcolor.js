/*
	Use HC-SR04 to control neopix color
*/
load('api_gpio.js');
load('api_sys.js');
load('api_timer.js');
load('api_neopixel.js');


let MAX_PING_TIME = 2000;
let maxBrighness = 40;

let ledPin = 2; // GPIO2 => D4 Blue LED
let pxPin = 4; // GPIO4 => D2

let btnPin = 0; // GPIO0 => D3 builtin button (flash)
let trigPin = 15;	// GPI15 => D8 trigger pin 10us to start
let echoPin = 5;	// GPIO5 => D1 echo pulse pin

GPIO.set_mode(ledPin, GPIO.MODE_OUTPUT);
GPIO.write(ledPin,0); // activate LED

let strip = NeoPixel.create(pxPin, 1, NeoPixel.GRB);

let hcInitEcho = ffi('int hcInitEcho(int, int)');
let hcTrigEcho = ffi('int hcTrigEcho(int)');
let hcTrigEchoCb = ffi('void *hcTrigEchoCb(int, void (*)(int, userdata), userdata)');
let hcGetEchoTime = ffi('double hcGetEchoTime(void)');

GPIO.set_mode(trigPin, GPIO.MODE_OUTPUT);
GPIO.write(trigPin,0);

let setPixColor = function(t) {
	if ((t > 14) && (t < MAX_PING_TIME)) {
		let startColorIdx = Math.round(maxBrighness/2);
		let lv = maxBrighness + 1;
		let binPad = 30;
		let colorSpace = lv*6;
		let indexSize = colorSpace/(binPad);

		let i = Math.round(binPad*t/MAX_PING_TIME);
		let idx = (i+1)*indexSize + startColorIdx;
		let v = idx % lv;
		let  redLevel,greenLevel,blueLevel;

		idx = Math.floor(idx/lv);
		if (idx === 5) {
			redLevel=maxBrighness; greenLevel=0; blueLevel=maxBrighness-v;
		}
		else if (idx === 4) {
			redLevel=v; greenLevel=0; blueLevel=maxBrighness;
		}
		else if (idx === 3) {
			redLevel=0; greenLevel=maxBrighness-v; blueLevel=maxBrighness;
		}
		else if (idx === 2) {
			redLevel=0; greenLevel=maxBrighness; blueLevel=v;
		}
		else if (idx === 1) {
			redLevel=maxBrighness-v; greenLevel=maxBrighness; blueLevel=0;
		}
		else {
			redLevel=maxBrighness; greenLevel=v; blueLevel=0;
		}
		print('i=', i, 'r=', redLevel, 'g=', greenLevel, 'b=', blueLevel);
		strip.setPixel(0,  redLevel, greenLevel, blueLevel);
		strip.show();
	}
};

Timer.set(1000, true, function() {

	GPIO.write(ledPin,0);	// signal LED - use gpio is ok before trigger
	hcTrigEchoCb(trigPin, function( t, arg) {
		print('**t-echo t=', t);
		setPixColor(t);
		GPIO.write(ledPin,1); 	// touch gpio after echo is ok
	}, null);

}, null);


if (hcInitEcho(trigPin,echoPin)) {
	print('**Echo Initialized **');
}

GPIO.write(ledPin,1); // turn off led
