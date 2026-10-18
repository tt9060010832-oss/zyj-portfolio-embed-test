(() => {
  'use strict';
  const works = window.PORTFOLIO_WORKS;
  const grid = document.querySelector('#works-grid');
  const dialog = document.querySelector('#player-modal');
  const video = document.querySelector('#player');
  const label = {ai:'AI作品',shoot:'摄像作品',all:'全部作品'};
  let currentCategory = 'ai';
  let currentWork = null;
  let lastFocused = null;
  function render(category) {
    currentCategory = category;
    grid.classList.toggle('portrait-grid',category === 'shoot');
    const filtered = category === 'all' ? works : works.filter(w => w.category === category);
    grid.replaceChildren(...filtered.map((work, index) => {
      const card = document.createElement('article');
      card.className = 'work-card';
      if(work.category === 'shoot') card.classList.add('portrait-card');
      card.style.animationDelay = `${Math.min(index,5)*45}ms`;
      const button = document.createElement('button');
      button.className = 'work-open';
      button.setAttribute('aria-label',`播放${label[work.category]}：${work.title}，时长${work.duration}`);
      const image = document.createElement('div');
      image.className = 'work-image';
      const img = document.createElement('img');
      img.src = work.poster;
      img.alt = `${work.title}视频封面`;
      img.loading = index < 2 ? 'eager' : 'lazy';
      img.width = 1280; img.height = 720;
      image.append(img);
      for (const [cls,text] of [['card-category',label[work.category]],['card-play','▶'],['card-duration',work.duration]]) {
        const el = document.createElement('span');el.className = cls;el.textContent = text;image.append(el);
      }
      const info = document.createElement('div');info.className = 'card-info';
      const titles = document.createElement('div');
      const title = document.createElement('h3');title.textContent = work.title;
      const sub = document.createElement('p');sub.className = 'card-subtitle';
      sub.textContent = `${work.category === 'ai' ? 'AI GENERATED' : 'CINEMATOGRAPHY'} / ${work.width} × ${work.height}`;
      titles.append(title,sub);
      const arrow = document.createElement('span');arrow.className='card-arrow';arrow.textContent='↗';
      info.append(titles,arrow);button.append(image,info);card.append(button);
      button.addEventListener('click',()=>openWork(work));
      return card;
    }));
    document.querySelectorAll('[data-filter]').forEach(button=>{
      const active = button.dataset.filter === category;
      button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
    });
    document.querySelectorAll('[data-category]').forEach(a=>a.classList.toggle('is-active',a.dataset.category===category));
    document.querySelector('#archive-count').textContent = `${String(filtered.length).padStart(2,'0')} 部作品 / ${category==='ai'?'AI GENERATED':category==='shoot'?'CINEMATOGRAPHY':'COMPLETE ARCHIVE'}`;
    document.querySelector('#archive-end-label').textContent = `以上为全部 ${filtered.length} 部${label[category]}`;
  }
  function openWork(work) {
    if (!dialog.open) lastFocused = document.activeElement;
    currentWork = work;
    dialog.classList.toggle('portrait-player',work.category === 'shoot');
    document.querySelector('#player-title').textContent = work.title;
    document.querySelector('#player-category').textContent = label[work.category];
    document.querySelector('#player-code').textContent = `ZYJ / ${work.id.toUpperCase()}`;
    document.querySelector('#player-meta').textContent = `${work.width} × ${work.height} · ${work.fps} FPS · ${work.duration}`;
    const group = currentCategory === 'all' ? works : works.filter(w=>w.category===currentCategory);
    const inGroup = group.indexOf(work);
    document.querySelector('#player-counter').textContent = `${String(inGroup<0?1:inGroup+1).padStart(2,'0')} / ${String(inGroup<0?works.length:group.length).padStart(2,'0')}`;
    document.querySelector('#player-error').hidden = true;
    document.querySelector('#video-direct').href = work.src;
    video.src = work.src;video.poster = work.poster;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('player-open');
    video.play().catch(()=>{});
  }
  function closeWork(){dialog.close();}
  function step(direction){
    let group = currentCategory === 'all' ? works : works.filter(w=>w.category===currentCategory);
    if (!group.includes(currentWork)) group = works;
    openWork(group[(group.indexOf(currentWork)+direction+group.length)%group.length]);
  }
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.filter)));
  document.querySelectorAll('[data-category]').forEach(a=>a.addEventListener('click',()=>render(a.dataset.category)));
  document.querySelectorAll('[data-work]').forEach(b=>b.addEventListener('click',()=>openWork(works.find(w=>w.id===b.dataset.work))));
  document.querySelector('#close-player').addEventListener('click',closeWork);
  document.querySelector('#prev-work').addEventListener('click',()=>step(-1));
  document.querySelector('#next-work').addEventListener('click',()=>step(1));
  dialog.addEventListener('close',()=>{video.pause();video.removeAttribute('src');video.load();document.body.classList.remove('player-open');lastFocused?.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeWork();}});
  video.addEventListener('error',()=>{if(dialog.open&&video.hasAttribute('src'))document.querySelector('#player-error').hidden=false;});
  document.querySelector('#copy-name').addEventListener('click',async()=>{
    const name='张永杰';
    try {
      if(navigator.clipboard&&window.isSecureContext) await navigator.clipboard.writeText(name);
      else {const field=document.createElement('textarea');field.value=name;field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();const copied=document.execCommand('copy');field.remove();if(!copied)throw new Error('copy');}
      document.querySelector('#copy-status').textContent='姓名已复制';
    } catch {document.querySelector('#copy-status').textContent=`姓名：${name}`;}
  });
  render('ai');
})();
