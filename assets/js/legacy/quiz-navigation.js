const pages=Array.from(document.querySelectorAll('.page-section[id^="page-"]'),section=>section.id.slice(5));
const quizDefaultRoute=document.querySelector('.page-section.active').id.slice(5);
function closeNav(){document.getElementById('sidenav').classList.remove('open');document.getElementById('nav-overlay').classList.remove('open')}
function goto(page){if(!pages.includes(page))page=quizDefaultRoute;document.querySelectorAll('.page-section').forEach(s=>s.classList.remove('active'));document.getElementById('page-'+page)?.classList.add('active');document.querySelectorAll('#sidenav a[onclick]').forEach(a=>a.classList.toggle('active',(a.getAttribute('onclick')||'').includes("'"+page+"'")));closeNav();if(location.hash.slice(1)!==page)history.replaceState(null,'','#'+page);window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
addEventListener('scroll',()=>{document.getElementById('top').style.display=scrollY>500?'flex':'none'});
function handleHash(){const initial=location.hash.slice(1);if(pages.includes(initial))goto(initial);else if(initial)goto(quizDefaultRoute)}
addEventListener('DOMContentLoaded',handleHash);
addEventListener('hashchange',handleHash);
