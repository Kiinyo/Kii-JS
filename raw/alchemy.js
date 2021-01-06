Kii.Alchemy = {
    Domains: {
        Apothecary: { //Affects living things
            Life_Force: { //Affects HP, can restore or drain (poison)
                //What it affects
                target: '_lifeForce',
                //How much it affects per unit of size
                magnitude: 200,
                //How many different types exist
                variation: 3,
                //Does it have an 'antidote' or reverse effect
                reversable: true
            },
            Energy: { //Affects Energy/MP, can restore or drain (sleep)
                target: '_energy',
                magnitude: 10000,
                variation: 3,
                reversable: true
            },
            Stamina: { //Affects Stamina, can restore or drain (paralyze)
                target: '_stamina',
                magnitude: 1000,
                variation: 3,
                reversable: true
            },
            Disease: { //Can cure 3 different variations of Disease
                target: 'Diseases',
                magnitude: -100,
                variation: 3,
                reverseable: false
            }
        },
        Alteration: { //Affects physical properties
            Bouyancy: {
                target: 'Bouyancy',
                magnitude: 100,
                variation: 1,
                reversable: true
            },
            Refraction: {
                target: 'Refraction',
                magnitude: 100,
                variation: 1,
                reversable: true
            },
            Size: {
                target: 'Size',
                magnitude: 100,
                variation: 1,
                reversable: true
            }
        },
        Chemistry: {
            Catalyst: {
                target: 'Catalyst',
                magnitude: 1,
                variation: 3,
                reversable: false
            }
        }
    }
}