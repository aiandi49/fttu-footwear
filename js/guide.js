(function(){
  var F=window.FTTU, root=document.documentElement;
  var TODAY_SEASON=F.seasonFor(new Date());
  var season=TODAY_SEASON;
  var SW={ core:'#2a9d9a', spring:'#f0a7c4', summer:'#f2c230', fall:'#c0602f', winter:'#2d5b8c', 'ice-blue':'#bfe3f2' };
  var BAND={ winter:'linear-gradient(90deg,#1d4f7c,#9cc3e6)', spring:'linear-gradient(90deg,#c85a80,#7d45a5,#6fbf98)', summer:'linear-gradient(90deg,#b3441a,#f2c230)', fall:'linear-gradient(90deg,#a8481f,#d99a2b,#5f6f2e)' };
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  /* ── holidays: a small decorative note, nothing for sale ── */
  function holidayFor(d){
    var m=d.getMonth(), day=d.getDate(), y=d.getFullYear();
    if(m===9 && day>=24) return 'Happy Halloween';
    if(m===10){ var first=new Date(y,10,1).getDay(); var thx=1+((4-first+7)%7)+21; if(day>=thx-6 && day<=thx) return 'Happy Thanksgiving'; }
    if(m===11) return 'Happy holidays';
    if(m===0 && day<=3) return 'Happy New Year';
    if(m===1 && day>=7 && day<=14) return 'Happy Valentine\u2019s Day';
    if(m===6 && day<=4) return 'Happy Fourth of July';
    return '';
  }

  /* ── seasonal ornaments ── */
  var SHAPES={
    fall:['<svg viewBox="0 0 24 24"><path fill="#c0602f" d="M12 2l2 5 5-2-2 5 5 2-6 2 1 5-5-3-5 3 1-5-6-2 5-2-2-5 5 2z"/></svg>','<svg viewBox="0 0 24 24"><path fill="#d99a2b" d="M12 2c5 3 7 8 4 14-1 2-3 4-4 6-1-2-3-4-4-6-3-6-1-11 4-14z"/></svg>','<svg viewBox="0 0 24 24"><path fill="#7a3a1a" d="M12 3c4 2 6 6 4 11-1 3-3 5-4 7-1-2-3-4-4-7-2-5 0-9 4-11z"/></svg>'],
    winter:['<svg viewBox="0 0 24 24" fill="none" stroke="#6d93bd" stroke-width="1.6" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M12 5l-2-2M12 5l2-2M12 19l-2 2M12 19l2 2"/></svg>','<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#b8d3ec"/></svg>'],
    spring:['<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="5" ry="9" fill="#f0a7c4"/></svg>','<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="4" ry="8" fill="#d8b7ee"/></svg>','<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="4" ry="7" fill="#a9dcc2"/></svg>'],
    summer:['<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="#f5c451"/></svg>','<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="#f39a62"/></svg>']
  };
  function ornaments(s){
    var box=$('ornaments'); box.innerHTML='';
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(s==='summer'){ var sun=document.createElement('div'); sun.className='sun'; box.appendChild(sun); }
    var shapes=SHAPES[s], n=s==='summer'?10:16;
    for(var i=0;i<n;i++){
      var o=document.createElement('span'); o.className='orn';
      var size=10+Math.round(Math.random()*16);
      o.style.width=size+'px'; o.style.height=size+'px';
      o.style.left=(Math.random()*100)+'%';
      if(s==='summer'){ o.style.top=(10+Math.random()*80)+'%'; o.style.animationDuration=(4+Math.random()*5)+'s'; }
      else { o.style.animationDuration=(12+Math.random()*14)+'s'; }
      o.style.animationDelay=(-Math.random()*20)+'s';
      o.innerHTML=shapes[i%shapes.length];
      box.appendChild(o);
    }
  }

  /* ── hero ── */
  function renderHero(s){
    var info=F.SEASON_INFO[s];
    $('seasonBadge').textContent=info.label+' collection · '+info.months;
    var h=holidayFor(new Date()), hol=$('holiday');
    if(h && s===TODAY_SEASON){ hol.textContent='· '+h; hol.hidden=false; } else hol.hidden=true;
    var lead=F.leadFor('sneakers',s);
    $('heroImg').src=lead.image; $('heroImg').alt=lead.name+', concept render';
    $('heroName').textContent=lead.name;
    $('colLede').textContent='Each card opens on the '+info.label.toLowerCase()+' colorway when there is one. Tap a color to swap it.';
  }

  /* ── collection ── */
  var cats=F.CATEGORIES.filter(function(c){ return c.key!=='apparel'; });
  function renderFilters(){
    var box=$('filters'); box.innerHTML='';
    [{key:'all',label:'All'}].concat(cats).forEach(function(c,i){
      var b=document.createElement('button'); b.type='button'; b.className='chip'; b.textContent=c.label;
      b.setAttribute('aria-pressed',String(i===0));
      b.addEventListener('click',function(){
        box.querySelectorAll('.chip').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
        b.setAttribute('aria-pressed','true');
        document.querySelectorAll('.cat').forEach(function(card){ card.hidden = !(c.key==='all' || card.dataset.cat===c.key); });
      });
      box.appendChild(b);
    });
  }
  function setCard(card, d){
    card.querySelector('img').src=d.image;
    card.querySelector('img').alt=d.name+', concept render';
    card.querySelector('.cw').textContent=d.colorwayLabel+(d.season===TODAY_SEASON?' · in season now':'');
    card.querySelector('.desc').textContent=d.description;
    card.querySelectorAll('.sw').forEach(function(s){ s.setAttribute('aria-pressed',String(s.dataset.id===d.id)); });
    card.querySelector('.ask').href='index.html?q='+encodeURIComponent('Tell me about the '+d.colorwayLabel.toLowerCase()+' '+d.one.replace(/\u2019/g,"'").toLowerCase());
  }
  function renderGrid(s){
    var grid=$('grid'); grid.innerHTML='';
    cats.forEach(function(c){
      var list=F.inCategory(c.key), lead=F.leadFor(c.key,s);
      var card=document.createElement('article'); card.className='cat'; card.id='cat-'+c.key; card.dataset.cat=c.key;
      var sw=list.map(function(d){
        return '<button type="button" class="sw" data-id="'+d.id+'" aria-label="'+esc(d.colorwayLabel)+' colorway"><i style="background:'+SW[d.colorway]+'"></i>'+esc(d.colorwayLabel)+(d.season===TODAY_SEASON?' <span class="now">now</span>':'')+'</button>';
      }).join('');
      card.innerHTML='<div class="ratio" title="View larger"><img alt="" width="1264" height="848" loading="lazy" decoding="async"></div>'+
        '<div class="cat-body"><span class="kicker">'+list.length+(list.length===1?' colorway':' colorways')+'</span><h3>'+esc(c.label)+'</h3>'+
        '<span class="cw"></span><p class="desc"></p><div class="swatches" role="group" aria-label="'+esc(c.label)+' colorways">'+sw+'</div>'+
        '<a class="ask" href="index.html">Ask the showroom about it &rarr;</a></div>';
      grid.appendChild(card);
      setCard(card, lead);
      card.querySelectorAll('.sw').forEach(function(b){ b.addEventListener('click',function(){ setCard(card, F.byId(b.dataset.id)); }); });
      card.querySelector('.ratio').addEventListener('click',function(){
        var cur=card.querySelector('.sw[aria-pressed="true"]'), items=list.map(function(d){ return {src:d.image, title:d.name, caption:d.categoryLabel+' \u00b7 '+d.colorwayLabel+' colorway \u00b7 concept render', alt:d.name+', concept render'}; });
        Lightbox.open(items, Math.max(0, list.map(function(d){return d.id;}).indexOf(cur && cur.dataset.id)));
      });
    });
  }

  /* ── seasons ── */
  function renderSeasons(s){
    var box=$('seasonCards'); box.innerHTML='';
    ['winter','spring','summer','fall'].forEach(function(k){
      var info=F.SEASON_INFO[k], items=F.DESIGNS.filter(function(d){return d.season===k;});
      var el=document.createElement('div'); el.className='season'+(k===TODAY_SEASON?' is-now':'');
      el.innerHTML='<div class="band" style="background:'+BAND[k]+'"></div>'+(k===TODAY_SEASON?'<span class="now-tag">Now</span>':'')+
        '<h3>'+info.label+'</h3><div class="months">'+info.months+'</div>'+
        '<p>'+info.start+' to '+info.end+'. '+items.length+' designs wear '+info.label.toLowerCase()+' colors.</p>'+
        '<div class="mini-thumbs">'+items.map(function(d,n){ return '<img src="'+esc(d.image)+'" alt="'+esc(d.name)+'" data-season="'+k+'" data-k="'+n+'" width="48" height="48" loading="lazy" decoding="async" title="View full size">'; }).join('')+'</div>'+
        '<div class="preview"><button type="button" data-season="'+k+'" aria-pressed="'+String(k===s)+'">'+(k===TODAY_SEASON?'Today\u2019s look':'Preview this look')+'</button></div>';
      box.appendChild(el);
    });
    box.querySelectorAll('.preview button').forEach(function(b){ b.addEventListener('click',function(){ setSeason(b.dataset.season); }); });
  }

  function setSeason(s){
    season=s; root.setAttribute('data-season',s);
    renderHero(s); renderGrid(s); renderSeasons(s); ornaments(s);
    var bar=$('previewBar');
    if(s!==TODAY_SEASON){ $('previewText').textContent='Previewing the '+F.SEASON_INFO[s].label.toLowerCase()+' look'; bar.classList.add('show'); }
    else bar.classList.remove('show');
  }
  $('previewReset').addEventListener('click',function(){ setSeason(TODAY_SEASON); });

  /* ── apparel ── */
  $('jacketImg').src=F.inCategory('apparel')[0].image;
  var mockItems=F.lookbook().filter(function(x){ return x.group==='mockups'; });
  $('mocks').innerHTML=mockItems.map(function(m,k){ return '<button type="button" class="mock" data-k="'+k+'" aria-label="View larger: '+esc(m.alt)+'"><img src="'+esc(m.src)+'" alt="'+esc(m.alt)+'" width="'+m.w+'" height="'+m.h+'" loading="lazy" decoding="async"></button>'; }).join('');
  $('mocks').querySelectorAll('.mock').forEach(function(b){ b.addEventListener('click',function(){ Lightbox.open(mockItems, +b.dataset.k); }); });
  var jacket=F.inCategory('apparel')[0];
  $('jacketImg').classList.add('zoomable');
  $('jacketImg').addEventListener('click',function(){ Lightbox.open([{src:jacket.image, title:jacket.name, caption:'Apparel \u00b7 concept render', alt:jacket.name}],0); });

  /* ── lookbook: every image, big, in a swipeable carousel ── */
  var ALL=F.lookbook(), shown=ALL, active=0;
  var track=$('track'), strip=$('thumbstrip');
  var GROUPS=[{key:'all',label:'Everything'},{key:'brand',label:'Emblem'}].concat(F.CATEGORIES.map(function(c){ return {key:c.key,label:c.label}; })).concat([{key:'mockups',label:'Worn'}]);
  $('lookTotal').textContent=ALL.length;
  function buildLook(list){
    shown=list; active=0;
    track.innerHTML=list.map(function(it,k){
      return '<figure class="slide" data-k="'+k+'"><button type="button" class="slide-btn" aria-label="View full screen: '+esc(it.title)+'">'+
        '<img src="'+esc(it.src)+'" alt="'+esc(it.alt||it.title)+'" width="'+it.w+'" height="'+it.h+'"'+(k<3?'':' loading="lazy"')+' decoding="async"></button></figure>';
    }).join('');
    strip.innerHTML=list.map(function(it,k){
      return '<button type="button" data-k="'+k+'" aria-label="Show image '+(k+1)+': '+esc(it.title)+'"><img src="'+esc(it.src)+'" alt="" loading="lazy" decoding="async"></button>';
    }).join('');
    track.querySelectorAll('.slide-btn').forEach(function(b,k){ b.addEventListener('click',function(){ Lightbox.open(shown,k); }); });
    strip.querySelectorAll('button').forEach(function(b){ b.addEventListener('click',function(){ goTo(+b.dataset.k); }); });
    track.scrollLeft=0;
    mark(0);
  }
  function slideLeft(k){ var sl=track.children[k]; return sl.offsetLeft-(track.clientWidth-sl.offsetWidth)/2; }
  function goTo(k){ k=Math.max(0,Math.min(shown.length-1,k)); track.scrollTo({left:slideLeft(k), behavior:'smooth'}); mark(k); }
  function mark(k){
    active=k; var it=shown[k]; if(!it) return;
    $('carTitle').textContent=it.title; $('carCaption').textContent=it.caption;
    $('carCount').textContent=(k+1)+' / '+shown.length;
    $('carBar').style.width=((k+1)/shown.length*100)+'%';
    $('carPrev').disabled=k===0; $('carNext').disabled=k===shown.length-1;
    Array.prototype.forEach.call(track.children,function(sl,n){ sl.classList.toggle('is-active',n===k); });
    strip.querySelectorAll('button').forEach(function(b,n){ b.setAttribute('aria-current',String(n===k)); });
    var tb=strip.children[k];
    if(tb){ var want=tb.offsetLeft-(strip.clientWidth-tb.offsetWidth)/2; strip.scrollTo({left:want, behavior:'smooth'}); }
  }
  var ticking=false;
  track.addEventListener('scroll',function(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      var max=track.scrollWidth-track.clientWidth, best=0;
      if(track.scrollLeft<=2) best=0;                                  // at the very start the first slide can't reach the center
      else if(track.scrollLeft>=max-2) best=track.children.length-1;   // same at the very end
      else {
        var center=track.scrollLeft+track.clientWidth/2, bestD=Infinity;
        Array.prototype.forEach.call(track.children,function(sl,n){ var d=Math.abs(sl.offsetLeft+sl.offsetWidth/2-center); if(d<bestD){ bestD=d; best=n; } });
      }
      if(best!==active) mark(best);
    });
  },{passive:true});
  $('carPrev').addEventListener('click',function(){ goTo(active-1); });
  $('carNext').addEventListener('click',function(){ goTo(active+1); });
  track.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){ e.preventDefault(); goTo(active+1); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); goTo(active-1); }
    else if(e.key==='Enter'){ Lightbox.open(shown,active); }
  });
  (function(){
    var box=$('lookFilters');
    GROUPS.forEach(function(g,n){
      var count=g.key==='all'?ALL.length:ALL.filter(function(x){return x.group===g.key;}).length;
      if(!count) return;
      var b=document.createElement('button'); b.type='button'; b.className='chip';
      b.textContent=g.label+' ('+count+')'; b.setAttribute('aria-pressed',String(n===0));
      b.addEventListener('click',function(){
        box.querySelectorAll('.chip').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
        b.setAttribute('aria-pressed','true');
        buildLook(g.key==='all'?ALL:ALL.filter(function(x){return x.group===g.key;}));
      });
      box.appendChild(b);
    });
  })();
  buildLook(ALL);

  /* ── every picture opens full size ── */
  function asItems(list){ return list.map(function(d){ return {src:d.image, title:d.name, caption:d.categoryLabel+' \u00b7 '+d.colorwayLabel+' colorway \u00b7 concept render', alt:d.name+', concept render'}; }); }
  function onActivate(el, fn){ el.addEventListener('click',fn); el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); fn(); } }); }
  onActivate($('heroFig'), function(){ var list=F.inCategory('sneakers'), lead=F.leadFor('sneakers',season); Lightbox.open(asItems(list), list.indexOf(lead)); });
  $('emblemImg').src=F.EMBLEM.image;
  onActivate($('emblemFig'), function(){ Lightbox.open([{src:F.EMBLEM.image, title:F.EMBLEM.title, caption:F.EMBLEM.caption, alt:'F.T.U. shield emblem'}],0); });
  $('seasonCards').addEventListener('click',function(e){
    var im=e.target.closest('.mini-thumbs img'); if(!im) return;
    var k=im.getAttribute('data-season'), list=F.DESIGNS.filter(function(d){ return d.season===k; });
    Lightbox.open(asItems(list), +im.getAttribute('data-k'));
  });

  renderFilters();
  setSeason(TODAY_SEASON);
})();
