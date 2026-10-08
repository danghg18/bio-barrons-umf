import {publishedResources} from './site-registry.mjs';
const escape = value => String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// Locate explicit, balanced elements in the authored catalog without serializing
// the rest of the document (in particular the protected lesson prose).
function elements(source, className) {
  const result=[];
  const pattern=/<([a-z][\w-]*)\b[^>]*\bclass="([^"]*)"[^>]*>/gi;
  for (const opening of source.matchAll(pattern)) {
    if(!opening[2].split(/\s+/).includes(className)) continue;
    const tags=new RegExp(`<\\/?${opening[1]}\\b[^>]*>`,'gi');
    tags.lastIndex=opening.index+opening[0].length;
    let depth=1, close;
    while(depth && (close=tags.exec(source))) depth+=close[0].startsWith('</')?-1:1;
    if(depth) throw new Error(`Unclosed ${className}`);
    result.push({start:opening.index,end:tags.lastIndex,open:opening[0],body:source.slice(opening.index+opening[0].length,close.index),tag:opening[1]});
  }
  return result;
}
function replaceElements(source,className,render) {
  for(const node of elements(source,className).reverse()) source=source.slice(0,node.start)+render(node)+source.slice(node.end);
  return source;
}
function inner(source,className,value) {
 return replaceElements(source,className,node=>node.open+value+`</${node.tag}>`);
}
function metadata(source,kind,name,value) {
 const tag=`<meta ${kind}="${name}" content="${escape(value)}">`;
 const pattern=new RegExp(`<meta\\s+${kind}="${name}"[^>]*>`,'i');
 return pattern.test(source)?source.replace(pattern,()=>tag):source.replace('</head>',tag+'\n</head>');
}
// The first paint uses the same catalog structure as analytics hydration. Build
// every row from canonical metadata so drafts and newly published sets never
// depend on JavaScript replacing stale links in the delivered document.
function testingCatalog(source,registry,quizzes) {
 const groups=new Map();
 for(const chapter of registry.CHAPTERS.concat((registry.BIO_SITE.quizCollections || []).filter(item=>item.done))) {
  if(!groups.has(chapter.cat)) groups.set(chapter.cat,[]);
  groups.get(chapter.cat).push(chapter);
 }
 let groupNumber=0;
 const html=[...groups].map(([category,chapters])=>{
  groupNumber++;
  const rows=chapters.map(chapter=>{
   const quiz=quizzes.find(item=>item.chapterNum===chapter.num);
   const content=`<span class="lab-item-num">${escape(chapter.shortLabel || String(chapter.num).padStart(2,'0'))}</span><span class="testing-chapter-name"><span class="lab-item-title">${escape(chapter.name)}</span><span class="lab-item-tags">${quiz ? quiz.questions.length + ' de grile' : 'Test în pregătire'}</span></span>`;
   if(!quiz) return `<div class="testing-chapter-row is-unavailable"><button type="button" class="lab-item lab-item-soon" data-chapter="${chapter.num}" disabled>${content}<span class="testing-start">În curând</span></button></div>`;
   return `<div class="testing-chapter-row is-unstarted"><a class="lab-item lab-item-done" id="testing-quiz-${chapter.num}" data-chapter="${chapter.num}" href="${escape(quiz.url)}">${content}<span class="testing-start">Rezolvă <span aria-hidden="true">↗</span></span></a><div class="testing-row-progress"><span class="testing-unstarted">Se încarcă progresul…</span></div><a class="testing-stats-link" id="testing-stats-${chapter.num}" href="statistici.html?capitol=${chapter.num}" aria-label="Statistici: ${escape(chapter.name)}">Statistici <span aria-hidden="true">→</span></a></div>`;
  }).join('');
  return `<section class="testing-category" aria-labelledby="testing-category-${groupNumber}"><div class="testing-category-head"><span>${String(groupNumber).padStart(2,'0')}</span><h3 id="testing-category-${groupNumber}">${escape(category)}</h3></div>${rows}</section>`;
 }).join('');
 return replaceElements(source,'lab-bento-grid',node=>node.open+'\n'+html+'\n    </'+node.tag+'>');
}

