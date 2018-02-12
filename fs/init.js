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


/* Complext use.
	Try not to use global var in callback method.
	Use user object to pass data around for stability
*/
let myData = {
	deviceAvailable: true,
	dataReady: false,
	icnt: 1,
	tacc: 0,
	tcnt: 0,
	tavg: 0,
	doTrig: function(t, arg) {
		arg.tacc += t;
		arg.tcnt++;
//		print('**m-echoCb t=', t, 'tacc=', arg.tacc, 'tcnt=', arg.tcnt);
		if (arg.icnt > 1) {
			arg.icnt--;
			Timer.set(10, false, function(arg) {
				hcTrigEchoCb(trigPin, arg.doTrig, arg);
			},arg);
		}
		else {
			arg.tavg = arg.tacc/arg.tcnt;
			print('**m-echoCb tavg=', arg.tavg, 'tcnt=', arg.tcnt);
			arg.deviceAvailable = true;
			arg.dataReady = true;
		}
	},

	startMultiTrig: function(icnt) {
		this.icnt = icnt;
		this.tacc = 0;
		this.tcnt = 0;
		this.deviceAvailable = false;
		this.dataReady = false;
		hcTrigEchoCb(trigPin, this.doTrig, this);
	}
};


// Note:  mos console command reset the GPIO edge detection
// so it may trigger without button press
GPIO.set_button_handler(btnPin, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
	// button must remain low to work
	if (GPIO.read(btnPin))
		return;

	print('**Button Trigger');


/*	use call back method is stable
	hcTrigEchoCb(trigPin, function( t, arg) {
		print('**b-echoCb t=', t, 'arg=', arg);
	}, 2);
*/

/*  Use user data obj to do multiple trigger */
	myData.startMultiTrig(4);

}, null);


Timer.set(1000, true, function() {

/* single trigger with callback is ok
	if (myData.deviceAvailable) {
		GPIO.write(ledPin,0);	// signal LED - use gpio is ok before trigger
		hcTrigEchoCb(trigPin, function( t, arg) {
			print('**t-echo t=', t);
			GPIO.write(ledPin,1); 	// touch gpio after echo is ok
		}, null);
	}
*/
	if (myData.dataReady) {
		print('**t-echoCb tavg=', myData.tavg, 'tcnt=', myData.tcnt);
		myData.dataReady = false;
	}

}, null);


if (hcInitEcho(trigPin,echoPin)) {
	print('**Echo Initialized **');
}

GPIO.write(ledPin,1); // turn off led
