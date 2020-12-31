Kii.Entity = function (template) {
    template = template || {}
  
    //Name, description, and type, all pretty generic stuff!
    this._name = template.name || 'n/a'
    this._desc = template.desc || 'n/a'
    this._type = template.type || 'n/a'
    //Location of the object
    this._x = template.x || 0
    this._y = template.y || 0
  
    //Here comes the fun stuff! We'll keep track of what Traits the
    //entity has using this Traits object, it'll hold the names!
    this.Traits = {}
    let Traits = template.Traits || []
    //Now let's loop through our Traits and add any functionality needed!
    for (const trait of Traits) {
      //Let's add the name of the trait to our Traits container as well
      //as running the trait's 'boot-up' function!
      this.Traits[trait['_name']] = true
      if (trait.generate) {
        trait.generate.call(this, template)
      }
      //Finally add any actions the entity might be able to perform thanks
      //to the entity's trait!
      for (let key in trait) {
        //Assign the trait's name to the Trait container
        if (key !== 'generate' && key !== '_name' && !this.hasOwnProperty(key)) {
          this[key] = trait[key]
        }
      }
    }
  }
  
  Kii.Traits = { //All entity 'Traits' or mixins
    Tangible: { //Is something you can see
      _name: 'Tangible',
      //Generate is the generic function that Traits that want to
      //add properties to an object will have
      generate: function (template) {
        //Self explanitory, this is what the thing looks like!
        this._glyph = template.glyph || '?'
        this._fgColor = template.fgColor || 'yellow'
        this._occlude = template.occlude || false
        this._bgColor = template.bgColor || undefined
        this._stColor = template.stColor || undefined
  
        this._toolTip = template.toolTip || undefined
        //This is the only nonstandard part, it tracks its original
        //spawnpoint which may or may not come in handly later!
        this.Origin = template.Origin || [this._x, this._y] //[x, y]
      },
      //A simple function to allow the Entity to be able to move in
      //basic directions assuming positive is right and down
      translate: function (direction, distance) {
        distance = distance || 1
        switch (direction) {
          case 'left':
            this._x -= distance
            break
          case 'right':
            this._x += distance
            break
          case 'up':
            this._y -= distance
            break
          case 'down':
            this._y += distance
            break
        }
      }
    },
    Tile: {
      _name: 'Tile',
      generate: function (template) {
        this._passable = template.passable || true
        this._occupant = template.occupant || null
        this._contents = template.contents || []
      },
      //To-Do - Leaving tracks
      enter: function (entity) {
        this._occupant = entity
        this._passable = false
        return this
      },
      exit: function (entity) {
        this._occupant = null
        this._passable = true
      },
      give: function (index) {
        let item = this._contents.splice(index, 1)
        return item[0]
      },
      recieve: function (item) {
        this._contents.push(item)
      }
    },
    Container: {//Any object that has a list of parts
      _name: 'Container',
      generate: function (template) {
        this.Parts = template.Parts || []
      },
      addPart: function (part) {
        this.Parts.push(part)
      },
      removePart: function (partIndex) {
        this.Parts.splice(partIndex, 1)
      }
    },
    Player: {//The player character
      _name: 'Player',
      generate: function (template) {
        template = template || {}
        this._radius = template.radius || 3 //Sight Radius
        // I'm sure I should do something here....
      }
    }
  }