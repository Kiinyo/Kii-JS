Kii.Region = function (world, coords) {
    //Form the template for the region
    let template = {}
    //Decide how to build the region using the world and coords
    if (coords._inBounds) {
      template = {
        name: 'Default',
        type: 'Region',
        Traits: [Kii.Traits.Tangible]
      }
    } else {
      template = {
        name: 'Void',
        type: 'Region',
        Traits: [Kii.Traits.Tangible]
      }
    }
    template.x = coords.Region._x
    template.y = coords.Region._y
    Kii.Entity.call(this, template)
  }