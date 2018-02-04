/*
	Ultrasonic sensor HC-SR04 test
	10us pulse is generated using c-code in main program
	pulse measurement is done using gpio pin interrupt handler
*/
load('api_gpio.js');
load('api_mqtt.js');
load('api_events.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');


let ledPin = 2; // GPIO2 => D4 Blue LED

let btnPin = 0; // GPIO0 => D3 builtin button (flash)
let trigPin = 15;	// GPI15 => D8 trigger pin 10us to start
let echoPin = 5;	// GPIO5 => D1 echo pulse pin

GPIO.set_mode(ledPin, GPIO.MODE_OUTPUT);
GPIO.write(ledPin,0); // activate LED

let hcInitEcho = ffi('int hcInitEcho(int, int)');
let hcTrigEcho = ffi('int hcTrigEcho(int)');
let hcTrigEchoCb = ffi('void *hcTrigEchoCb(int, void (*)(int, userdata), userdata)');
let hcGetEchoTime = ffi('double hcGetEchoTime(void)');

GPIO.set_mode(trigPin, GPIO.MODE_OUTPUT);
GPIO.write(trigPin,0);


// Note:  mos console command reset the GPIO edge detection
// so it may trigger without button press
GPIO.set_button_handler(btnPin, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
	// button must remain low to work
	if (GPIO.read(btnPin))
		return;

	print('**Button Trigger');

/* ok but not great
	Timer.set(200, false, function() {
		let t = hcGetEchoTime();
		print('**echo t=', t);	// result from last trigger
// 		fire trigger without callback
		hcTrigEcho(trigPin);	// trigger for next cycle
	}, null);
*/

/*	use call back method is stable
*/
	hcTrigEchoCb(trigPin, function( t, arg) {
		print('**b-echoCb t=', t);
	}, null);

/* multiple trig to get avg doesn't work
	let tcnt = 2;
	let tacc = 0;
	for (let i=0; i < tcnt; i++) {
		hcTrigEchoCb(trigPin, function( t, arg) {
			tacc += t;
		}, null);
		Sys.usleep(200000);
	}
	let t = tacc/tcnt;
	print('**bt-echo avg t=', t);
*/
/* also unstable
	let tacc = 0;
	let tcnt = 4;
	for (let i=0; i < tcnt; i++) {
		let waitForEcho = true;
		hcTrigEchoCb(trigPin, function( t, arg) {
			tacc += t;
			waitForEcho = false;
		}, null);
		while (waitForEcho) {
			Sys.wdt_feed();
		}
	}
	let t = tacc/tcnt;
	print('**bt-echo avg t=', t);
*/

}, null);


Timer.set(4000, true, function() {

/* This is ok - only touch gpio before trigger
	GPIO.write(ledPin,0);
	Timer.set(100, false, function() {
		let t = hcGetEchoTime();
		print('**t-echo t=', t);	// result from last trigger
		GPIO.write(ledPin,1);
		// stable trigger here
		hcTrigEcho(trigPin);	// trigger for next cycle
	}, null);
*/

/* single trigger with callback is ok
*/
	GPIO.write(ledPin,0);	// signal LED - use gpio is ok before trigger
	hcTrigEchoCb(trigPin, function( t, arg) {
		print('**t-echo t=', t);
		GPIO.write(ledPin,1); 	// touch gpio after echo is ok
	}, null);

/* Multiple trigger with wait delay to do echo avg is unstable
	let tcnt = 2;
	let tacc = 0;
	for (let i=0; i < tcnt; i++) {
		hcTrigEchoCb(trigPin, function( t, arg) {
			tacc += t;
		}, null);
		Sys.usleep(200000);
	}
	let t = tacc/tcnt;
	print('**t1a-echo avg t=', t);
*/

//	GPIO.write(ledPin,1); // don't touch gpio during trigger operation

}, null);


if (hcInitEcho(trigPin,echoPin)) {
	print('**Echo Initialized **');
}

GPIO.write(ledPin,1); // turn off led
