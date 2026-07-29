function raw_angle () {
    bu = pins.pins_i2cWriteReadBuffer(pins.pins_i2cAdressen(pins.ei2cAdressen.AS5600), pins.buffer_fromArray([12]), 2)
    if (bu) {
        return pins.buffer_getNumber(bu, NumberFormat.UInt16BE, 0)
    } else {
        return 0
    }
}
let speed = 0
let differenz = 0
let rotary_4096 = 0
let minute_4096 = 0
let bu: Buffer = null
pins.addDisplay(pins.pins_DigitalPin(DigitalPin.C16), pins.pins_DigitalPin(DigitalPin.C17))
let current_speed = 0
basic.forever(function () {
    pins.rtc_read()
    pins.zeigeDoppelpunkt(true)
    pins.zeigeText(pins.rtc_get_string(pins.rtc_eFormat.hhmm))
    basic.pause(1000)
    minute_4096 = 2048 * (pins.rtc_get_int(pins.pins_rtc_eRegister(pins.rtc_eRegister.Stunde)) % 12 * 60 + pins.rtc_get_int(pins.pins_rtc_eRegister(pins.rtc_eRegister.Minute))) / 360
    pins.zeigeDoppelpunkt(false)
    pins.zeigeZahl(Math.round(minute_4096))
    basic.pause(1000)
    rotary_4096 = raw_angle()
    pins.zeigeZahl(Math.round(rotary_4096))
    differenz = pins.minx(minute_4096, rotary_4096)
    if (Math.abs(differenz) >= 5) {
        if (differenz < 0) {
            speed = -100
        } else {
            speed = 100
        }
    } else {
        speed = 0
    }
    if (current_speed != speed) {
        current_speed = speed
        motors.motorPower(speed)
    }
    if (speed == 0) {
        basic.pause(1000)
    } else {
        basic.pause(1000)
    }
})
