Kii.World = function (template) {
    template = template || {}
    Kii.Entity.call(this, template)
    //Every world needs a seed
    this._seed = template.seed || 0421
    //Dimensions, unless infinite, then use -1
    this._height = template.height || 3
    this._width = template.width || 5
    //Region size, Chunk size, and Render distance (of chunks)
    this._rs = template.rs || 2
    this._cs = template.cs || 10
    this._rd = template.rd || 3
    //World Generation
    this.generateRegion = function (coords) {
      return new Kii.Region(this, coords)
    }
    this.generateChunk = function (region, coords) {
      return new Kii.Chunk(region, coords)
    }
    this.generateTile = function (chunk, x, y) {
      return new Kii.Tile(chunk, x, y)
    }
    //Utility
    this.hashChunk = function (coords) { //Create a unique string for each chunk
      let hash = 'rX' + coords.Region._x.toString() +
                 'rY' + coords.Region._y.toString() +
                 'cX' + coords.Chunk._x.toString() +
                 'cY' + coords.Chunk._y.toString()
  
      return hash
    }
    //Track changes to the world
    this.Changes = new Map()
    this.addChange = function (change) {//Identify the change occurring
      //console.log('Change: ' + JSON.stringify(change))
      switch (change._type) {
        case 'Tile':  //t for tile
          change._id = 't#x' + change._x.toString() + 'y' + change._y.toString()
          break
        case 'Fauna': //a for animal
          change._id = 'a#x' + change._x.toString() + 'y' + change._y.toString()
          break
        case 'Flora': //p for plant
          change._id = 'p#x' + change._x.toString() + 'y' + change._y.toString()
          break
      }
      //Find the chunk the change takes place on
      let coords = this.lookUp(change._x, change._y)
      let chunkID = this.hashChunk(coords)
      change._chunkID = chunkID
      let chunkChanges = this.Changes.get(chunkID)
      chunkChanges = chunkChanges || []
      //Update chunkChanges, and add the new change
      chunkChanges.push(change._id)
      this.Changes.set(change._id, change)
      this.Changes.set(chunkID, chunkChanges)
    }
    this.removeChange = function (change) {
      let chunkChanges = this.Changes.get(change._chunkID)
      let c = chunkChanges.indexOf(change._id)
      //Remove change from chunk and changes
      chunkChanges.splice(c, 1)
      this.Changes.set(change._chunkID, chunkChanges)
      this.Changes.delete(change._id)
    }
    //Multichunk structure building
    this.generateLine = function (origin, end, template) {//Draw a line on the map
      let line = Kii.Util.gridLine(origin, end)
      let coords, tile = undefined
      for (const box of line) {
        coords = box[0]
        tile = new Kii.Entity(template)
        tile._x = coords[0]
        tile.Origin._x = coords[0]
        tile._y = coords[1]
        tile.Origin._y = coords[1]
        this.addChange(tile)
      }
    }
    this.generateBox = function (origin, end, template) {//Draw a box on the map
      //p1,p2
      //p3,p4
      let p1 = {_x: origin._x, _y: origin._y}
      let p2 = {_x: end._x, _y: origin._y}
      let p3 = {_x: origin._x, _y: end._y}
      let p4 = {_x: end._x, _y: end._y}
      this.generateLine(p1, p2, template)
      this.generateLine(p2, p4, template)
      this.generateLine(p4, p3, template)
      this.generateLine(p3, p1, template)
    }
    //Navigating the world
    this.lookUp = function (x, y) { //This function returns the region, chunk, and tile of a given coordinate
      let rs = this._rs
      let cs = this._cs
      //Setting up the currentRegionX/Y and currentChunkX/Y
      let crX, crY, ccX, ccY = null
      let inBounds = true
  
      if (x < 0) {
        crX = Math.floor(x / (cs * rs))
        ccX = rs + Math.floor((x - ((1 + crX) * cs * rs))/cs)
        inBounds = false
      } else {
        crX = Math.floor(x / (cs * rs))
        ccX = Math.floor((x - (crX * cs * rs))/cs)
      }
  
      if (y < 0) {
        crY = Math.floor(y / (cs * rs))
        ccY = rs + Math.floor((y - ((1 + crY) * cs * rs))/cs)
        inBounds = false
      } else {
        crY = Math.floor(y / (cs * rs))
        ccY = Math.floor((y - (crY * cs * rs))/cs)
      }
  
      if (x >= this._height * cs * rs || y >= this._width * cs * rs) {
        inBounds = false
      }
  
      let ctX = x - (crX * cs * rs ) - (ccX * cs)
      let ctY = y - (crY * cs * rs ) - (ccY * cs)
  
      return   {Region: {_x: crX, _y: crY},
                Chunk:  {_x: ccX, _y: ccY},
                Tile:   {_x: ctX, _y: ctY},
                Global: {_x: x,   _y:   y},
                _inBounds: inBounds}
    }
    this.getGlobalPosition = function (coords) {//Get the global position of certain coords
      //See Kii.World.lookUp return object for formatting
      let x = coords.Region._x * this._rs * this._cs +
              coords.Chunk._x * this._cs +
              coords.Tile._x
      let y = coords.Region._y * this._rs * this._cs +
              coords.Chunk._y * this._cs +
              coords.Tile._y
  
      return {_x: x, _y: y}
    }
    this.getOrigin = function (coords, type) {//Returns the coords of the top left tile in 'type'
      //See Kii.World.lookUp return object for formatting
      type = type || 'Chunk'
      let x, y = undefined
      switch (type) {
        case 'Region':
          x = coords.Region._x * this._rs * this._cs
          y = coords.Region._y * this._rs * this._cs
          break
        case 'Chunk':
          x = coords.Region._x * this._rs * this._cs +
                  coords.Chunk._x * this._cs
          y = coords.Region._y * this._rs * this._cs +
                  coords.Chunk._y  * this._cs
      }
      let newCoords = this.lookUp(x, y)
      return newCoords
    }
    this.movePointer = function (coords, direction, distance) {//Crawl through chunks
      //console.log('The coords being passed to movePointer' + JSON.stringify(coords))
      //console.log('The direction of the pointerMove: ' + direction)
      distance = distance || 1
      switch (direction) {
        case 'N':
          coords.Global._y -= this._cs * distance
          break
        case 'S':
          coords.Global._y += this._cs * distance
          break
        case 'E':
          coords.Global._x += this._cs * distance
          break
        case 'W':
          coords.Global._x -= this._cs * distance
          break
        case 'NW':
          coords.Global._y -= this._cs * distance
          coords.Global._x -= this._cs * distance
          break
        case 'NE':
          coords.Global._y -= this._cs * distance
          coords.Global._x += this._cs * distance
          break
        case 'SE':
          coords.Global._x += this._cs * distance
          coords.Global._y += this._cs * distance
          break
        case 'SW':
          coords.Global._x -= this._cs * distance
          coords.Global._y += this._cs * distance
          break
      }
      let newCoords = this.lookUp(coords.Global._x, coords.Global._y)
      //console.log('The coords being processed by movePointer' + JSON.stringify(newCoords))
      return newCoords
    }
    //Generating the world
    this.loadChunk = function (coords) {//returns a grid of all tiles in the chunk of the specified coords
      //Setup some variables that'll be useful later
      let hash = this.hashChunk(coords)
  
      let rs = this._rs
      let cs = this._cs
      //Create the current chunk and region
      let cReg = this.generateRegion(coords)
      let cChu = this.generateChunk(cReg, coords)
  
      //Create the placeholders for the tiles as well as find the coordinate
      //of the chunk's 0,0 tile so that we can assign and x and y to tiles
      let tile = null
      let origin = this.getOrigin(coords, 'Chunk')
      //Use the Kii.Util.generateGrid function to compactly generate all the tiles!
      let worldThis = this
      let tiles = Kii.Util.generateGrid(cs, cs, function(x, y){
        tile = worldThis.generateTile(cChu, origin.Tile._x + x, origin.Tile._y + y)
        tile._x = origin.Global._x + x
        tile._y = origin.Global._y + y
        return tile
      })
      //Add the entities from the chunk
      let entities = []
      for (const entity of cChu.Entities) {
        let ent = null
        switch (entity.type) {
          default:
            ent = new Kii.Entity(entity)
        }
  
        ent._x += origin.Global._x
        ent._y += origin.Global._y
        let coords = Kii.Util.fPIA(ent, tiles)
        tiles[coords[1]][coords[0]].enter(ent)
        //console.log(entity.x + "," + entity.y)
        entities.push(ent)
      }
      //Now it's time to edit the chunk based on the world's Changes
      changes = this.Changes.get(hash)
      if (changes !== undefined) {
        let change = undefined
        //console.log('Changes for the chunk:' + JSON.stringify(changes))
        for (const changeID of changes) {
          //console.log('The ChangeID: ' + JSON.stringify(changeID))
          change = this.Changes.get(changeID)
          switch (changeID.charAt(0)) {
            case 't': //It's a tile
              tiles[change._y - origin.Global._y][change._x - origin.Global._x] = change
              break
            case 'a': //It's Fauna
              for (let entity of entities) {
                if (JSON.stringify(entity.Origin) === JSON.stringify(change.Origin) &&
                    entity._type === change._type) {
                  entity = changes
                }
              }
            case 'p': //It's Flora
              for (let entity of entities) {
                if (JSON.stringify(entity.Origin) === JSON.stringify(change.Origin) &&
                    entity._type === change._type) {
                  entity = changes
                }
              }
            default:
              console.log("Couldn't identify change of " + changeID)
          }
        }
      }
      //console.log(JSON.stringify(tiles))
      return {Tiles: tiles, Entities: entities}
    }
    this.generateArea = function (coords, distance) {//Returns a multi chunk square centered around coord's chunk
      distance = distance || this._rd
      let size = distance * 2 + 1
      let origin = this.movePointer(this.getOrigin(coords), 'NW', distance)
  
      let tiles = []
      let entities = []
      let row = []
      let chunk = undefined
  
      for (let cy = 0; cy < size; cy++) {
        row = []
        for (let cx = 0; cx < size; cx++) {
          chunk = this.loadChunk(this.lookUp(origin.Global._x + (cx * this._cs), origin.Global._y + (cy * this._cs)))
          row.push(chunk.Tiles)
          entities = entities.concat(chunk.Entities)
        }
        tiles.push(row)
      }
  
      tiles = Kii.Util.untangleGrid(tiles)
      return {Tiles: tiles, Entities: entities, Origin: origin}
    }
    this.bufferChunks = function (coords, direction, dis) {//Loads a line of chunks on the border of an area
      let rd = dis || this._rd
      let cs = this._cs
  
      let pointer = this.getOrigin(coords)
  
      let size = rd * 2 + 1
      let row = []
      let grid = []
      let entities = []
      let chunk = undefined
  
      switch(direction) {
        case 'N':
          pointer = this.movePointer(pointer, 'N')
          for (let i = 0; i < size; i++) {
            chunk = this.loadChunk(this.lookUp(pointer.Global._x + cs * i, pointer.Global._y))
            row.push(chunk.Tiles)
            entities = entities.concat(chunk.Entities)
          }
          grid.push(row)
          grid = Kii.Util.untangleGrid(grid)
          return {Tiles: grid, Entities: entities}
        case 'S':
          pointer = this.movePointer(pointer, 'S', size)
          for (let i = 0; i < size; i++) {
            chunk = this.loadChunk(this.lookUp(pointer.Global._x + cs * i, pointer.Global._y))
            row.push(chunk.Tiles)
            entities = entities.concat(chunk.Entities)
          }
          grid.push(row)
          grid = Kii.Util.untangleGrid(grid)
          return {Tiles: grid, Entities: entities}
        case 'E':
          pointer = this.movePointer(pointer, 'E', size)
          for (let i = 0; i < size; i++) {
            row = []
            chunk = this.loadChunk(this.lookUp(pointer.Global._x, pointer.Global._y + cs * i))
            row.push(chunk.Tiles)
            grid.push(row)
            entities = entities.concat(chunk.Entities)
          }
          grid = Kii.Util.untangleGrid(grid)
          return {Tiles: grid, Entities: entities}
        case 'W':
          pointer = this.movePointer(pointer, 'W')
          for (let i = 0; i < size; i++) {
            row = []
            chunk = this.loadChunk(this.lookUp(pointer.Global._x, pointer.Global._y + cs * i))
            row.push(chunk.Tiles)
            grid.push(row)
            entities = entities.concat(chunk.Entities)
          }
          grid = Kii.Util.untangleGrid(grid)
          return {Tiles: grid, Entities: entities}
      }
    }
    //Deloading the world
    this.offload = function (tiles, entities) {//Safely removes tiles and entities while storing any changes
      //To-Do
    }
    //Currently loaded area
    this.ActiveArea = undefined
    //Handling Entity movement throughout Area
    this.isInsideArea = function (coords) {
      return (this.ActiveArea.Tiles.length > coords[1] && 
              this.ActiveArea.Tiles[0].length > coords[0] &&
              coords[0] >= 0 && coords[1] >= 1)
    }
    this.checkCollision = function (something, direction) {
      let coords = Kii.Util.fPIA(something, this.ActiveArea.Tiles)
      coords[0] += direction[0]
      coords[1] += direction[1]
      if (this.isInsideArea(coords)) {
            return [this.ActiveArea.Tiles[coords[1]][coords[0]]._passable, this.ActiveArea.Tiles[coords[1]][coords[0]]._occupant]
      } else {
        return false
      }
    },
    this.leaveTile = function (entity) {
      let coords = Kii.Util.fPIA(entity, this.ActiveArea.Tiles)
      this.ActiveArea.Tiles[coords[1]][coords[0]].exit(entity)
    },
    this.enterTile = function (entity) {
      let coords = Kii.Util.fPIA(entity, this.ActiveArea.Tiles)
      return this.ActiveArea.Tiles[coords[1]][coords[0]].enter(entity)
    },
    this.scroll = function (direction) {//Move the current loaded area in a direction and handle deloading
      let qx1 = performance.now()
      let newChunks = this.bufferChunks(this.ActiveArea.Origin, direction)
      let width = newChunks.Tiles[0].length
      let height = newChunks.Tiles.length
      //Get containers ready
      let removedRows = []
      let removedTiles = []
      let removedEntities = []
      //Remove and Add tiles
      switch (direction) {
        case 'N':
          this.ActiveArea.Tiles.reverse()
          newChunks.Tiles.reverse()
          this.ActiveArea.Tiles.splice(0,height)
          this.ActiveArea.Tiles = this.ActiveArea.Tiles.concat(newChunks.Tiles)
          this.ActiveArea.Tiles.reverse()
          newChunks.Tiles.reverse()
          break
        case 'S':
          this.ActiveArea.Tiles.splice(0, height)
          this.ActiveArea.Tiles = this.ActiveArea.Tiles.concat(newChunks.Tiles)
          break
        case 'E':
          for (let y = 0; y < newChunks.Tiles.length; y++) {
            this.ActiveArea.Tiles[y].splice(0, width)
            this.ActiveArea.Tiles[y] = this.ActiveArea.Tiles[y].concat(newChunks.Tiles[y])
          }
          break
        case 'W':
          for (let y = 0; y < newChunks.Tiles.length; y++) {
            this.ActiveArea.Tiles[y].reverse()
            newChunks.Tiles[y].reverse()
            this.ActiveArea.Tiles[y].splice(0, width)
            this.ActiveArea.Tiles[y] = this.ActiveArea.Tiles[y].concat(newChunks.Tiles[y])
            this.ActiveArea.Tiles[y].reverse()
            newChunks.Tiles[y].reverse()
          }
          break
      }
      for (const tiles in removedRows) {
        removedTiles = removedTiles.concat(tiles)
      }
      //Remove and Add entities
      this.ActiveArea.Entities = this.ActiveArea.Entities.concat(newChunks.Entities)
      //console.log(this.ActiveArea.Entities.length)
      let entity = undefined
      let max = this.ActiveArea.Tiles.length - 1
      let box = {_x: this.ActiveArea.Tiles[0][0]._x, _y: this.ActiveArea.Tiles[0][0]._y,
                _width:  this.ActiveArea.Tiles[max][max]._x - this.ActiveArea.Tiles[0][0]._x,
                _height: this.ActiveArea.Tiles[max][max]._y - this.ActiveArea.Tiles[0][0]._y}
      for (let i = 0; i < this.ActiveArea.Entities.length;) {
        entity = this.ActiveArea.Entities[i]
        if (Kii.Util.findInsideBox(entity, box)) {
          //console.log('Entity is inside of the area and is safe!')
          i++
        } else {
          //console.log('Entity is outside of the area and is removed!')
          removedEntities.push(this.ActiveArea.Entities.splice(i, 1))
        }
        //console.log("i is " + i)
      }
      
      
      this.ActiveArea.Origin = this.movePointer(this.ActiveArea.Origin, direction)
      //Update origin coords and offload tiles
      this.offload(removedTiles, removedEntities)
      let qx2 = performance.now()
      console.log("Chunk loading took: " + (qx2 - qx1) + " ms!")
    },
    this.update = function (args) {//Use this to update the world and all the stuff on a larger timeframe
    }
    //Finally let's make a player and create the world!
    this.Player = template.Player || {
      name: 'Iticus Youicus',
      desc: 'Baba is you',
      type: 'Player',
  
      x: 0,
      y: 0,
  
      fgColor: 'teal',
      glyph: '@',
      Traits: [Kii.Traits.Tangible, Kii.Traits.Player]
    }
    this.init = function (args) {
      this.ActiveArea = this.generateArea(this.lookUp(this.Player.x, this.Player.y))
      for (const e in this.ActiveArea.Entities) {
        let ent = this.ActiveArea.Entities[e]
        ent._standing = this.enterTile(ent)
      }
      this.Player = new Kii.Entity(this.Player)
      this.Player._standing = this.enterTile(this.Player)
    }
  }

Kii.Area = function (template) {
    template = template || {}
  
    this.Origin = template.Origin || undefined
    this.Tiles = template.Tiles || undefined
    this.Entities = template.Entities || undefined
}