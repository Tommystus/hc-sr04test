/*
	Ultrasonic sensor HC-SR04 test
	10us pulse is generated using c-code in main program
	pulse measurement is done using gpio pin interrupt handler
*/
load('api_gpio.js');
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


Timer.set(1000, true, function() {

	GPIO.write(ledPin,0);	// signal LED - use gpio is ok before trigger
	hcTrigEchoCb(trigPin, function( t, arg) {
		print('**t-echo t=', t);
		GPIO.write(ledPin,1); 	// touch gpio after echo is ok
	}, null);

}, null);


if (hcInitEcho(trigPin,echoPin)) {
	print('**Echo Initialized **');
}

GPIO.write(ledPin,1); // turn off led