function catalog(source,registry,quizzes,testing) {
 if(testing) source=testingCatalog(source,registry,quizzes);
 const byNumber=new Map(registry.CHAPTERS.map(c=>[c.num,c]));
 source=replaceElements(source,'lab-bento-cat',group=>{
   const numbers=elements(group.body,'lab-item').map(node=>Number(node.body.match(/class="lab-item-num"[^>]*>(\d+)/)?.[1]));
   const records=numbers.map(n=>byNumber.get(n));
   if(records.some(c=>!c)) throw new Error('Catalog contains an unregistered chapter');
   const available=records.filter(c=>c.done&&c.url&&(!testing||quizzes.some(q=>q.chapterNum===c.num))).length;
   let body=inner(group.body,'lab-bento-cat-ring-inner',`${available} din ${records.length} ${testing?(records.length===1?'test disponibil':'teste disponibile'):'lecții disponibile'}`);
   body=replaceElements(body,'lab-item',node=>{
     const num=Number(node.body.match(/class="lab-item-num"[^>]*>(\d+)/)?.[1]);
     const chapter=byNumber.get(num), quiz=quizzes.find(q=>q.chapterNum===num);
     const published=chapter.done&&chapter.url&&(!testing||quiz);
     let content=inner(node.body,'lab-item-title',escape(chapter.name));
     if(testing) content=inner(content,'lab-item-tags',published?`${quiz.questions.length} de grile`:'Test în pregătire');
     const status=testing?(published?'Rezolvă':'În curând'):(published?'Disponibil':'În pregătire');
     for(const name of ['lab-item-done-mark','lab-item-soon-mark']) content=replaceElements(content,name,n=>`<${n.tag} class="${published?'lab-item-done-mark':'lab-item-soon-mark'}">${status}</${n.tag}>`);
     let opening=node.open.replace(/^<\w+/,published?'<a':'<button').replace(/\s(?:href|type|disabled)(?:="[^"]*")?/g,'').replace(/lab-item-(?:done|soon)(?=[\s"])/,published?'lab-item-done':'lab-item-soon');
     opening=opening.replace(/>$/,published?` href="${escape(testing?quiz.url:chapter.url)}">`:' type="button" disabled>');
     return opening+content+(published?'</a>':'</button>');
   });
   return group.open+body+`</${group.tag}>`;
 });
 if(testing) source=source.replace(/(<span\b[^>]*id="lab-testing-count"[^>]*>)[\s\S]*?(<\/span>)/,`$1${quizzes.length} seturi disponibile · ${quizzes.reduce((n,q)=>n+q.questions.length,0)} de grile$2`);
 return source;
}

export function renderPublicMetadata(source,file,registry,quizIndex) {
 const {chapters,resources}=publishedResources(registry);
 const urls=new Set(resources.filter(r=>r.kind==='quiz').map(r=>r.url));
 const quizzes=quizIndex.filter(q=>urls.has(q.url));
 const year=registry.BIO_SITE.admissionYear;
 if(!Number.isInteger(year)) throw new Error('BIO_SITE.admissionYear must identify the intended admission year');
 const chapter=chapters.find(c=>c.url===file),quiz=quizzes.find(q=>q.url===file);
 let description;
 if(file==='index.html') description=`Biologie pentru admiterea la UMF Cluj ${year}: ${chapters.length} lecții publicate, ${quizzes.length} seturi și ${quizzes.reduce((n,q)=>n+q.questions.length,0)} de grile. Acces gratuit.`;
 else if(file==='testare.html') description=`${quizzes.length} seturi cu ${quizzes.reduce((n,q)=>n+q.questions.length,0)} de grile de biologie pentru UMF Cluj ${year}, cu verificare și explicații. Acces gratuit.`;
 else if(file==='simulare.html') description=`Antrenament de biologie cu 35 de întrebări și notă orientativă. Formula detaliată de admitere pentru ${year} nu este confirmată.`;
 else if(chapter) description=`${chapter.name}: lecție de biologie pentru pregătirea admiterii la UMF Cluj ${year}, după manualul Barron’s. Acces gratuit.`;
 else if(quiz) description=`${quiz.questions.length} de grile pentru ${quiz.name}, cu baremul cărții și explicații pentru fiecare variantă. Pregătire UMF Cluj ${year}.`;
 if(description) {
   source=metadata(source,'name','description',description);
   source=metadata(source,'property','og:description',description);
 }
 if(file==='index.html'||file==='testare.html') source=catalog(source,registry,quizzes,file==='testare.html');
 return source;
}
