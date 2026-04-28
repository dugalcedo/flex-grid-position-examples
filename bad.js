import generatePreCode from "./js/generatePreCode.js"

const examplesSection = document.querySelector('.examples')

const EXAMPLES = ['bad1', 'bad2', 'bad3', 'bad4', 'bad5', 'bad6']

main()
async function main() {
    for (const EXAMPLE of EXAMPLES) {
        const html = await loadExample(EXAMPLE)
        examplesSection.insertAdjacentHTML('beforeend', html)
    }
}

async function loadExample(name) {
    const res = await fetch(`./examples/${name}.html`)
    const html = await res.text()
    return `
        <div class="example">
            <div class="code">
                <code><pre>${generatePreCode(html)}</pre></code>
            </div>
            <div class="iframe">
                <iframe src="./examples/${name}.html" />
            </div>
        </div>
    `
}
