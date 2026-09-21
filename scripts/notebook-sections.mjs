import { readFile } from 'node:fs/promises';

// HTML5 named character references, copied from Python's standard-library
// html.entities.html5 table. Keeping the data here makes generation Node-only.
const entities = JSON.parse(await readFile(new URL('./html-entities.json', import.meta.url), 'utf8'));
const voidElements = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const rawTextElements = new Set(['script', 'style', 'xmp', 'iframe', 'noembed', 'noframes']);
const numericReplacements = new Map([
  [128, 8364], [130, 8218], [131, 402], [132, 8222], [133, 8230], [134, 8224], [135, 8225],
  [136, 710], [137, 8240], [138, 352], [139, 8249], [140, 338], [142, 381], [145, 8216],
  [146, 8217], [147, 8220], [148, 8221], [149, 8226], [150, 8211], [151, 8212], [152, 732],
  [153, 8482], [154, 353], [155, 8250], [156, 339], [158, 382], [159, 376]
]);

function decodeText(value, attribute = false) {
  return value.replace(/&(#(?:x[\da-f]+|\d+);?|[a-z][a-z\d]*;?)/gi, (match, reference, offset) => {
    if (reference[0] === '#') {
      let code = /^#x/i.test(reference) ? parseInt(reference.slice(2), 16) : parseInt(reference.slice(1), 10);
      if (!code || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) code = 0xfffd;
      return String.fromCodePoint(numericReplacements.get(code) || code);
    }
    // HTML permits certain legacy names without a semicolon. Match the longest
    // valid name, respecting the stricter rule inside an attribute value.
    for (let length = reference.length; length; length--) {
      const name = reference.slice(0, length);
      if (!Object.hasOwn(entities, name)) continue;
      const following = value[offset + length + 1] || '';
      if (attribute && !name.endsWith(';') && /[=a-z\d]/i.test(following)) return match;
      return entities[name] + reference.slice(length);
    }
    return match;
  });
}

function attributes(openingTag) {
  const result = Object.create(null);
  const source = openingTag.replace(/^<[^\s/>]+/, '').replace(/\/?\s*>$/, '');
  for (const match of source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    const name = match[1].toLowerCase();
    // Like the browser, the first occurrence of a duplicated attribute wins.
    if (!Object.hasOwn(result, name)) result[name] = decodeText(match[2] ?? match[3] ?? match[4] ?? '', true);
  }
  return result;
}

/**
 * Extract the notebook's existing DOM selectors from authored static HTML.
 * A token/element stack preserves descendant boundaries and document order;
 * it does not execute scripts or fetch documents. Comments and template content
 * are ignored, void elements do not open a scope, and raw text is not markup.
 * The lesson documents use explicit element/section boundaries. This is a
 * purpose-built extractor, not a replacement for a browser's HTML tree repair.
 */
export function extractNotebookSections(source, filename = 'lesson HTML') {
  source = source.replace(/\r\n?/g, '\n');
  const tokens = /<!--[\s\S]*?(?:-->|$)|<![^>]*>|<\?[^>]*>|<\/?[a-zA-Z](?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+|</g;
  const stack = [];
  const sections = [];
  const ids = new Set();
  let homeLink;

  function appendText(text, raw = false) {
    if (stack.some(node => node.tag === 'template')) return;
    const decoded = raw ? text : decodeText(text);
    for (const node of stack) if (node.capture) node.capture.text += decoded;
  }

  for (let match; (match = tokens.exec(source));) {
    const token = match[0];
    if (token.startsWith('<!--') || token.startsWith('<!') || token.startsWith('<?')) continue;
    if (/^<\//.test(token)) {
      const tag = /^<\/([^\s>]+)/.exec(token)[1].toLowerCase();
      const index = stack.findLastIndex(node => node.tag === tag);
      if (index >= 0) stack.length = index;
      continue;
    }
    if (!/^<[a-z]/i.test(token)) { appendText(token); continue; }

    const tag = /^<([^\s/>]+)/.exec(token)[1].toLowerCase();
    const attrs = attributes(token);
    const classes = (attrs.class || '').split(/[\t\n\f\r ]+/);
    const node = { tag };
    const insideTemplate = stack.some(parent => parent.tag === 'template');
    if (!insideTemplate) {
      if (tag === 'a' && attrs.href === '#home' && !homeLink && stack.some(parent => parent.tag === 'nav')) {
        homeLink = node.capture = { text: '' };
      }
      if (classes.includes('page-title') || classes.includes('section-title') || tag === 'h1' || tag === 'h2') {
        for (const parent of stack) {
          if (parent.section && !parent.section.heading) parent.section.heading = node.capture ||= { text: '' };
        }
      }
      if (classes.includes('page-section') && (attrs.id || '').startsWith('page-')) {
        const id = attrs.id.slice(5);
        if (!id || ids.has(id)) throw new Error(`Invalid or duplicate notebook section "${id}" in ${filename}`);
        ids.add(id);
        node.section = { id };
        sections.push(node.section);
      }
    }

    if (voidElements.has(tag)) continue;
    stack.push(node);
    if (rawTextElements.has(tag) || tag === 'textarea' || tag === 'title') {
      const endTag = new RegExp(`</${tag}\\s*>`, 'gi');
      endTag.lastIndex = tokens.lastIndex;
      const end = endTag.exec(source);
      appendText(source.slice(tokens.lastIndex, end?.index ?? source.length), rawTextElements.has(tag));
      tokens.lastIndex = end ? endTag.lastIndex : source.length;
      stack.pop();
    }
  }

  if (!sections.length) throw new Error(`No notebook sections found in ${filename}`);
  return sections.map(section => ({
    id: section.id,
    title: ((section.id === 'home' && homeLink?.text) || section.heading?.text || section.id).trim()
  }));
}

export async function buildNotebookSections(chapters, root) {
  const catalog = Object.create(null);
  for (const chapter of chapters) {
    if (!Number.isInteger(chapter.num) || chapter.num < 1 || Object.hasOwn(catalog, chapter.num)) {
      throw new Error(`Invalid or duplicate notebook chapter number: ${chapter.num}`);
    }
    catalog[chapter.num] = extractNotebookSections(await readFile(new URL(chapter.url, root), 'utf8'), chapter.url);
  }
  return catalog;
}
