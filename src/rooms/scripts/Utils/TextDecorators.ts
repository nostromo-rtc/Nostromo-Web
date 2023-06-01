const urlRe = /^[^\s\.]+\.\S{2,}$/;
const htmlTagsRe = /[&"'<>]/g;

const htmlTagsSymbols = new Map<string, string>([
    ['&', "&amp;"],
    ['"', "&quot;"],
    ['\'', "&apos;"],
    ['<', "&lt;"],
    ['>', "&gt;"]
]);

export function wrapLinksInText(text: string): string 
{
    const words = text.split(' ');
    const N = words.length;

    for (let i = 0; i < N; ++i) 
    {
        if (urlRe.test(words[i])) 
        {
            const ref = words[i].startsWith("http") ? words[i] : `http://${words[i]}`;
            words[i] = `<a href="${ref}" target="_blank" rel="noopener noreferrer">${words[i]}</a>`;
        }
    }

    return words.join(' ');
}

export function escapeHtmlTags(text: string): string
{
    return text.replace(htmlTagsRe, s => htmlTagsSymbols.get(s) as string);
}
