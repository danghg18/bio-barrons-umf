/* Glossary-only matching; normalization stays shared with lesson search. */
(function () {
  'use strict';
  const normalize = value => window.BBSearchText.normalize(value).trim();
  function find(entries, query, options = {}) {
    const needle = normalize(query);
    const words = needle.split(' ').filter(Boolean);
    const letter = normalize(options.letter);
    return entries.map((entry, order) => {
      const term = normalize(entry.term);
      if (letter && !term.startsWith(letter)) return null;
      if (!needle) return { entry, order, rank: 0 };
      if (term === needle) return { entry, order, rank: 0 };
      if (options.exact) return null;
      const body = term + ' ' + normalize(entry.definition);
      if (!words.every(word => body.includes(word))) return null;
      const rank = term.startsWith(needle) ? 1 : term.includes(needle) ? 2 :
        words.every(word => term.includes(word)) ? 3 : 4;
      return { entry, order, rank };
    }).filter(Boolean).sort((a, b) => a.rank - b.rank || a.order - b.order).map(result => result.entry);
  }
  function ranges(text, query) {
    const needle = normalize(query);
    if (!needle) return [];
    let folded = '';
    const starts = [], ends = [];
    // Keep offsets in the displayed source, even for decomposed Unicode letters.
    for (let i = 0; i < text.length; i++) {
      const part = window.BBSearchText.normalize(text[i]);
      if (!part || (part === ' ' && folded.endsWith(' '))) {
        if (ends.length) ends[ends.length - 1] = i + 1;
        continue;
      }
      for (const character of part) { folded += character; starts.push(i); ends.push(i + 1); }
    }
    const needles = folded.includes(needle) ? [needle] : [...new Set(needle.split(' '))];
    const matches = [];
    for (const part of needles) {
      if (!part) continue;
      let at = folded.indexOf(part);
      while (at !== -1) {
        matches.push([starts[at], ends[at + part.length - 1]]);
        at = folded.indexOf(part, at + part.length);
      }
    }
    const merged = [];
    matches.sort((a, b) => a[0] - b[0]).forEach(range => {
      const previous = merged[merged.length - 1];
      if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
      else merged.push(range);
    });
    return merged;
  }
  window.BBGlossarySearch = { find, ranges, normalize };
})();
