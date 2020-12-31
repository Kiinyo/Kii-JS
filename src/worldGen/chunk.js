Kii.Chunk = function (region, coords) {//Where the chunk gets constructed
    //Form the template for the chunk
    let template = {}
    //Decide how to build the chunk using the region and coords
    if (region._name === 'Default') {
      template = {
        name: 'Default',
        entities: [
          Game.Faunas.WildAnimal,
          //Tree
          {
            name: 'Tree',
            desc: 'You punch these for wood!',
            type: 'Flora',
        
            x: 1,
            y: 1,
        
            fgColor: 'green',
            glyph: 'T',
            Traits: [Kii.Traits.Tangible]
          }
      ],
        Traits: [Kii.Traits.Tangible]
      }
    } else {
      template = {
        name: 'Void',
        Traits: [Kii.Traits.Tangible]
      }
    }
    template.x = coords.Chunk._x
    template.y = coords.Chunk._y
    Kii.Entity.call(this, template)
    this.Entities = template.entities || []
  }