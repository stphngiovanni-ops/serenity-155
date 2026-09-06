
(function(){
  const intro=document.getElementById('v20Intro');
  if(intro){
    const seen=sessionStorage.getItem('nkjV20IntroSeen');
    if(seen){intro.remove();}
    else{
      sessionStorage.setItem('nkjV20IntroSeen','1');
      const close=()=>{intro.classList.add('hide');setTimeout(()=>intro.remove(),700)};
      document.getElementById('v20Skip')?.addEventListener('click',close);
      setTimeout(close,2600);
    }
  }

  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')});
  },{threshold:.12});
  document.querySelectorAll('.v20-reveal').forEach(el=>io.observe(el));

  const menu=document.getElementById('v20Menu');
  const nav=document.getElementById('v20Nav');
  menu?.addEventListener('click',()=>nav?.classList.toggle('open'));

  const tilt=(el,e)=>{
    const r=el.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    el.style.transform=`perspective(900px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg) translateY(-4px)`;
  };
  document.querySelectorAll('.v20-feature').forEach(el=>{
    el.addEventListener('mousemove',e=>tilt(el,e));
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });

  const updateOnline=()=>{
    const dot=document.getElementById('v20CloudDot');
    const txt=document.getElementById('v20CloudText');
    if(!dot||!txt)return;
    if(navigator.onLine){dot.classList.add('online');txt.textContent='SYSTEM ONLINE'}
    else{dot.classList.remove('online');txt.textContent='OFFLINE MODE'}
  };
  window.addEventListener('online',updateOnline);
  window.addEventListener('offline',updateOnline);
  updateOnline();
})();
