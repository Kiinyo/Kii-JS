var Game = {
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
      display.width = Game.Scene._width
      display.height = Game.Scene._height
  
  
      var bindKeyInputToScene = function (keyInput) {
        window.addEventListener(keyInput, function(e) {
          if (Game.Current.Scene !== null) {
            Game.Current.Scene.handleInput(keyInput, e)
          }
        })
      }
      bindKeyInputToScene('keydown')
      bindKeyInputToScene('keyup')
      bindKeyInputToScene('keypress')
  
      var bindMouseInputToScene = function (mouseInput) {
        display.addEventListener(mouseInput, function(e) {
          e.preventDefault()
          if (Game.Current.Scene !== null) {
            Game.Current.Scene.handleInput(mouseInput, null, e)
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
              Game.refresh();
          }, 1000 / this._fps);
      },
  
    switchScene: function(Scene) {
        if(this.Current.Scene !== null) {
            this.Current.Scene.exit()
        }
      let ctx = this.Display.getContext('2d')
        ctx.clearRect(0,0,Game.Scene._width,Game.Scene._height)
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
    Game.initialize()
    document.body.appendChild(Game.Display)
    let scene = new Kii.Scene(Game.Scenes.StartMenu)
    Game.switchScene(scene)
    Game.run()
  }