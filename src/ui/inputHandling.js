
Kii.Mouse = function () {//A way to track the mouse
    this._x = 0
    this._y = 0
    //Container for all mouse buttons currently pressed
    this.Pressed = {LMB: false,
                    MMB: false,
                    RMB: false}
    //Processing .addEventListener(event) info
    this.track = function (event) {//Updates the current mouse position
      this._x = event.offsetX
      this._y = event.offsetY
    }
    this.press = function (event) {//Checks which button is pressed and updates the object
      let button = event.button
      switch (button) {
        case 0:
          this.Pressed.LMB = true
        case 1:
          this.Pressed.MMB = true
        case 2:
          this.Pressed.RMB = true
      }
    }
    this.release = function (event) {//Checks which button is released and updates the object
      let button = event.button
      switch (button) {
        case 0:
          this.Pressed.LMB = false
        case 1:
          this.Pressed.MMB = false
        case 2:
          this.Pressed.RMB = false
      }
    }
    //Returning relevant info
    this.pressed = function (button) {//If no button is given, simply returns all pressed buttons
      if (button) {return this.Pressed[button]}
      let array = []
      //Ok I know this is CS Major tier stuff but it's 10pm
      //and I wanna finish refactoring my spaghetti code ;~;
      if (this.Pressed['LMB']) {array.push('LMB')}
      if (this.Pressed['MMB']) {array.push('MMB')}
      if (this.Pressed['RMB']) {array.push('RMB')}
      return array
    }
  
  }
  
  Kii.Keyboard = function (config) {//A way to track the keyboard
    config = config || []
    //Container for all keys currently pressed
    this.Pressed = []
    //Keycode association
    this.Codes = {}
    for (const kv of config) {
      this.Codes[kv[1]] = kv[0]
    }
    //Processing .addEventListener(event) info
    this.press = function (inputData) {//Updates keys pressed and returns the key name
    }
    this.release = function (inputData) {//Updates keys released and returns the key name
    }
    this.pressed = function (key) {
      if (key) {
        let found = false
        for (const keys of this.Pressed) {
          if (key === keys) {
            found = true
          }
        }
        return found
      }
      return this.Pressed
    }
  }
  
  Kii.Keyboards = {
    Default: [
      ['0','48'],
      ['1','49'],
      ['2','50'],
      ['3','51'],
      ['4','52'],
      ['5','52'],
      ['6','54'],
      ['7','55'],
      ['8','56'],
      ['9','57'],
      ['a','65'],
      ['b','66'],
      ['c','67'],
      ['d','68'],
      ['e','69'],
      ['f','70'],
      ['g','71'],
      ['h','72'],
      ['i','73'],
      ['j','74'],
      ['k','75'],
      ['l','76'],
      ['m','77'],
      ['n','78'],
      ['o','79'],
      ['p','80'],
      ['q','81'],
      ['r','82'],
      ['s','83'],
      ['t','84'],
      ['u','85'],
      ['v','86'],
      ['w','87'],
      ['x','88'],
      ['y','89'],
      ['z','90'],
      ['Num0','96'],
      ['Num1','97'],
      ['Num2','98'],
      ['Num3','99'],
      ['Num4','100'],
      ['Num5','101'],
      ['Num6','102'],
      ['Num7','103'],
      ['Num8','104'],
      ['Num9','105'],
      ['Esc','27'],
      ['Backspace','8'],
      ['Ctrl','17'],
      ['Alt','18'],
      ['Shift','16'],
      ['Enter','13'],
      ['Left','37'],
      ['Up','38'],
      ['Right','39'],
      ['Down','40']
    ]
  }