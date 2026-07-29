let minute_4096 = 0
pins.addDisplay(pins.pins_DigitalPin(DigitalPin.C16), pins.pins_DigitalPin(DigitalPin.C17))
pins.zeigeDoppelpunkt(true)
basic.forever(function () {
    pins.rtc_read()
    pins.zeigeText(pins.rtc_get_string(pins.rtc_eFormat.hhmm))
    basic.pause(1000)
    minute_4096 = 2048 * (pins.rtc_get_int(pins.pins_rtc_eRegister(pins.rtc_eRegister.Stunde)) % 12 * 60 + pins.rtc_get_int(pins.pins_rtc_eRegister(pins.rtc_eRegister.Minute))) / 360
    pins.zeigeZahl(Math.round(minute_4096))
    basic.pause(1000)
})
