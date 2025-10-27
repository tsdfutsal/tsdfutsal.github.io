const tables = {}

// key = id
const timovi = {}

// key = id
const utakmice = {}

// key = id
const golovi = {}

// key = utakmica id
const goloviPoUtakmici = {}

// key = id
const igraci = {}

export async function init() {
    const json = await fetch(`data/tsdfutsal.json`).then(r => r.json())

    json.forEach(
        obj => {
            if (obj.type != 'table') {
                return
            }

            tables[obj.name] = obj.data

            if (obj.name == 'tim') {
                obj.data.forEach(
                    tim => {
                        timovi[tim.id] = new Tim(tim.id, tim.ime)
                    }
                )
            }
            if (obj.name == 'gol') {
                obj.data.forEach(
                    g => {
                        golovi[g.id] = new Gol(g.id, g.id_strijelca, g.id_utakmice, g.fallback_id_tima)
                    }
                )
            }
            if (obj.name == 'igrac') {
                obj.data.forEach(
                    i => {
                        igraci[i.id] = new Igrac(i.id, i.ime, i.prezime, i.id_tim)
                    }
                )
            }
            else if (obj.name == 'utakmica') {
                obj.data.forEach(
                    ut => {
                        utakmice[ut.id] = new Utakmica(ut.id, ut.faza, ut.id_tim1, ut.id_tim2, ut.id_stadion, ut.datum_vrijeme)
                    }
                )
            }
        }
    )

    golovi.forEach(
        g => {
            goloviPoUtakmici[g.idUtakmice] = g
        }
    )
}

export class Gol {
    constructor(id, idStrijelca, idUtakmice, fallbackIdTima) {
        this.id = id
        this.idStrijelca = idStrijelca
        this.idUtakmice = idUtakmice
        this.fallbackIdTima = fallbackIdTima
    }
}

export class Tim {
    constructor(id, ime) {
        this.id = id
        this.ime = ime
    }
}

export class Igrac {
    constructor(id, ime, prezime, idTim) {
        this.id = id
        this.ime = ime
        this.prezime = prezime
        this.idTim = idTim
    }
}

export const Ishod = Object.freeze({
    ISHOD_1: 0,
    ISHOD_2: 1
})

export class Utakmica {
    constructor(id, faza, idTim1, idTim2, idStadion, datumVrijeme) {
        this.id = id
        this.faza = faza
        this.idTim1 = idTim1
        this.idTim2 = idTim2
        this.idStadion = idStadion
        this.datumVrijeme = datumVrijeme
    }

    getTim1() {
        return timovi[this.idTim1]
    }

    getTim2() {
        return timovi[this.idTim2]
    }

    getStrijelci() {
        const golovi = Array.from(goloviPoUtakmici[this.id])
        const strijelci = golovi.map(g => {
            return igraci[g.idStrijelca]
        })

        return strijelci
    }

    jeIslaNaPenale() {

    }

    getGolovi(jeTim1) {
        const n = 0
        const tgtTimId = jeTim1 ? this.idTim1 : this.idTim2

        goloviPoUtakmici[this.id].forEach(
            g => {
                const timId = null
                if (g.idStrijelca) {
                    timId = igraci[g.idStrijelca].idTim
                }
                else {
                    timId = g.fallbackIdTima
                }

                if (timId == tgtTimId) {
                    n++
                }
            }
        )

        return n
    }

    getGoloviTim1() {
        return getGolovi(true)
    }

    getGoloviTim2() {
        return getGolovi(false)
    }

    // vraca [tim1Golovi, tim2Golovi]
    getRezultatPrijePenala() {
        return [this.getGoloviTim1(), this.getGoloviTim2()]
    }

    // vraca [tim1Golovi, tim2Golovi]
    getRezultatPenala() {
        // TODO: penali
    }

    // vraca [tim1Golovi, tim2Golovi]
    getRezultatPoslijePenala() {

        // TODO: penali
        const prije = this.getRezultatPrijePenala()
        return prije
    }

    getIshod() {
        const rez = this.getRezultatPoslijePenala()
        return rez[0] > rez[1] ? ISHOD_1 : ISHOD_2
    }

    getRezultatToString() {
        const prije = this.getRezultatPrijePenala()
        const poslije = this.getRezultatPoslijePenala()
        return `${prije[0]} - ${prije[1]} (${poslije[0]} - ${poslije[1]})`
    }
}

export function fazaToString(faza)
{
    // TODO: faza to string
}

export function getUtakmicePoFazi(faza) {
    const ret = []

    Object.values(utakmice).forEach(
        ut => {
            if (ut.faza == faza) {
                ret.push(ut)
            }
        }
    )

    return ret
}