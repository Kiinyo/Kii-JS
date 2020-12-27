
Kii.Zone = function (template) {
    template = template || {}
    this.Grid = template.Grid || []
    this.Actions = template.Actions || []
    this._width = template.width || 20
    this._height = template.height || 10
    Kii.Entity.call(this, template)
}

Kii.ZoneAbilities = {
    SimpleCamera: {
        _name: 'Simple Camera',
        generate: function (template) {
            template = template || {}
            this.nullTile = template.nullTile || {
                name: 'Out Of Bounds',
                type: 'Tile',
                glyph: 'X',
                fgColor: 'white',
                bgColor: 'blue',
                Traits: [Kii.Traits.Tangible]
              }
        },
        update: function (scene, ui, input) {
            let area = scene.Game.Current.World.ActiveArea.Tiles
            let cursor = scene.Game.Current.World.Player
            let cx = cursor._x
            let cy = cursor._y
            let r = cursor._radius

            let ox = cx - area[0][0]._x
            let oy = cy - area[0][0]._y

            grid = Kii.Util.trimGrid(area, {_x: ox, _y: oy}, r)

            //Populate the tiles
            let entities = scene.Game.Current.World.ActiveArea.Entities
            for (const e in entities) {
                let ent = entities[e]
                if (Kii.Util.findInsideBox({_x: ent._x, _y: ent._y}, 
                                           {_x: grid[0][0]._x, _y: grid[0][0]._y,
                                            _width: grid[grid.length - 1][grid[0].length - 1]._x - grid[0][0]._x, _height: grid[grid.length - 1][grid[0].length - 1]._y - grid[0][0]._y})) {
                                                grid[ent._y - grid[0][0]._y][ent._x - grid[0][0]._x] = ent
                                            }
            }

            //Add cursor
            grid[cy - grid[0][0]._y][cx - grid[0][0]._x] = cursor

            let nullTemplate = this.nullTile

            this.Grid = Kii.Util.generateGrid(this._width, this._height,
                function (x,y) {
                    nullTemplate.x = x
                    nullTemplate.y = y
                    return new Kii.Entity(nullTemplate)
                }
            )
            let a = Kii.Util.centerGrid(this.Grid,grid)
            this.Grid = Kii.Util.overwriteGrid(a[0], a[1], this.Grid, grid)
        }
    },
    TextBox: {
        _name: "Text Box",
        generate: function (template) {
            template = template || {}
            template.width = template.width || 10
            template.height = template.height || 10
            this._desc = "Something Generic"
            this.Text = template.Text || "A default string I'm using just to illustrate the ability"
            let placeholder = Kii.Util.createTextBox(template.width, template.height, this.Text, template)
            this.Grid = placeholder[0]
            this._leftoverText = placeholder[1]
        },
        update: function (scene, ui, input) {
            if (ui.Target) {
                let trigger = (ui.Target._desc === this._desc) || false
                if (trigger) {
                    if (this._leftoverText !== null) {
                        let ph = Kii.Util.createTextBox(this._width, this._height, this._leftoverText)
                        this.Grid = ph[0]
                        this._leftoverText = ph[1]
                    } else {
                        console.log('There is no more text to scroll!')
                    }
                }
            }
        }
    }
}