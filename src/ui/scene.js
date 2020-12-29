Kii.Scene = function (template) {
    template = template || {}
    template.name = template.name || 'Default Kii Scene'
    //Anything that needs to go on in the background
    //What feeds the UI everything
    this.BackEnd = template.BackEnd || {
      init: function (arg) {},
      term: function (arg) {},
      handleInput: function (arg) {},
      update: function (arg) {}
    }
    //How the information is viewed by the player
    this.UI = template.UI
    Kii.Entity.call(this, template)
    this.Flags = [false, false, false] //[Update, Render, Misc]
  
    this.Game = Game
  
    this.enter = function (display) {
      console.log('Entering the ' + this._name + '.')
      let p1 = performance.now()
      this.BackEnd.init(this)
      this.UI = new Kii.UI(this.UI)
      this.UI.init(this, display)
      let p2 = performance.now()
      console.log('Entered the ' + this._name + " after " + (p2 - p1) + "ms.")
    }
  
    this.handleInput = function (inputType, inputData, event) {    
      this.BackEnd.handleInput(this, inputType, inputData, event)
      this.UI.handleInput(this, inputType, inputData, event)
    }
  
    this.update = function (display, args) {
      //console.log("Updating the screen with flags " + this.Flags)
      if (this.Flags[0]) {
        this.BackEnd.update(this, args)
        this.UI.update(this, args)
      }
      if (this.Flags[1]) {
        this.UI.render(display)
      }
      //Reset the Flags
      for (const x in this.Flags) {this.Flags[x] = false}
    }
  
    this.exit = function (args) {
      console.log('Exiting the ' + this._name)
      let p1 = performance.now()
      this.BackEnd.term(args)
      let p2 = performance.now()
      console.log('Exited the ' + this._name + " after " + (p2 - p1) + "ms.")
    }
  }


Game.Scenes = {
    StartMenu: {
      name: "Default Start Menu",
      BackEnd: {
        init: function (arg) {
        },
        term: function (arg) {
          //nothing yet
        },
        handleInput: function (scene, inputType, inputData, event) {
          if (inputType === 'keyup') {
            let scenex = new Kii.Scene(Game.Scenes.Overworld)
            Game.switchScene(scenex)
          }
          if (inputType === 'mousemove') {
            Game.Mouse.track(event)          
          }
        },
        update: function (arg) {
          //nothing yet
        }
      },
      UI: {
        width: 40,
        height: 20,
        Zones: [{
          name: "Title Screen",
          x: 0,
          y: 0,
          Text: "Welcome to Kii " + Kii._version + "````Press [Any Key] to advance to an example Overworld Screen!",
          width: 40,
          height: 20,
          Traits: [Game.ZoneAbilities.TextBox]
        }]
      }
    },
    Overworld: {
      name: "Testing Area",
      BackEnd: {
        init: function (arg) {
          Game.Current.World = new Kii.World()
          Game.Current.World.generateBox({_x: 1, _y: 4}, {_x: 4, _y: 8}, { //A wall
            name: 'Wall',
            type: 'Tile',
            glyph: '#',
            occlude: true,
            fgColor: 'white',
            Traits: [Kii.Traits.Tangible]
          })
          Game.Current.World.init()        
        },
        term: function (arg) {
          //nothing yet
        },
        update: function (arg) {
          //nothing yet
        },
        handleInput: function (scene, inputType, inputData, event) {
          scene.Flags[1] = true
          switch(inputType) {
            case 'mousemove':
              Game.Mouse.track(event)
              break
            case 'mousedown':
              Game.Mouse.press(event)
              break
            case 'mouseup':
              Game.Mouse.release(event)
              scene.Flags[0] = true
              break
            case 'keydown':
              Game.Keyboard.press(inputData)
              break
            case 'keyup':
              Game.Keyboard.release(inputData)
              scene.Flags[0] = true
              //console.log(inputData.keyCode)
              if (inputData.keyCode == 37) {Game.Current.World.Player._x -= 1}
              if (inputData.keyCode == 65) {Game.Current.World.scroll('W')}
              if (inputData.keyCode == 39) {Game.Current.World.Player._x += 1}
              if (inputData.keyCode == 68) {Game.Current.World.scroll('E')}
              if (inputData.keyCode == 38) {Game.Current.World.Player._y -= 1}
              if (inputData.keyCode == 87) {Game.Current.World.scroll('N')}
              if (inputData.keyCode == 40) {Game.Current.World.Player._y += 1}
              if (inputData.keyCode == 83) {Game.Current.World.scroll('S')}
              break
          }
        }
      }
    }
  }