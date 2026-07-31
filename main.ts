function GitHub () {
    pins.comment(pins.pins_text("calliope-net/as5600_uhr"))
    pins.comment(pins.pins_text("3 Module: 4-Digit I2C: AS5600 Rotary, RTC, OLED"))
    pins.comment(pins.pins_text("optional: I2C Keypad zum Uhr stellen"))
    pins.comment(pins.pins_text("1 Erweiterung calliope-net/pins"))
    pins.comment(pins.pins_text("darin sind alle Module enthalten"))
}
input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    motor_on = !(motor_on)
    if (!(motor_on)) {
        motors.motorPower(0)
        basic.turnRgbLedOff()
    }
})
function uhr_stellen () {
    if (pins.keypadConnected()) {
        pins.oled_write_text(3, 0, 5, pins.rtc_set_key(pins.keypad_read()))
    }
}
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    pins.comment(pins.pins_text("Status Register anzeigen"))
    if (go) {
        go = false
        basic.pause(2000)
        pins.oled_write_text(4, 7, 15, pins.pins_text("AS5600"), pins.oled_align.right)
        bu = pins.pins_i2cWriteReadBuffer(pins.pins_i2cAdressen(pins.ei2cAdressen.AS5600), pins.buffer_fromArray([11]), 1)
        if (bu) {
            pins.oled_write_text(5, 7, 15, pins.pins_text("STA 0x" + pins.buffer_toHex(bu)))
        }
        bu = pins.pins_i2cWriteReadBuffer(pins.pins_i2cAdressen(pins.ei2cAdressen.AS5600), pins.buffer_fromArray([26]), 3)
        if (bu) {
            pins.oled_write_text(6, 7, 15, "AGC " + pins.buffer_getUint8(bu, 0))
            pins.oled_write_text(7, 7, 15, pins.pins_text("MAG " + pins.buffer_getNumber(bu, NumberFormat.UInt16BE, 1)))
        }
    } else {
        go = true
    }
})
function raw_angle () {
    pins.comment(pins.pins_text("Register 0x0C RAW ANGLE lesen: 0..4095"))
    bu = pins.pins_i2cWriteReadBuffer(pins.pins_i2cAdressen(pins.ei2cAdressen.AS5600), pins.buffer_fromArray([12]), 2)
    if (bu) {
        return pins.buffer_getNumber(bu, NumberFormat.UInt16BE, 0)
    } else {
        return 0
    }
}
function blinken () {
    blink = !(blink)
    if (blink) {
        if (motor_on) {
            basic.setLedColor(0x00ff00)
        } else {
            basic.setLedColor(0xff0000)
        }
    } else {
        basic.setLedColor(0x0000ff)
    }
}
let current_speed = 0
let speed = 0
let differenz = 0
let rotary_4096 = 0
let minute_4096 = 0
let blink = false
let bu: Buffer = null
let motor_on = false
let go = false
go = false
motor_on = false
if (!(pins.simulator())) {
    pins.addDisplay(pins.pins_DigitalPin(DigitalPin.C16), pins.pins_DigitalPin(DigitalPin.C17))
    pins.oled_reset(pins.oled_pages.y64)
    pins.oled_write_text(0, 0, 15, pins.pins_text("Magnetic Rotary"))
    pins.oled_write_text(1, 0, 15, pins.pins_text("Position Sensor"))
    pins.oled_write_text(4, 0, 5, pins.pins_text("minute"))
    pins.oled_write_text(5, 0, 5, pins.pins_text("rotary"))
    pins.oled_write_text(7, 0, 5, pins.pins_text("speed"))
    go = true
}
basic.forever(function () {
    if (go) {
        uhr_stellen()
        pins.rtc_read()
        pins.zeigeText(pins.rtc_get_string(pins.rtc_eFormat.hhmm))
        pins.oled_write_text(2, 2, 15, pins.pins_text(pins.rtc_get_string(pins.rtc_eFormat.yyMMddHHmmss)))
        minute_4096 = 2048 * (pins.rtc_get_int(pins.pins_rtc_eRegister(pins.rtc_eRegister.Stunde)) % 12 * 60 + pins.rtc_get_int(pins.pins_rtc_eRegister(pins.rtc_eRegister.Minute))) / 360
        pins.oled_write_text(4, 7, 15, pins.roundWithPrecision(minute_4096, 1))
        rotary_4096 = raw_angle()
        pins.oled_write_text(5, 7, 15, rotary_4096)
        differenz = pins.minx(minute_4096, rotary_4096)
        pins.oled_write_text(6, 7, 15, pins.roundWithPrecision(differenz, 1))
        if (Math.abs(differenz) >= 5) {
            if (differenz < 0) {
                speed = -100
            } else {
                speed = 100
            }
        } else {
            speed = 0
        }
        pins.oled_write_text(7, 7, 10, current_speed, pins.oled_align.right)
        pins.oled_write_text(7, 11, 15, speed, pins.oled_align.right)
        if (motor_on && current_speed != speed) {
            current_speed = speed
            motors.motorPower(speed)
        }
        blinken()
        if (speed == 0) {
            basic.pause(1000)
        } else {
            basic.pause(500)
        }
    }
})
