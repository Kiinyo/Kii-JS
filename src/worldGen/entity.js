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
    Atom: {
      _name: 'Atom',
      generate: function (template) {
        this._size = template.size
        //How it can be separated from compounds
        this._catalyst = template.catalyst || 0 //Acid, Base, Enyzme
        //How to identify it in the game
        this._AtomID = template.AtomID || 100
      },
      fetchID: function () {
        let hash = "Atom:" + this._AtomID.toString()
        return hash
      }
    },
    Molecule: {
      _name: 'Molecule',
      generate: function (template) {

        this.Atoms = template.Atoms
        let Atoms = [...template.Atoms]

        //Where to look up the molecule on the compendium
        this._MolID = []
        for (const x in Atoms) {
          this._MolID.push(Atoms[x])
        }
        this._MolID.sort()
        this._MolID = this._MolID.join()

        this._target = null
        this._magnitude = null
        this._variation = null
      },
      assignEffect: function (template) {
        this._target = template.target || null
        this._magnitude = template.magnitude || null
        this._variant = template.variant || null
      },
      fetchID: function () {
        let hash = 'Molecule:' + this._MolID
        return hash
      },
      catalyze: function (catalyst) {
        let atoms = []
        let size = 0
        for (const a in this.Atoms) {
          let atom = this.Atoms[a]
          if (atom._catalyst = catalyst._variation) {
            atoms.push(atom)
            size += atom._size
          }
        }
        let ratio = size / catalyst.size
        for (const i in atoms) {
          atoms[i] *= ratio
        }
      }
    },
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

        this._size = template.size || 1
  
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
    Player: {
      _name: 'Player',

      generate: function (template) {

        this._radius = template.radius || 3 //Sight Radius

        this._size = template.size || 200
    
        this.avg = template.avg || [0.6, 0.25, 1, 1, 1] //kHyd, bmi, lifeForce, energy, stamina
        this._kHyd = this._size * this.avg[0] * 1000
        //In calories
        this._fat = this._size * this.avg[1] * 3000
        this._muscle = this._size * (1 - this.avg[1]) * 1000
    
        this._bmi = this.avg[1]
    
        //Organs
        this.Stomach = [0, 0]//[Calories, current size] Max (Size / 40) [MUL 100 TO ANY SIZE]
    
        this._bladder = 0 //Max (Size / 120)
        this._bowels = 0 //Max (Size / 7)
    
        //Trackers
        this._bCal = 0 //Calories burned through exercise
        this._mCal = 0 //Calories burned through BMR
        this._iCal = 0 //Caloried ingested
    
        this._setPoint = this._size //Where the body naturally wants to be
    
        this._lifeForce = this._size / 10 * this.avg[2] //Restored through sleep
        this._energy = this._size * 100 * this.avg[3] //Restored through sleep
        this._stamina = this._size / 2 *this.avg[4]
        this._standing = null //What it's currently standing on
      },
   
      exercise: function (time, multiplier) {
          time = time || 1
          multiplier = multiplier || 1

          let bCal = (this._size / 200) * multiplier * time
          this._bCal += bCal
          this._bladder += bCal / 4
          this._kHyd -= (this._size / 40) * multiplier * time
          this._stamina -= (this._size / 200) * multiplier * time
      },
  
      wait: function (time, awake) {
          time = time || 1
          awake = awake || true
          //Water loss
          let sHyd = this._size / 400 * time
          this._kHyd -= sHyd
          this._bladder += sHyd

          //Calorie loss
          let mCal = this._size / 200 * time
          this._mCal += mCal
          this._bladder += mCal / 4
          //Digest food
          if (this.Stomach[1] > 0) {
              if (this.Stomach[1] > (this._size / 800)) {
                  let ratio = (this._size / 800) / this.Stomach[1]
                  this._iCal += this.Stomach[0] * ratio
              } else {
                  this._iCal += this.Stomach[0]
                  this.Stomach[1] = 0
                  this.Stomach[0] = 0
              }
  
          }
          //Just making sure to not expend energy if asleep
          if (awake) {this._energy -= (time * (this._size / 2400) * this.avg[3])}
          //Restore stamina
          this._stamina = Math.min(this._stamina + (this._size / 200) * time, this._size / 2 * this.avg[4])
  
      },
      
      move: function (world, direction, speed) {
          direction = Kii.Util.parseDir(direction)
          speed = speed || 1
          
          for (let s = 0; s < speed; s++) {
            let tile = world.checkTile({_x: this._x + direction[0], 
                                        _y: this._y + direction[1]})
              if (tile !== null) {
                //console.log(tile)
                if (tile._passable) {
                    world.leaveTile(this)
                    this._x += direction[0]
                    this._y += direction[1]
                    this._standing = world.enterTile(this)
                    this.exercise(1, speed)
                } else {
                  //Run collision handling
                  break
                }
              } else {
                break
              }
          }
          this.wait(1)
      },
  
      sleep: function (time) {
          time = time || 1000 //Hour increments
  
          this.wait(time / 2, false)
  
          //Calories and Weight stuff! To-Do - Scaled based on time slept
  
          //Burn Fat/Muscle based on BMR
          this._muscle = Math.floor(this._muscle - (this._mCal / 2))
          this._fat = Math.floor(this._fat - (this._mCal / 2))
          //Establish how many calories were left over after BMR and Exercise
          this._iCal -= this._mCal + this._bCal
          //Calculate muscle gain (If there is a caloric deficit it all comes out of muscle, not fat)
          let muscleGained = Math.min(this._iCal, this._mCal, this._bCal)
          //Remove gains from iCal (Also resets iCal to 0 if calorie deficit)
          this._iCal -= muscleGained 
          this._muscle += muscleGained
          //Dump of the rest of the calories to fat
          this._fat += this._iCal
          //Reset values
          this._mCal, this._iCal, this._bCal = 0
          //Recalculate size
          this._size = Math.floor(this._muscle / 1000) + (this._fat / 3000)
          this._bmi = Math.round((this._fat / 3000) / this._size * 100) / 100
  
          //Restore HP and SP
          this._lifeForce = Math.min((this._lifeForce + ((this._size / 10) / (time / 40000))) / surp, this._size / 10 * this.avg[2])
          this._energy = Math.min((this._energy + (time * (this._size / 1200) * this.avg[3]) / surp), this._size * 100 * this.avg[3])
  
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
    }
  }