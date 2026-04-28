/**Example of a chip-comment for CSS|lightblue**/

/*
    <!--*Example of a chip-comment for HTML|#000000,#fff*-->
*/

/**
 * This should generate whitespace-respecting code similar to an HTML <pre> element.
 * Lines of CSS (between style tags) should have a faint, light blue background.
 * Chip comments (as described above) should look like, well, chips. An optional background color can be provided after a pipe (default is none), and an optional color can be provided following a comma.
 * @param {string} html
 * @returns {string} the HTML with features added
 */
export default function generatePreCode(html) {
    const lines = html.split('\n')
    let inStyle = false
    const result = []

    const regions = findLabeledRegions(lines)
    const opens = {}
    const closes = {}
    for (const region of regions) {
        ;(opens[region.startLine] ??= []).push(region)
        closes[region.endLine] = (closes[region.endLine] ?? 0) + 1
    }

    const indentStack = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (/<\/style>/i.test(line)) inStyle = false

        for (const { label, indent, depth } of (opens[i] ?? [])) {
            indentStack.push(indent)
            const bg = `rgba(0,0,0,${(depth + 1) * 0.05})`
            result.push(
                `<span style="position:relative;display:block;border:1px solid rgba(0,0,0,0.15);border-radius:3px;margin:1px 0;padding:3px;margin-left:${indent}ch;background:${bg}">` +
                `<span style="position:absolute;top:2px;right:4px;font-family:sans-serif;font-size:0.7em;opacity:0.4;pointer-events:none">${label}</span>`
            )
        }

        const stripIndent = indentStack.at(-1) ?? 0
        result.push(processLine(line, inStyle, stripIndent))
        if (!inStyle && i < lines.length - 1) result.push('\n')

        for (let c = 0; c < (closes[i] ?? 0); c++) {
            indentStack.pop()
            result.push('</span>')
        }

        if (/<style[^>]*>/i.test(line)) inStyle = true
    }

    return result.join('')
}

const VOID_ELEMENTS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'])

function findLabeledRegions(lines) {
    const regions = []
    for (let i = 0; i < lines.length; i++) {
        const labelMatch = lines[i].match(/data-label-([\w-]+)/)
        if (!labelMatch) continue

        const label = labelMatch[1]
        const tagMatch = lines[i].match(/<(\w+)[^>]*data-label-/)
        if (!tagMatch) continue
        const tagName = tagMatch[1].toLowerCase()

        let endLine = i
        if (!VOID_ELEMENTS.has(tagName)) {
            let depth = 0
            for (let j = i; j < lines.length; j++) {
                depth += (lines[j].match(new RegExp(`<${tagName}[\\s>/]`, 'gi')) ?? []).length
                depth -= (lines[j].match(new RegExp(`</${tagName}>`, 'gi')) ?? []).length
                if (depth <= 0) { endLine = j; break }
            }
        }

        const indent = (lines[i].match(/^(\s*)/) ?? [''])[0].length
        regions.push({ startLine: i, endLine, label, indent })
    }

    for (const region of regions) {
        region.depth = regions.filter(r => r !== region && r.startLine <= region.startLine && r.endLine >= region.endLine).length
    }

    return regions
}

// Matches /**chip content**/ or <!--*chip content*-->
const CHIP_RE = /\/\*\*(.+?)\*\*\/|<!--\*(.+?)\*-->/g

function processLine(line, isCss, stripIndent = 0) {
    line = line.replace(/\s*data-label-[\w-]+/g, '')
    if (stripIndent > 0) {
        const leading = (line.match(/^(\s*)/) ?? [''])[0].length
        line = line.slice(Math.min(stripIndent, leading))
    }

    let output = ''
    let lastIndex = 0
    let match

    CHIP_RE.lastIndex = 0
    let hasChip = false
    while ((match = CHIP_RE.exec(line)) !== null) {
        hasChip = true
        output += escapeHtml(line.slice(lastIndex, match.index))
        output += renderChip(match[1] ?? match[2])
        lastIndex = match.index + match[0].length
    }
    output += escapeHtml(line.slice(lastIndex))

    if (hasChip) {
        const bg = isCss ? '#78c4e7' : '#ecb87c'
        output = `<span style="background:${bg};color:black;display:block">${output}</span>`
    } else if (isCss) {
        output = `<span style="background:rgb(185, 238, 255);display:block">${output}</span>`
    }

    return output
}

function escapeHtml(str) {
    return str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function renderChip(content) {
    const pipeIdx = content.indexOf('|')
    const text = pipeIdx === -1 ? content : content.slice(0, pipeIdx)
    return `<span style="font-style:italic;font-family:sans-serif;opacity:0.65;font-size:0.8em;">${escapeHtml(text)}</span>`
}