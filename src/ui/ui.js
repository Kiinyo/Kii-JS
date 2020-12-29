Kii.UI = function (template) {
    template = template || {}
    Kii.Entity.call()
    this._width = template.width || 40
    this._height = template.height || 20
    this._x = template.x || 0
    this._y = template.y || 0
    //Scenes need a final grid to output to the renderer
    this.Grid = template.Grid || null,
    //Scenes need to tell the renderer how to format the grid
    this.Format = template.Format || [20, 1, null, null] //[Font size, Spacing, Palette, Font]
    //All the different zones to be composited by the Scene
    this.Zones = template.Zones || [ 
        { //Example Textbox
            x: 20,
            y: 0,
            width: 10,
            Text: "You can scroll this text by pressing A to see what else is written over here!!",
            Traits: [Game.ZoneAbilities.TextBox]
        },
        { //Camera
            Traits: [Game.ZoneAbilities.SimpleCamera]
        }
    ]
    //Object the mouse is currently under
    this.Target = null
    
    //What to do upon being created
    this.init = function (scene, display) {
        let placeholder = template.Filler || {}
        //Generate grid and fill it with Filler
        this.Grid = Kii.Util.generateGrid(this._width, this._height, 
            function (placeholder) {
                let tile = new Kii.Entity(placeholder) 
                return tile})
        //Generate zones
        placeholder = []
        for (const z in this.Zones) {
            placeholder.push(new Kii.Zone(this.Zones[z]))
        }
        this.Zones = [...placeholder]
        //Initialize Palette
        this.Format[2] = new Kii.Palette(this.Format[2])
        //
        this.Target = scene.BackEnd.target
        //Draw zones to grid
        this.update(scene)
        //Draw the first frame
        this.render(display)
    }

    //Returns the 'pixel' the mouse is over
    this.updateMouse = function () {
        //Check if the mouse is inside the window
        let mx = Game.Mouse._x
        let my = Game.Mouse._y
        let w = this.Format[0] + this.Format[1]
        let check = Kii.Util.findInsideBox({_x: mx, _y: my},
                                           {_x: this._x, _y: this._y,
                                            _width: this.Grid[0].length * w,
                                            _height: this.Grid.length * w})
        if (check) {
            this.Target = this.Grid[Math.floor(my / w)][Math.floor(mx / w)]
        }
    }

    this.handleInput = function (scenes, inputType, inputData, event, scene) {
        inputData = inputData || null
        inputType = inputType || null
        event = event || null
        this.update(scenes, [inputType, inputData, event])
    }
    
    //Take all the zones, updates them, and redraws them to the Grid
    this.update = function (scene, input) {
        input = input || null
        let zones = this.Zones
        let zone = null
        this.updateMouse()
        if (input !== null) { if (input[0] === 'mousedown') {console.log(this.Target)}}
        for (const z in zones) {
            zone = zones[z]
            zone.update(scene, this, input)
            this.Grid = Kii.Util.overwriteGrid(zone._x, zone._y, this.Grid, zone.Grid)
        }
    }
    this.render = function (display) {
        //Clear the display
        Kii.Render.wipe(display)
        //Redraw to the display
        Kii.Render.ASCII(display, this)
    }
}

Kii.Palette = function(colors) {
    colors = colors || [['white',       '#fff4e0'], //Created by Nelson SMG for the
                        ['black',       '#2c1b2e'], //PixelJoint 17 Color Palette Competition (2019).
                        ['red',         '#94353d'],
                        ['blue',        '#457cd6'],
                        ['yellow',      '#f2b63d'],
                        ['purple',      '#4b3b9c'],
                        ['orange',      '#d46e33'],
                        ['green',       '#6d8c32'],
                        ['pink',        '#e34262'],
                        ['light teal',  '#8fcccb'],
                        ['teal',        '#449489'],
                        ['dark teal',   '#2c1b2e'],
                        ['dark purple', '#2c1b2e'],
                        ['crimson',     '#2c1b2e'],
                        ['light brown', '#2c1b2e'],
                        ['tan',         '#2c1b2e'],
                        ['light green', '#2c1b2e']]
  
    for (const color of colors) {
      this[color[0]] = color[1]
    }
  }
  
  Kii.Font = function (template) {
    template = template || {size: '20', name: 'Coolvetica'}
    return template.size + 'px ' + template.name
  }