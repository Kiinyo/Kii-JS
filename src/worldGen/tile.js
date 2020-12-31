Kii.Tile = function (chunk, x, y, overwrite) {
    //Form the template for the chunk
    let template = {}
    //Decide how to build the chunk using the region and coords
    switch (chunk._name) {
      case 'OOB':
        template = {
          name: 'Out Of Bounds',
          type: 'Tile',
          glyph: 'X',
          fgColor: 'white',
          bgColor: 'blue',
          passable: false,
          Traits: [Kii.Traits.Tangible, Kii.Traits.Tile]
        }
        break
      case 'Void':
        template = {
          name: 'Void',
          type: 'Tile',
          glyph: ' ',
          bgColor: 'red',
          passable: false,
          Traits: [Kii.Traits.Tangible, Kii.Traits.Tile]
        }
        template.x = x
        template.y = y
        break
      default:
        template = {
          name: 'Default',
          type: 'Tile',
          glyph: '.',
          fgColor: 'green',
          Traits: [Kii.Traits.Tangible, Kii.Traits.Tile]
        }
        template.x = x
        template.y = y
        break
  
    }
    Kii.Entity.call(this, template)
  }