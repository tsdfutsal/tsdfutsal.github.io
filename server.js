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

// key = id
const penali = {}

// key = utakmica id
const penaliPoUtakmici = {}

// key = id
const stadioni = {}

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
                        utakmice[ut.id] = new Utakmica(ut.id, ut.id_faze, ut.id_tim1, ut.id_tim2, ut.id_stadion, ut.datum_vrijeme)
                    }
                )
            }
            else if (obj.name == 'penali') {
                obj.data.forEach(
                    p => {
                        penali[p.id] = new Penali(p.id, p.tim1_golovi, p.tim2_golovi, p.id_utakmice)
                    }
                )
            }
            else if (obj.name == 'stadion') {
                obj.data.forEach(
                    s => {
                        stadioni[s.id] = new Stadion(s.id, s.ime)
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

    penali.forEach(
        p => {
            penaliPoUtakmici[p.idUtakmice] = p
        }
    )
}

export class Stadion {
    constructor(id, ime) {
        this.id = id
        this.ime = ime
    }
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

export const Faza = Object.freeze({
    FAZA_PRVA_ID: 1,
    FAZA_DRUGA_ID: 2
})

export class Utakmica {
    constructor(id, idFaze, idTim1, idTim2, idStadion, datumVrijeme) {
        this.id = id
        this.idFaze = idFaze
        this.idTim1 = idTim1
        this.idTim2 = idTim2
        this.idStadion = idStadion
        this.datumVrijeme = datumVrijeme
    }

    /**
     * 
     * @returns {Tim}
     */
    getTim1() {
        return timovi[this.idTim1]
    }

    /**
     * 
     * @returns {Tim}
     */
    getTim2() {
        return timovi[this.idTim2]
    }

    /**
     * 
     * @returns {Igrac[]}
     */
    getStrijelci() {
        const golovi = Array.from(goloviPoUtakmici[this.id])
        const strijelci = golovi.map(g => {
            return igraci[g.idStrijelca]
        })

        return strijelci
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

    /**
     * vraca [tim1Golovi, tim2Golovi]
     */
    getRezultatPrijePenala() {
        return [this.getGoloviTim1(), this.getGoloviTim2()]
    }

    /**
     * vraca [tim1Golovi, tim2Golovi]
     */
    getRezultatPenala() {
        const p = penaliPoUtakmici[this.id]
        return p ? [p.tim1Golovi, p.tim2Golovi] : null
    }

    /**
     * vraca [tim1Golovi, tim2Golovi]
     */
    getRezultatPoslijePenala() {
        const prije = this.getRezultatPrijePenala()
        const pen = this.getRezultatPenala()

        return [prije[0] + pen[0], prije[1] + pen[1]]
    }

    /**
     * 
     * @returns ISHOD_1 (pobjeda prvog tima) ili ISHOD_2 (pobjeda drugog tima)
     */
    getIshod() {
        const rez = this.getRezultatPoslijePenala()
        return rez[0] > rez[1] ? ISHOD_1 : ISHOD_2
    }

    getRezultatToString() {
        const prije = this.getRezultatPrijePenala()
        const poslije = this.getRezultatPoslijePenala()
        return `${prije[0]} - ${prije[1]} (${poslije[0]} - ${poslije[1]})`
    }

    jeIslaNaPenale() {
        return this.getRezultatPenala() != null
    }

    getStadionIme() {
        return stadioni[this.idStadion].ime
    }
}

export class Penali {
    constructor(id, tim1Golovi, tim2Golovi, idUtakmice) {
        this.id = id
        this.tim1Golovi = tim1Golovi
        this.tim2Golovi = tim2Golovi
        this.idUtakmice = idUtakmice
    }
}

export function fazaToString(faza) {
    // TODO: faza to string
}

/**
 * 
 * @param {Faza} idFaze Faza.xxxxxx
 * @returns 
 */
export function getUtakmicePoFazi(idFaze) {
    const ret = []

    Object.values(utakmice).forEach(
        ut => {
            if (ut.idFaze == idFaze) {
                ret.push(ut)
            }
        }
    )

    return ret
}