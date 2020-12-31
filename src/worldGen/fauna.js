Game.Fauna = function (template) {
    template = template || {}

    Kii.Entity.call(this, template)

    template.size = template.size || 200

    this._size = template.size || 200

    this.avg = template.avg || [0.6, 0.25, 1, 1] //kHyd, bmi, lifeForce, energy
    this._kHyd = template.size * this.avg[0] * 1000
    this._fat = template.size * this.avg[1] * 3000
    this._muscle = template.size * (1 - this.avg[1]) * 1000

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

    this._lifeForce = template.size / 10 * this.avg[2] //Restored through sleep
    this._energy = template.size * 100 * this.avg[3] //Restored through sleep
    this._standing = null //What it's currently standing on

    this.exercise = function (time, multiplier) {
        time = time || 1
        multiplier = multiplier || 1

        this._bCal += (this._size / 200) * multiplier * time
        this._kHyd -= (this._size / 40) * multiplier * time
    }

    this.wait = function (time, awake) {
        time = time || 1
        awake = awake || true
        //Water loss
        this._kHyd -= this._size / 400 * time
        //Calorie loss
        this._mCal += this._size / 200 * time
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
        if (awake) {this._energy -= (time * (this._size / 2400) * this.avg[3])}

    }
    
    this.move = function (world, direction, speed) {
        direction = Kii.Util.parseDir(direction)
        speed = speed || 1
        
        for (let s = 0; s < speed; s++) {
            if (world.checkCollision(this, direction)[0]) {
                world.leaveTile(this)
                this._x += direction[0]
                this._y += direction[1]
                this._standing = world.enterTile(this)
                this.exercise(1, speed)
            } else if (world.checkCollision(this, direction)[0] !== null) {
                //You've collided with something standing at the tile!
                //To-Do - Interactions with other Entities go here!
                break
            } else {
                //Your journey comes to an end
                break
            }  
        }
        this.wait(1)
    }

    this.sleep = function (time) {
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
}

Game.Faunas = {
    WildAnimal: {
      name: 'Wild Animal',
      desc: 'Try not to bother it!',
      type: 'Fauna',
  
      x: 2,
      y: 0,
  
      fgColor: 'yellow',
      glyph: 'W',
      Traits: [Kii.Traits.Tangible]
    }
}