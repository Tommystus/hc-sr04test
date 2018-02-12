/*
	Use HC-SR04 to control tone.  Test for possible use in vision impaired application.
*/
load('api_gpio.js');
load('api_sys.js');
load('api_timer.js');
load('api_pwm.js');


let MAX_PING_TIME = 20000;

let ledPin = 2; // GPIO2 => D4 Blue LED
let bzzPin = 4; // GPIO4 => D2

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

let setBuzz = function(t) {
	if ((t > 300) && (t < MAX_PING_TIME)) {
		let freq = Math.round(10e6/((t*2)+100));
		print("f=", freq);
		PWM.set(bzzPin, freq, 0.4);
	}
	else {
		print("bzz off");
		PWM.set(bzzPin, 0.0, 0.0);
	}
};

Timer.set(500, true, function() {

	GPIO.write(ledPin,0);	// signal LED - use gpio is ok before trigger
	hcTrigEchoCb(trigPin, function( t, arg) {
		print('**t-echo t=', t);
		setBuzz(t);
		GPIO.write(ledPin,1); 	// touch gpio after echo is ok
	}, null);

}, null);


if (hcInitEcho(trigPin,echoPin)) {
	print('**Echo Initialized **');
}

GPIO.write(ledPin,1); // turn off led
