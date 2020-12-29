var Bootstrap = {
    _version: 'indev_0.001',
    Display: null,
    Scene: {_width: 800,
             _height: 600},
  
    _fps: 10,
    _interval: 0,
  
    _frameTimer: 0,
  
    Palette: null,
  
    Current: {Scene: null,
              World: null},
  
    Mouse: null,
    Keyboard: null,
  
    initialize: function () {
      this.Mouse = new Kii.Mouse()
      this.Keyboard = new Kii.Keyboard(Kii.Keyboards.Default)
  
      let display = document.createElement("CANVAS")
      display.width = Bootstrap.Scene._width
      display.height = Bootstrap.Scene._height
  
  
      var bindKeyInputToScene = function (keyInput) {
        window.addEventListener(keyInput, function(e) {
          if (Bootstrap.Current.Scene !== null) {
            Bootstrap.Current.Scene.handleInput(keyInput, e)
          }
        })
      }
      bindKeyInputToScene('keydown')
      bindKeyInputToScene('keyup')
      bindKeyInputToScene('keypress')
  
      var bindMouseInputToScene = function (mouseInput) {
        display.addEventListener(mouseInput, function(e) {
          e.preventDefault()
          if (Bootstrap.Current.Scene !== null) {
            Bootstrap.Current.Scene.handleInput(mouseInput, null, e)
          }
        })
      }
  
      bindMouseInputToScene('mousedown')
      bindMouseInputToScene('mouseup')
      bindMouseInputToScene('mousemove')
      bindMouseInputToScene('contextmenu')
  
      this.Display = display
    },
  
    refresh: function () {
      let Scene = this.Current.Scene
        Scene.update(this.Display)
    },
  
      run: function() {
          this._interval = setInterval(function(){
              Bootstrap.refresh();
          }, 1000 / this._fps);
      },
  
    switchScene: function(Scene) {
        if(this.Current.Scene !== null) {
            this.Current.Scene.exit()
        }
      let ctx = this.Display.getContext('2d')
        ctx.clearRect(0,0,Bootstrap.Scene._width,Bootstrap.Scene._height)
        this.Current.Scene = Scene
        if (this.Current.Scene !== null) {
            this.Current.Scene.enter(this.Display)
        }
    }
  }
  
  var Kii = {
    //Formatting is usually Object, _property, method()
    _version: 'Alpha 1.0',
    _author: 'Kathrine Lemet'
  }
  
  window.onload = function() {
    Bootstrap.initialize()
    document.body.appendChild(Bootstrap.Display)
    let scene = new Kii.Scene(Bootstrap.Scenes.StartMenu)
    Bootstrap.switchScene(scene)
    Bootstrap.run()
  }