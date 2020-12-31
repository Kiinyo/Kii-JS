Kii.Util = {
    //JS extentions? Just something I couldn't find by Googling
    fpia: function (array, property, value, index) {//Searches array for object with trait and returns value associated with that trait
      for (const element of array) {
        if (element[property] === value) {
          return element[value]
        }
      }
    },
    //Simple collision detection
    findInsideCircle: function (origin, point, radius) { //Determines if a point lays inside a circle
      let oX = origin._x
      let oY = origin._y
      let pX = point._x
      let pY = point._y
      let r = radius
      return (Math.pow(pX - oX, 2) + Math.pow(pY - oY, 2) <= Math.pow(r,2))
    },
    findInsideBox: function (point, box) { //Determines if a point is inside a box
      let pX = point._x
      let pY = point._y
  
      let xMin = box._x
      let yMin = box._y
      let xMax = box._x + box._width
      let yMax = box._y + box._height
  
      //console.log('Position X: [' + xMin + ' ' + pX + ' ' + xMax + ']')
      //console.log('Position Y: [' + yMin + ' ' + pY + ' ' + yMax + ']')
  
      return (pX >= xMin && pX <= xMax && pY >= yMin && pY <= yMax)
    },
    //Grid manipulations
    centerGrid: function (grid, grid2) {//Centers the second grid relative to the first
        let x, y = 0
        y = Math.floor(grid.length / 2) - Math.floor(grid2.length / 2) 
        x = Math.floor(grid[0].length / 2) - Math.floor(grid2[0].length / 2) 
        return [x,y]
    },
    generateGrid: function(width, height, action) {//Let's me create a grid and use an action to fill it
      let point = null
      let grid = []
      let row = []
      for (let y = 0; y < height; y++) {
        row = []
        for (let x = 0; x < width; x++) {
          point = action(x, y)
          row.push(point)
        }
        grid.push(row)
      }
      return grid
    },
    untangleGrid: function (grid) {//Parses grid of grids into 1 big grid
      let newGrid = []
      let row = []
      //I'm annotating this section days after I figured
      //out the math for it and I really don't want to have
      //to relearn it to explain it, just trust that it
      //works for now pls, I'm sorry... ;~;
      for (let a = 0; a < grid.length; a++) {
        for (let c = 0; c < grid[0][0].length; c++) {
          for (let b = 0; b < grid[0].length; b++) {
            if (b == 0) {
              row = grid[a][b][c]
            } else {
              row = row.concat(grid[a][b][c])
            }
          }
          newGrid.push(row)
        }
      }
      return newGrid
    },
    overwriteGrid: function (x, y, grid, grid2) {//Writes grid2 onto grid 1 at x, y
      for (let h = 0; h < grid2.length; h++) {
          if (y + h > -1 && y + h < grid.length) {
              for (let w = 0; w < grid2[h].length; w++) {
                  if (x + w > -1 && x + w < grid[(y + h)].length) {
                      grid[(y + h)][(x + w)] = grid2[h][w]
                  }
              }
          }
      }
      return grid
    },
    copyGrid: function (grid) {
        let newGrid = Kii.Util.generateGrid(grid[0].length, grid.length, function (x, y) {
            let newTile = Object.assign({}, grid[y][x])
            return newTile
        })

        return newGrid
    },
    trimGrid: function (grid, source, radius) {
          let sX = source._x
          let sY = source._y
          //Let's trim the grid around the source while
          //also making sure that we respect the bounds of the grid
          let newGrid = Kii.Util.copyGrid(grid)
          let rY = radius._y || radius
          let rX = radius._x || radius
  
          //trim top
          if (sY - rY > 0) {
              newGrid.splice(0,(sY-rY))
          }
          //trim bottom
          if (rY * 2 + 1 < newGrid.length) {
              newGrid.reverse()
              newGrid.splice(0, (newGrid.length - (rY * 2 + 1)))
              newGrid.reverse()
          }
          //trim left
          if (sX - rX > 0) {
              for (let i = 0; i < newGrid.length; i++) {
                  newGrid[i].splice(0, (sX - rX))
              }
          }
          //trim right
          if (rX * 2 + 1 < newGrid[0].length) {
              for (let i = 0; i < newGrid.length; i++) {
                  newGrid[i].reverse()
                  newGrid[i].splice(0, newGrid[i].length - (rX * 2 + 1))
                  newGrid[i].reverse()
              }
          }
          return newGrid
    },
    gridLine: function(origin, end) { //Draws line on grid and then returns all boxes it intersected
          //First thing's first, lets make things easier and shorter
      //in the long run!
          let oX = origin._x
          let oY = origin._y
          let eX = end._x
          let eY = end._y
          //Now we'll just go ahead and do some simple y=mx+b Algebra!
          let m = (eY - oY) / (eX - oX) //slope of line
          let b = oY - (m * oX) //y-intercept of line
          //The dimensions of the line
          let lengthX = Math.floor(oX) - Math.floor(eX)
          let lengthY = Math.floor(oY) - Math.floor(eY)
          //Which edges in the grid are intercepted
          let xInts = []
          let yInts = []
          //Setting up the hard working interval
          let i = Math.abs(lengthX)
          //Determining the sign so we can increment the loops properly
          let s = Math.sign(lengthX)
          let r = (0.5*s) + 0.5
  
          //Generating
          if (lengthX != 0) {
              while (i > 0) {
                  xInts.push(Math.floor(oX) - lengthX + r )
                  lengthX -= s
                  i--
              }
          }
  
          i = Math.abs(lengthY)
          s = Math.sign(lengthY)
          r = (0.5*s) + 0.5
  
          if (lengthY != 0) {
  
              while (i > 0) {
                  yInts.push(Math.floor(oY) - lengthY + r)
                  lengthY -= s
                  i--
              }
          }
  
          //Collect all the grid edge intersections
          let xIntercepts = []
          let yIntercepts = []
  
          if (oX == eX) {
        //Vertical Line
        let oXG = Math.floor(oX)
        let oYG = Math.floor(oY)
        let eXG = Math.floor(eX)
        let eYG = Math.floor(eY)
  
        let y = eY - oY
        let s = Math.sign(y)
  
        let newFace = [[[oXG, oYG]], [[eXG, oYG]]]
        while (Math.abs(y) > 1) {
          newFace.push([[oXG, oYG + y - s]])
          y -= s
        }
        return newFace
          } else if (oY == eY) {
        //Horizontal Line
        let oXG = Math.floor(oX)
        let oYG = Math.floor(oY)
        let eXG = Math.floor(eX)
        let eYG = Math.floor(eY)
  
        let x = eX - oX
        let s = Math.sign(x)
  
        let newFace = [[[oXG, oYG]], [[eXG, oYG]]]
        while (Math.abs(x) > 1) {
          newFace.push([[oXG + x - s, oYG]])
          x -= s
        }
        return newFace
          } else {
  
              let currentX = 0
              let currentY = 0
  
              i = 0
  
              for (i = 0; i < xInts.length; i++) {
                  currentX = xInts[i]
  
                  currentY = m*currentX + b
                  xIntercepts.push([currentX, currentY])
              }
  
              for (i = 0; i < yInts.length; i++) {
                  currentY = yInts[i]
  
                  currentX = (currentY - b) / m
                  yIntercepts.push([currentX, currentY])
  
              }
          }
  
          i = 0
  
          let faces = []
          let intercept = [0,0]
  
          for (i = 0; i < xIntercepts.length; i++) {
              intercept = xIntercepts[i]
  
              //Get the face to the left of the intersection
              faces.push( [
                  //face
                  [intercept[0] - 1, Math.floor(intercept[1])],
                  //point on the face's edge
                  [1, (intercept[1] - Math.floor(intercept[1]))]
              ] )
  
              //Get the face to the right of the intersection
              faces.push( [
                  //face
                  [intercept[0], Math.floor(intercept[1])],
                  //point on the face's edge
                  [0, (intercept[1] - Math.floor(intercept[1])) ]
  
              ] )
          }
  
          for (i = 0; i < yIntercepts.length; i++) {
              intercept = yIntercepts[i]
  
              //Get the face below the intersection
              faces.push( [
                  //face
                  [Math.floor(intercept[0]) , intercept[1] - 1],
                  //point on the face's edge
                  [ (intercept[0] - Math.floor(intercept[0])) , 1]
              ] )
  
              //Get the face above
              faces.push( [
                  //face
                  [Math.floor(intercept[0]) , intercept[1]],
                  //point on the face's edge
                  [ (intercept[0] - Math.floor(intercept[0])) , 0]
              ] )
          }
  
          //At this point, every face should have two points associated with it
          //So let's group them!
  
          let finalFaceArray = [ [ [Math.floor(oX), Math.floor(oY)],
                                   [oX - Math.floor(oX), oY - Math.floor(oY)] ], [
                                   [Math.floor(eX), Math.floor(eY)],
                                   [eX - Math.floor(eX), eY - Math.floor(eY)] ] ]
  
          i = 0
          let j = 0
          let found = false
  
          //I'm sure there's a fancier way of doing this
          for (i = 0; i < faces.length; i++) {
              //Check if the array already has the face
              for (j = 0; j < finalFaceArray.length; j++) {
                  if (JSON.stringify(finalFaceArray[j][0]) ===
                      JSON.stringify(faces[i][0]) ) {
  
                      //If it does, add its counterpart
                      finalFaceArray[j].push(faces[i][1])
                      found = true
                  }
              }
              //If nothing was found
              if (!found) {
                  finalFaceArray.push(faces[i])
              }
              //Reset the found
              found = false
          }
  
      //Output an array containing
      //[[square._x, square._y],
      //[square._xIntercept1, square._yIntercept1],
      //[square._xIntercept2, square._yIntercept2]]
  
  
          return finalFaceArray
    },
    parseDir: function (direction) { //Convert cardinal directions to [x, y]
        switch (direction) {
            case 'N':
                direction = [0, -1]
                break
            case 'S':
                direction = [0, 1]
                break
            case 'E':
                direction = [1, 0]
                break
            case 'W':
                direction = [-1, 0]
                break
            case 'NE':
                direction = [1, -1]
                break
            case 'NW':
                direction = [-1, -1]
                break
            case 'SE':
                direction = [1, 1]
                break
            case 'SW':
                direction = [-1, 1]
                break
        }
        return direction
    },
    fPIA: function (something, area) { //Find position in area's grid
      let x = something._x - area[0][0]._x
      let y = something._y - area[0][0]._y
      return [x, y]
    },
    //UI formatting
    textWrap: function (text, width) {
        let textWrapped = []
        let marker = null
        let line = ''
        let lineBreak = false
        let flag = false
        for (let i = 0; text.length > 0;) {
          if (text.charAt(i) === ' ') {
              marker = i
          }
          if (text.charAt(i) === '`') {
              marker = i
              lineBreak = true
              flag = true
          }
          if (i > width - 1) {
              lineBreak = true
          }
          i++
          if (lineBreak) {
              if (!flag && text.length <= width) {
                  textWrapped.push(text)
                  break
              }
              if (marker === null && !flag) {marker =  width - 2; line = '-'}
              line = text.substr(0,marker) + line
              if (text.charAt(marker) === ' ' || text.charAt(marker) === '`') {marker++}
              text = text.substr(marker)	
              textWrapped.push(line)		
              //Reset all the flags
              marker = null
              lineBreak = false
              flag = false
              line = ''
              i = 0			
          }
        }
        return textWrapped
    },
    createWindow: function (width, height, template) { //Returns a window grid
      template = template || {}
      template.border = template.border || {
          name: 'Default Border',
          type: 'Art',
          glyph: '|',
          fgColor: 'white',
          Traits: [Kii.Traits.Tangible]
      }
      template.header = template.header || {
          name: 'Default Header',
          type: 'Art',
          glyph: '=',
          fgColor: 'white',
          Traits: [Kii.Traits.Tangible]
      }
      template.footer = template.footer || {
          name: 'Default Footer',
          type: 'Art',
          glyph: '-',
          fgColor: 'white',
          Traits: [Kii.Traits.Tangible]
      }
      template.filler = template.filler || {
          name: 'Default Filler',
          type: 'Art',
          glyph: '/',
          fgColor: 'blue',
          Traits: [Kii.Traits.Tangible]
      }
      template.padding = template.padding || 1
  
      //Generate a grid with filler
      let filler = template.filler
      let pixels = Kii.Util.generateGrid(width,height, function (x, y){ let tile = new Kii.Entity(filler); return tile})
  
      //Now draw the sides
      //Cycle through each y and replace the start and end with the border
      for (const y in pixels) {
          pixels[y][0] = new Kii.Entity(template.border)
          pixels[y][pixels[y].length - 1] = new Kii.Entity(template.border)
      }
      //Now draw the header and footer
      for (const x in pixels[0]) {
          pixels[0][x] = new Kii.Entity(template.header)
          pixels[pixels.length - 1][x] = new Kii.Entity(template.footer)
      }
      //Write title (if one exists)
      title = template.title || "[Oops]"
      if (title) {
          let start = Math.floor(width / 2) - Math.floor(title.length / 2)
          if (start < 0) {
              console.error("Title was wider than the window!!");
          } else {
              for (let i = 0; i < title.length; i++) {
                  pixels[0][i + Math.floor(pixels[0].length / 2) - Math.floor(title.length / 2)]._glyph = title.charAt(i)
              }
          }
      }
      return pixels
    },
    createTextBox: function (width,height,text,template) { //Returns Grid + Text that couldn't fit
        template = template || {}
        template.padding = template.padding || 1
  
        pixels = Kii.Util.createWindow(width,height,template)
  
        //Get writeable space
        let pad = (template.padding + 1) * 2
        let wsx = width - pad //WriteableSpaceX
        let wsy = height - pad //WriteableSpaceY
  
        //Format text if it wasn't formatted already
        if (!Array.isArray(text)){text = Kii.Util.textWrap(text,wsx)}
  
        //Write text to pixels
        for (let y = 0; y < wsy; y++) {
            for (let x = 0; x < text[0].length; x++) {
                //left align
                pixels[(y + template.padding + 1)][(x + template.padding + 1)]._glyph = text[0].charAt(x)
                pixels[(y + template.padding + 1)][(x + template.padding + 1)]._name = text[0].charAt(x)
                pixels[(y + template.padding + 1)][(x + template.padding + 1)]._fgColor = 'yellow'
                //right align
                //pixels[y + pad][x + pad + (wsx - text[0].length)]._glyph = text[0].charAt(x)
                //center
                //pixels[y + pad][x + pad + Math.floor((wsx - text[0].length)/2)]._glyph = text[0].charAt(x)
            }
            text.shift()
            if (text.length === 0) {break}
        }
        let extra = null
        if (text.length > 0) {extra = text}
        return [pixels, extra]
    },
    //Basic maths for ease of use
    floor: function (number) {//Floors negative numbers so that -1.1 becomes -1 and not -2
      return (Math.sign(number) * Math.floor(Math.abs(number)))
    },
    slope: function (x, y) {//Finds the slope of two coords
      return ((y._y - x._y) / (y._x - x._x))
    }
  }