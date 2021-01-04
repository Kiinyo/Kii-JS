Game.Compendium = function (template) {
    this.Pages = new Map()

    this.addPage = function (content, page) { //Adds a new page to Pages featuring content
        page = page || content.name
        //Determine whether or not the object has an a preexisting
        //Entry in the compendium
        if (this.Pages.has('page')) {
            console.log("This thing already exists in the compendium!")
        } else {
            this.Pages.set(page, content)

            //Now let's keep track of where it can spawn
            let temp = content.Ranges[0] //Temperature
            let elev = content.Ranges[1] //Elevation
            let humi = content.Ranges[2] //Humidity

            let hash = ''
            let lhsh = '' //Little HaSH - Either 'Fert' or 'Hzrd'

            //Generate every possible iteration where the content can show up
            for (let t = temp[0]; t <= temp[1]; t++) {
                for (let e = elev[0]; e <= elev[1]; e++) {
                    for (let h = humi[0]; h <= humi[1]; h++) {
                        for (let i = 0; i < content.hazardLevel.length; i++) {
                            if (content.hazardLevel[i] > 0) {lhsh = 'Fert'} else {lhsh = 'Hzrd'}
                            hash = lhsh + '#t' + t.toString() + '#e' + e.toString() + '#h' + h.toString()
                            if (this.Pages.has(hash)) {
                                x = this.Pages.get(hash)
                                x.push(content)
                            } else {
                                x = [content]
                            }
                            this.Pages.set(hash, x) 
                        }
                    }
                }
            }
        }
    }
    this.findPage = function (hash) { //Looks up a page, returns null if there is nothing and writes to console
        if (this.Pages.has(hash)) {
            return this.Pages.get(hash)
        } else {
            console.log("There's nothing here!")
            return null
        }
    }
}