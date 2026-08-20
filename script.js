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

// ===== V10.8.1 BACKGROUND MUSIC FIX =====
(function serenityMusic(){
  const audio = document.getElementById("serenityBgMusic");
  const toggle = document.getElementById("musicToggle");
  const label = document.getElementById("musicLabel");
  const icon = document.getElementById("musicIcon");
  const volume = document.getElementById("musicVolume");
  if (!audio || !toggle) return;

  const savedVolume = Number(localStorage.getItem("serenityMusicVolume") || 30);
  audio.volume = Math.max(0, Math.min(1, savedVolume / 100));
  if (volume) volume.value = String(savedVolume);

  function paint(){
    const playing = !audio.paused;
    label.textContent = playing ? "MUSIC OFF" : "MUSIC ON";
    icon.textContent = playing ? "♫" : "♪";
    toggle.classList.toggle("is-playing", playing);
  }

  async function playMusic(){
    try {
      await audio.play();
      localStorage.setItem("serenityMusicMuted", "0");
      paint();
    } catch (err) {
      console.warn("Music play blocked:", err);
      paint();
    }
  }

  // First interaction anywhere OUTSIDE the music control starts the music.
  const firstInteraction = async (e) => {
    if (e.target && e.target.closest && e.target.closest("#musicControl")) return;
    if (localStorage.getItem("serenityMusicMuted") !== "1") {
      await playMusic();
    }
    document.removeEventListener("click", firstInteraction);
    document.removeEventListener("touchend", firstInteraction);
  };
  document.addEventListener("click", firstInteraction);
  document.addEventListener("touchend", firstInteraction, {passive:true});

  // Music button works independently; no pointerdown/click race.
  toggle.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (audio.paused) {
      await playMusic();
    } else {
      audio.pause();
      localStorage.setItem("serenityMusicMuted", "1");
      paint();
    }
  });

  if (volume) {
    volume.addEventListener("input", async () => {
      const v = Number(volume.value);
      audio.volume = v / 100;
      localStorage.setItem("serenityMusicVolume", String(v));
      if (v > 0 && audio.paused && localStorage.getItem("serenityMusicMuted") !== "1") {
        await playMusic();
      }
      paint();
    });
  }

  audio.addEventListener("play", paint);
  audio.addEventListener("pause", paint);
  audio.addEventListener("error", () => {
    label.textContent = "AUDIO ERROR";
    console.error("Audio failed to load:", audio.error);
  });

  paint();
})();
