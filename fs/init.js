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

	/* Very strange random system hangup / unstable after a few button press
	   when trigger right before timer
	   maybe because usleep in trigger function?
		hcTrigEcho(trigPin);
	*/
//	Timer.set(200, false, function() {
		let t = hcGetEchoTime();
		print('**echo t=', t);	// result from last trigger
		hcTrigEcho(trigPin);	// trigger for next cycle
//	}, null);

}, null);


Timer.set(2000, true, function() {
	GPIO.write(ledPin,0);	// signal LED
	/* trigger before timer is unstable - not sure why
	   maybe due to usleep in hcTrigEcho
	hcTrigEcho(trigPin);
	*/
	Timer.set(100, false, function() {
		let t = hcGetEchoTime();
		print('**t-echo t=', t);	// result from last trigger
		GPIO.write(ledPin,1);
		// stable trigger here
		hcTrigEcho(trigPin);	// trigger for next cycle
	}, null);
}, null);


if (hcInitEcho(trigPin,echoPin)) {
	print('**Echo Initialized **');
}

GPIO.write(ledPin,1); // turn off led
