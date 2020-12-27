Kii.Render = {
    //Overlays
    debug: function (display, palette) {//Basic I/O stuff
      let ctx = display.getContext('2d')
  
      let x = Game.Mouse._x.toString()
      let y = Game.Mouse._y.toString()
  
      ctx.fillStyle = palette['black']
      ctx.textBaseline = 'hanging'
      ctx.textAlign = 'left'
      ctx.font = '16px Coolvetica'
  
      let text = 'Mouse coordinates: ' + x + ', ' + y
      ctx.fillText(text,0,0)
  
      text = 'LMB pressed: ' + Game.Mouse.Pressed['LMB'].toString()
      ctx.fillText(text,0,22)
  
      ctx.textAlign = 'center'
  
      ctx.font = '22px Coolvetica'
  
      ctx.textBaseline = 'alphabetic'
      ctx.strokeStyle = palette['green']
      ctx.lineWidth = 4
      ctx.fillStyle = palette['white']
      ctx.strokeText('@', x, y)
      ctx.fillText('@', x, y)
    },
    //Map rendering
    ASCII: function (display, grid) {//Renders what the camera passes it
      format = grid.Format
      palette = format[2] || {}
      //Grab all the 'pixels' from the grid as well as their dimensions
      let pixels = grid.Grid
  
      let pD = format[0]
      pD = {
        _width: pD._height || pD,
        _height: pD._width || pD
      }
      //Determine the height and width of the entire grid including spacing
      let sW = format[1]
      let sH = format[1]
      let width = (pD._width + sW) * pixels[0].length + sW
      let height = (pD._height + sH) * pixels.length + sH
      //Set up the context for the image to be drawn on
      let ctx = display.getContext('2d')
      //Now fill in the background a solid color based on earlier dimensions
      ctx.fillStyle = palette['black']
  
      ctx.fillRect(grid._x,grid._y,width, height)
  
      //Once we have our background laid in, we can start setting up the context
      //for drawing each 'pixel' on the screen. Pixels being glyphs in this case.
  
      //By setting up the textAlign and Baseline to be completely centered, we
      //don't have to worry about letters being misaligned or looking bad!
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      //Now set the font with some fun tricks with creating strings
      ctx.font = format[3]
      //Now finally we can start drawing the 'pixels' on the screen!
      //First we'll declare some variables starting with the container
      //for the 'pixel' itself!
      let pixel = null
      //Then we'll declare the variables that will determine the
      //position of the pixels we're drawing
      let drawX = 0
      let drawY = 0
      //And finally we'll declare the things we need to actually
      //draw the pixels
      let background = null
      let stroke = null
      let symbol = null
      //And we can start iterating through the pixels to draw them
      for (let y = 0; y < pixels.length; y++) {
        for (let x = 0; x < pixels[y].length; x++) {
          //
          pixel = pixels[y][x]
          //console.log(JSON.stringify(pixel))
          drawX = (x * (pD._width + sW)) + (pD._width / 2) + sW
          drawY = (y * (pD._height + sH)) + (pD._height / 2) + sH
  
          //console.log('Pixel: ' + pixel.Symbol._char + ', x' + x+ ', y'+ y )
          //Since each 'pixel' is a letter we have some things
          //we can play with with how HTML5 draws text!
          //First let's see if the 'pixel' has a background, if so, draw it
          if (pixel._bgColor) {
            background = pixel._bgColor
            ctx.fillStyle = palette[background] || 'black'
            ctx.fillRect(grid._x + drawX - (pD._width/2), grid._y + drawY - (pD._height/2),
                        pD._width, pD._height)
          }
          //Then we'll see if it has a stroke
          if (pixel._stColor) {
            stroke = pixel.Stroke
            ctx.strokeStyle = palette[stroke] || 'red'
            ctx.lineWidth = stroke._width || 5
            ctx.strokeText(pixel.Symbol._char, grid._x + drawX,drawY + grid._y)
          }
          //Then we'll see if it has a letter to draw
          if (pixel._glyph) {
            ctx.fillStyle = palette[pixel._fgColor] || 'yellow'
            ctx.fillText(pixel._glyph, grid._x + drawX, grid._y + drawY)
          }
        }
      }
    },
    //Basic functions
    fill: function (display, color, palette) {//Floods the entire screen with a color
      palette = palette || {}
      color = color || 'black'
  
      let ctx = display.getContext('2d')
      ctx.fillStyle = palette[color] || 'purple'
      ctx.fillRect(0,0,display.width,display.height)
    },
    wipe: function (display) {//Wipe the entire canvas
      let ctx = display.getContext('2d')
      ctx.clearRect(0,0,display.width,display.height)
    }
  }