#include <stdio.h>

#include "common/platform.h"
#include "common/cs_file.h"
#include "mgos_app.h"
#include "mgos_gpio.h"
#include "mgos_sys_config.h"
#include "mgos_timers.h"
#include "mgos_hal.h"
#include "mgos_dlsym.h"
#include "mjs.h"
#include "mgos_system.h"


struct hcDataRec_s {
  int tpin;
  int epin;
  uint64_t t;
};
static struct hcDataRec_s hcObj;

static void echoHandler(int pin, void *arg)
{
  struct hcDataRec_s *obj = (struct hcDataRec_s *)arg;

  // get microseconds
  uint64_t t = (uint64_t) (1000000 * mgos_uptime());

  // 0-1 transition?
  if (mgos_gpio_read(pin)) {
    // start counter
    obj->t = t;
    return;
  }
  // 1-0 transition. Save delta time
  t -= obj->t;
  obj->t = t;
//  mgos_gpio_disable_int(pin); // not an issue to keep interrupt enabled
}

int hcInitEcho( int tpin, int epin) {
	hcObj.tpin = tpin;
	hcObj.epin = epin;

	// install interrupt handler for echo pin
	// must use pull up with HC-SR04 module
	// based on code from IR lib
	if (
	!mgos_gpio_set_mode(epin, MGOS_GPIO_MODE_INPUT) ||
	!mgos_gpio_set_pull(epin, MGOS_GPIO_PULL_UP) ||
	!mgos_gpio_set_int_handler_isr(epin, MGOS_GPIO_INT_EDGE_ANY, echoHandler, (void *)&hcObj) ||
	!mgos_gpio_enable_int(epin)
	) {
		return 0;
	}
	return 1;
}

// start trigger echo
int hcTrigEcho(int tpin) {
	hcObj.t = 0;

//	mgos_gpio_enable_int(hcObj.epin);  // not an issue to keep interrupt enabled

	mgos_gpio_write( tpin, 1);
	mgos_usleep(10);
	mgos_gpio_write( tpin, 0);

	return 1;
}

double hcGetEchoTime(void) {

	return (double) hcObj.t;
}

enum mgos_app_init_result mgos_app_init(void) {
  return MGOS_APP_INIT_SUCCESS;
}
