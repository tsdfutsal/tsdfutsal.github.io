export function init() {
}

export async function getConfig(name) {
    return await fetch(`./data/${name}.json`).then(r => r.json())
}

export async function getStadiums() {
    return Array.from(await getConfig('stadiums'))
}