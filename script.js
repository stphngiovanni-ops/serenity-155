const menuBtn = document.getElementById('menuBtn');
const mainNav = document.getElementById('mainNav');

menuBtn.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const cursorGlow = document.getElementById('cursorGlow');
window.addEventListener('pointermove', e => {
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
});

document.getElementById('year').textContent = new Date().getFullYear();

/*
  UBAH TANGGAL MATCH DI BAWAH INI.
  Format: YYYY-MM-DDTHH:MM:SS+07:00
  Contoh: 2026-09-12T20:00:00+07:00
*/
const matchDate = new Date('2026-09-12T20:00:00+07:00');
const countdown = document.getElementById('countdown');
const matchDateLabel = document.getElementById('matchDateLabel');

if (!isNaN(matchDate)) {
  matchDateLabel.textContent = new Intl.DateTimeFormat('id-ID', {
    day:'2-digit', month:'long', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  }).format(matchDate) + ' WIB';

  const tick = () => {
    const diff = matchDate - new Date();
    if (diff <= 0) {
      countdown.textContent = 'MATCH TIME';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    const m = Math.floor(diff / 60000) % 60;
    const s = Math.floor(diff / 1000) % 60;
    countdown.textContent = `${String(d).padStart(2,'0')}D : ${String(h).padStart(2,'0')}H : ${String(m).padStart(2,'0')}M : ${String(s).padStart(2,'0')}S`;
  };
  tick();
  setInterval(tick, 1000);
}

(function createEsportsParticles(){const wrap=document.getElementById("bgParticles");if(!wrap)return;const count=window.innerWidth<700?20:42;for(let i=0;i<count;i++){const p=document.createElement("i");p.className="bg-particle"+(i%5===0?" pink":"");p.style.left=(Math.random()*100)+"%";p.style.top=(Math.random()*100)+"%";p.style.animationDuration=(8+Math.random()*12)+"s";p.style.animationDelay=(-Math.random()*16)+"s";p.style.opacity=(.15+Math.random()*.5).toFixed(2);wrap.appendChild(p)}})();
(function esportsParallax(){if(window.matchMedia("(pointer: coarse)").matches)return;const logo=document.querySelector(".hero-logo-wrap"),copy=document.querySelector(".hero-copy");window.addEventListener("pointermove",e=>{const x=e.clientX/window.innerWidth-.5,y=e.clientY/window.innerHeight-.5;if(logo)logo.style.transform=`translate3d(${x*12}px,${y*8}px,0)`;if(copy)copy.style.transform=`translate3d(${x*-5}px,${y*-3}px,0)`},{passive:true})})();
