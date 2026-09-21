/* Shared passage matching for catalog search and lesson highlighting. */
(function () {
  'use strict';
  function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ');
  }
  function indexText(text) {
    let normalized = '';
    const starts = [], ends = [];
    for (let i = 0; i < text.length; i++) {
      const chunk = normalize(text[i]);
      if (!chunk || (chunk === ' ' && normalized.endsWith(' '))) {
        if (ends.length) ends[ends.length - 1] = i + 1;
        continue;
      }
      for (const character of chunk) {
        normalized += character;
        starts.push(i);
        ends.push(i + 1);
      }
    }
    return { normalized, starts, ends };
  }
  function index(root) {
    const runs = [];
    root.querySelectorAll('.page-section:not([data-curriculum-excluded])').forEach(section => {
      let text = '', pieces = [];
      function flush() {
        if (text.trim()) runs.push({ text, pieces, sectionId: section.id.replace(/^page-/, ''),
          section, indexed: indexText(text) });
        text = '';
        pieces = [];
      }
      function visit(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const value = node.textContent || '';
          if (value) pieces.push({ node, start: text.length, end: text.length + value.length });
          text += value;
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches('script,style,nav,button,input,textarea,select,svg,[data-curriculum-excluded]')) { flush(); return; }
        // Inline emphasis and student marks must not interrupt a phrase. Block
        // boundaries, independent badges and controls never join passages.
        const inline = node.matches('a,span,strong,b,em,i,u,small,sub,sup,abbr,mark,s,strike,code') &&
          !node.matches('.badge,.box > strong');
        if (!inline) flush();
        node.childNodes.forEach(visit);
        if (!inline) flush();
      }
      visit(section);
      flush();
    });
    return runs;
  }
  function occurrences(text, needle) {
    const ranges = [];
    let from = 0;
    while (from < text.length) {
      const start = text.indexOf(needle, from);
      if (start < 0) break;
      ranges.push({ start, end: start + needle.length });
      from = start + needle.length;
    }
    return ranges;
  }
  function find(runs, query, options) {
    const needle = normalize(query).trim();
    if (!needle) return [];
    const terms = [...new Set(needle.split(' '))];
    const matches = [];
    const limit = options && options.limit || Infinity;
    for (const run of runs) {
      const indexed = run.indexed;
      let groups = occurrences(indexed.normalized, needle).map(range => [range]);
      if (!groups.length && terms.length > 1) {
        const byTerm = terms.map(term => occurrences(indexed.normalized, term));
        if (byTerm.every(ranges => ranges.length)) groups = [byTerm.flat()];
      }
      for (const group of groups) {
        if (matches.length >= limit) return matches;
        const ranges = [];
        group.sort((a, b) => a.start - b.start).forEach(range => {
          const source = { start: indexed.starts[range.start], end: indexed.ends[range.end - 1] };
          const previous = ranges[ranges.length - 1];
          if (previous && source.start <= previous.end) previous.end = Math.max(previous.end, source.end);
          else ranges.push(source);
        });
        const parts = [];
        ranges.forEach(range => run.pieces.forEach(piece => {
          if (piece.start < range.end && piece.end > range.start) parts.push({ node: piece.node,
            start: Math.max(range.start, piece.start) - piece.start,
            end: Math.min(range.end, piece.end) - piece.start });
        }));
        matches.push({ run, ranges, parts,
          sectionId: options && options.fullSectionId ? 'page-' + run.sectionId : run.sectionId });
      }
    }
    return matches;
  }
  window.BBSearchText = { normalize, index, find, collect: (query, options) => find(index(document), query, options) };
})();
