/* Showroom behavior. Theme, text size and the phone menu live inline in index.html. */
const F = window.FTTU;
const SEASON = F.seasonFor(new Date());
const SEASON_LABEL = F.SEASON_INFO[SEASON].label;
const YEAR = new Date().getFullYear();
const SEASON_DOT = { core:'#2a9d9a', spring:'#e8a0c8', summer:'#f2c230', fall:'#c0602f', winter:'#3b6ea5', 'ice-blue':'#bfe3f2' };

document.getElementById('heroTag').textContent = 'Concept collection · ' + SEASON_LABEL + ' ' + YEAR;

const CATALOG_TEXT = F.DESIGNS.map(function(d){
  return d.id + ' | ' + d.categoryLabel + ' | ' + d.colorwayLabel + (d.season===SEASON?' (in season now)':'') + ' | ' + d.description;
}).join('\n');

const SYSTEM_PROMPT = [
  "You are the warm, concise showroom guide for F.T.T.U Footwear (From Them... to Us...), a new footwear line that is still at the concept stage.",
  "Everything you know about the line is the catalog below. Never invent a design, color, material, feature, size, price, release date or store. Every image is an AI-generated concept render; nothing has been manufactured or is for sale yet, and there are no sizes or prices. If asked to buy or for a size, say so plainly and warmly, and offer to show designs instead.",
  "The line is organized by category and by season. Most footwear comes in a Core colorway (the signature seafoam-to-teal look) plus Spring, Summer, Fall and Winter colorways. Some categories only have Core so far. Apparel (the track jacket) is the start of a clothing line planned for later. Ladies' and men's versions and sizes are planned for later phases; don't promise dates.",
  "The emblem: " + F.EMBLEM.story + " If someone asks about the logo, explain it in a sentence or two and show it by adding the line MATCH: EMBLEM.",
  "What the name means — share this only when someone asks what F.T.T.U, the name or the logo means: 'Them' is big business and government, whose decisions too often squeeze everyday people and small businesses. 'Us' is the regular, hard-working people who make every country run; without them there would be no government or big business. F.T.T.U is for all of them, whoever they are. Keep it to one or two warm, confident sentences, then get back to the shoes. Don't name specific companies, politicians, parties or policies, and don't argue politics; if pressed, say the line lets the shoes do the talking.",
  "Today is " + new Date().toDateString() + ". The current season is " + SEASON_LABEL + " (meteorological seasons: winter Dec-Feb, spring Mar-May, summer Jun-Aug, fall Sep-Nov).",
  "",
  "CATALOG (id | category | colorway | description):",
  CATALOG_TEXT,
  "",
  "Have a natural back-and-forth conversation. If a request is too broad to pick well (for example 'show me shoes'), ask ONE short, specific question at a time — like which category, or which season's colors — never a checklist.",
  "When you have enough, show the design(s): name each one, say in one or two warm, plain sentences why it fits, and suggest one next step (another colorway, a related category, or the guide page for the full collection). You can show up to 6 designs when someone asks for a set, like 'everything for fall' or 'all the sneakers'.",
  "Keep replies short and chat-length. Never use markdown formatting; plain conversational text only. Don't paste image links; the page shows the pictures for you.",
  "Whenever you show designs, end the reply with one extra line per design, best fit first, exactly in this form: MATCH: <design id from the catalog>. Never add MATCH lines when you're only asking a question."
].join("\n");

/* ── state (kept for this browser session only) ── */
const STORE_KEY = 'fttu-footwear-showroom';
let conversation = [];
let messageCount = 0;
let current = { top: null, list: null };

const $ = function(id){ return document.getElementById(id); };
const messagesEl=$('messages'), input=$('chatInput'), sendBtn=$('sendBtn'), micBtn=$('micBtn');

function save(){
  try{ sessionStorage.setItem(STORE_KEY, JSON.stringify({ conversation:conversation, count:messageCount, top: current.featured ? null : (current.top && current.top.id), list: current.featured ? null : current.list && current.list.map(function(d){return d.id;}) })); }catch(e){}
}
function setStatus(state){ $('countChip').className='count-chip'+(state?' '+state:''); }
function setCount(n){ messageCount=n; $('countLabel').textContent = n + (n===1?' message':' messages') + ' this session'; }

function esc(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function linkify(t){
  return t.replace(/(https?:\/\/[^\s<]+)/g,function(url){
    var m=url.match(/[.,;:!?)\]]+$/), trail='', clean=url;
    if(m){ trail=m[0]; clean=url.slice(0,-trail.length); }
    return '<a href="'+clean+'" target="_blank" rel="noopener noreferrer">'+clean+'</a>'+trail;
  });
}
function shotHTML(d, eager){
  return '<div class="shot"><img src="'+esc(d.image)+'" alt="'+esc(d.name)+' — concept render" width="1264" height="848" decoding="async"'+(eager?'':' loading="lazy"')+'></div>';
}
function addMsg(role,text,extra,designs,withEmblem){
  var d=document.createElement('div');
  d.className='msg '+role+(extra?' '+extra:'');
  if(extra==='thinking') d.innerHTML='<span class="spin"></span> Thinking…';
  else if(role==='assistant') d.innerHTML=linkify(esc(text));
  else d.textContent=text;
  var pics=(designs||[]).slice(0,6).map(function(x){ return {design:x, src:x.image, title:x.name, caption:x.categoryLabel+' \u00b7 '+x.colorwayLabel+' colorway \u00b7 concept render', alt:x.name+', concept render', label:x.categoryLabel+' \u00b7 '+x.colorwayLabel}; });
  if(withEmblem) pics.unshift({src:F.EMBLEM.image, title:F.EMBLEM.title, caption:F.EMBLEM.caption, alt:'F.T.U. shield emblem', label:'The emblem'});
  if(pics.length){
    var g=document.createElement('div'); g.className='msg-thumbs';
    pics.forEach(function(pc,k){
      var b=document.createElement('button'); b.type='button'; b.className='msg-thumb';
      b.setAttribute('aria-label','View full screen: '+pc.title);
      b.innerHTML='<div class="shot"><img src="'+esc(pc.src)+'" alt="'+esc(pc.alt)+'" width="1264" height="848" decoding="async" loading="lazy"></div><span>'+esc(pc.label)+'</span>';
      b.addEventListener('click',function(){ if(pc.design) showTop(pc.design, designs); Lightbox.open(pics,k); });
      g.appendChild(b);
    });
    d.appendChild(g);
  }
  messagesEl.appendChild(d);
  messagesEl.scrollTop=messagesEl.scrollHeight;
  return d;
}
function greet(){ addMsg('assistant',"Hi — welcome to the F.T.T.U showroom. Tell me what you're into — sneakers, boots, heels, something for the snow, or just a season's colors — and I'll pull up the designs."); }

/* ── pull MATCH lines out of a reply and resolve them against the catalog ── */
var emblemAsked=false;
function extractMatches(text){
  var found=[]; emblemAsked=false;
  var clean=text.replace(/^[ \t]*MATCH:[ \t]*(.+)$/gim,function(_,id){
    var key=id.replace(/[^A-Za-z-]/g,'').toUpperCase();
    if(key==='EMBLEM'){ emblemAsked=true; return ''; }
    var d=F.byId(key); if(d && found.indexOf(d)<0) found.push(d); return '';
  }).replace(/\n{3,}/g,'\n\n').trim();
  return {clean:clean, matches:found};
}

/* ── cards: every value comes straight from catalog.js ── */
const CIRC=2*Math.PI*40;
function setDonut(pct,label){
  $('arc').setAttribute('stroke-dashoffset', String(CIRC*(1-pct/100)));
  $('arc').style.opacity = pct>0 ? '1' : '0';
  $('pct').textContent=pct+'%'; $('pctLabel').textContent=label;
}
function seasonLine(d){
  if(!d.season) return d.colorway==='ice-blue' ? 'Bonus colorway, any time of year' : 'Signature colorway, all year';
  if(d.season===SEASON) return 'In season now';
  return 'Comes back in ' + F.SEASON_INFO[d.season].label.toLowerCase();
}
function renderTop(d, featured){
  $('matchTag').textContent = featured ? ('Featured · ' + SEASON_LABEL + ' ' + YEAR) : ('Top match · ' + d.id);
  var img=$('matchImg'); img.src=d.image; img.alt=d.name+' — concept render';
  $('matchName').textContent=d.name;
  $('matchWhere').textContent=d.categoryLabel+' · '+d.colorwayLabel+' colorway';
  $('matchNotes').textContent=d.description;
  $('detailValue').innerHTML='<span class="season-dot" style="background:'+SEASON_DOT[d.colorway]+'"></span>'+esc(d.season ? F.SEASON_INFO[d.season].label : d.colorwayLabel);
  $('detailLine').innerHTML=esc(seasonLine(d))+'<span class="tiny-tag">CONCEPT</span>';

  $('tCategory').textContent=d.categoryLabel;
  $('tId').textContent=d.id;
  $('tColorway').textContent=d.colorwayLabel;
  var nt=$('nextText'); nt.textContent='';
  if(featured){
    nt.textContent='Ask about it in the chat, or name any category or season.';
  } else {
    var a=document.createElement('a'); a.href='guide.html#cat-'+d.category;
    a.textContent='See all '+d.categoryLabel.toLowerCase()+' in the guide \u2192';
    nt.appendChild(a);
  }
}
function renderShortlist(top, list, mode){
  var box=$('thumbs'); box.innerHTML='';
  list.forEach(function(x){
    var b=document.createElement('button'); b.type='button'; b.className='thumb';
    b.setAttribute('aria-label','View full screen: '+x.name); b.title=x.categoryLabel+' · '+x.colorwayLabel;
    b.setAttribute('aria-pressed', String(top && x.id===top.id));
    b.innerHTML='<img src="'+esc(x.image)+'" alt="" width="1264" height="848" loading="lazy" decoding="async">';
    b.addEventListener('click',function(){
      showTop(x, list, mode);
      Lightbox.open(list.map(function(d){ return {src:d.image, title:d.name, caption:d.categoryLabel+' \u00b7 '+d.colorwayLabel+' colorway \u00b7 concept render', alt:d.name+', concept render'}; }), list.indexOf(x));
    });
    box.appendChild(b);
  });
  var total=F.DESIGNS.length;
  if(mode==='season'){
    $('shortTitle').textContent='In season';
    $('shortValue').textContent=list.length+' of '+total;
    setDonut(Math.round(list.length/total*100), SEASON_LABEL.toLowerCase());
    $('shortText').textContent=list.length+' of the '+total+' designs wear this season\u2019s colors. Tap one to preview it.';
  } else if(mode==='picks'){
    $('shortTitle').textContent='Shortlist';
    $('shortValue').textContent=list.length+' picks';
    setDonut(Math.round(list.length/total*100), 'of the line');
    $('shortText').textContent='Pulled '+list.length+' of '+total+' designs for what you asked. Tap to compare.';
  } else {
    var n=list.length;
    $('shortTitle').textContent='Colorways';
    $('shortValue').textContent=(list.indexOf(top)+1)+' of '+n;
    setDonut(Math.round(1/n*100), n===1?'only one':'of '+n);
    $('shortText').textContent = n===1 ? 'One colorway so far for this category.' : n+' colorways for this category. Tap one to swap it in.';
  }
  $('donut').setAttribute('aria-label',$('shortTitle').textContent+': '+$('shortValue').textContent);
}
function showTop(d, list, mode){
  if(!list || list.length<2 && mode!=='season'){ list=F.inCategory(d.category); mode='colorways'; }
  if(!mode) mode = list.every(function(x){return x.category===d.category;}) && list.length===F.inCategory(d.category).length ? 'colorways' : 'picks';
  current={top:d, list:list, mode:mode, featured:false};
  renderTop(d,false); renderShortlist(d,list,mode); save();
}
function applyMatches(matches){
  if(!matches.length) return;
  var top=matches[0];
  if(matches.length===1) showTop(top, F.inCategory(top.category), 'colorways');
  else showTop(top, matches, 'picks');
}
function renderFeatured(){
  var lead=F.leadFor('sneakers',SEASON);
  var inSeason=F.DESIGNS.filter(function(d){return d.season===SEASON;});
  current={top:lead,list:inSeason,mode:'season',featured:true};
  renderTop(lead,true); renderShortlist(lead,inSeason,'season');
}

async function send(text){
  text=text.trim(); if(!text) return;
  input.value=''; input.style.height='';
  sendBtn.disabled=true;
  addMsg('user',text); conversation.push({role:'user',content:text}); setCount(messageCount+1); save();
  var thinking=addMsg('assistant','','thinking');
  try{
    var resp=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:SYSTEM_PROMPT,messages:conversation})});
    var data;
    try{ data=await resp.json(); }
    catch(e){
      thinking.remove(); setStatus('error');
      addMsg('assistant',"No answer from /api/chat (the server sent status "+resp.status+" instead of JSON). The backend isn't deployed next to this page yet — add api/chat.js to the same project and redeploy.",'error');
      sendBtn.disabled=false; return;
    }
    thinking.remove();
    if(!resp.ok){
      setStatus('error');
      var msg=(data&&data.error&&data.error.error&&data.error.error.message)||(data&&typeof data.error==='string'&&data.error)||('The server rejected the request (status '+resp.status+').');
      addMsg('assistant',msg,'error'); sendBtn.disabled=false; return;
    }
    setStatus('live');
    var raw=(data&&data.text)?data.text:"No usable answer came back — try rephrasing.";
    var parsed=extractMatches(raw);
    addMsg('assistant',parsed.clean||raw,null,parsed.matches,emblemAsked);
    conversation.push({role:'assistant',content:raw}); setCount(messageCount+1);
    applyMatches(parsed.matches);
    save();
  }catch(err){
    thinking.remove(); setStatus('error');
    addMsg('assistant', location.protocol==='file:' ? "You're viewing the showroom as a file on your computer, so there's no server for the chat to talk to. Everything else works here — pictures, full-screen view, theme and text size. The chat answers once the site is on Vercel with your API key." : "Can't reach the server. Check your connection, or that /api/chat is deployed.",'error');
  }
  sendBtn.disabled=false; input.focus({preventScroll:true});
}

sendBtn.addEventListener('click',function(){ send(input.value); });
input.addEventListener('keydown',function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send(input.value); } });
input.addEventListener('input',function(){ input.style.height='auto'; input.style.height=Math.min(Math.max(input.scrollHeight,42),110)+'px'; });

$('resetBtn').addEventListener('click',function(){
  conversation=[]; setCount(0); setStatus('');
  try{ sessionStorage.removeItem(STORE_KEY); }catch(e){}
  messagesEl.innerHTML=''; greet(); renderFeatured(); input.focus({preventScroll:true});
});
$('expandBtn').addEventListener('click',function(){
  var chat=$('chat'), on=!chat.classList.contains('expanded');
  chat.classList.toggle('expanded',on); document.body.classList.toggle('chat-open',on);
  this.setAttribute('aria-pressed',String(on));
  this.setAttribute('aria-label',on?'Close full screen':'Expand chat'); this.title=on?'Close full screen':'Expand chat';
  messagesEl.scrollTop=messagesEl.scrollHeight;
});
document.addEventListener('keydown',function(e){ if(e.key==='Escape' && $('chat').classList.contains('expanded')) $('expandBtn').click(); });

/* ── tap the big picture: full-screen viewer, swipe through the current set ── */
function openViewer(){
  var list=(current.list && current.list.length ? current.list : F.inCategory((current.top||F.leadFor('sneakers',SEASON)).category));
  var top=current.top||F.leadFor('sneakers',SEASON);
  var items=list.map(function(d){ return {src:d.image, title:d.name, caption:d.categoryLabel+' \u00b7 '+d.colorwayLabel+' colorway \u00b7 concept render', alt:d.name+', concept render'}; });
  Lightbox.open(items, Math.max(0, list.indexOf(top)));
}
$('matchShot').addEventListener('click', openViewer);
$('matchShot').addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openViewer(); } });

/* ── restore this session, or start fresh ── */
(function(){
  var saved=null;
  try{ saved=JSON.parse(sessionStorage.getItem(STORE_KEY)||'null'); }catch(e){}
  greet();
  if(saved && Array.isArray(saved.conversation) && saved.conversation.length){
    conversation=saved.conversation;
    conversation.forEach(function(m){
      if(m.role==='user') addMsg('user',m.content);
      else { var p=extractMatches(m.content); addMsg('assistant',p.clean||m.content,null,p.matches,emblemAsked); }
    });
    setCount(saved.count||conversation.length);
    var top=saved.top && F.byId(saved.top);
    var list=(saved.list||[]).map(F.byId).filter(Boolean);
    if(top) showTop(top, list.length?list:null); else renderFeatured();
  } else {
    renderFeatured();
  }
})();

/* ── a link from the guide can prefill the box (?q=...) — it never sends on its own ── */
(function(){
  try{
    var q=new URLSearchParams(location.search).get('q');
    if(q){ input.value=q.slice(0,300); input.dispatchEvent(new Event('input')); }
  }catch(e){}
})();

/* ── voice (browser speech recognition, nothing recorded) ── */
(function(){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition, note=$('voiceNote');
  if(!SR){ micBtn.hidden=true; return; }
  var rec=new SR(); rec.lang='en-US'; rec.interimResults=true; rec.continuous=true;
  var on=false, timer=null;
  function stopUI(){ on=false; clearTimeout(timer); micBtn.classList.remove('on'); micBtn.setAttribute('aria-label','Speak instead'); note.hidden=true; }
  function arm(){ clearTimeout(timer); timer=setTimeout(function(){ if(on) rec.stop(); },2000); }
  rec.addEventListener('start',function(){ on=true; micBtn.classList.add('on'); micBtn.setAttribute('aria-label','Stop listening'); note.textContent='Listening… stops after a short pause.'; note.hidden=false; arm(); });
  rec.addEventListener('end',stopUI);
  rec.addEventListener('error',function(e){ stopUI(); if(e.error==='not-allowed'||e.error==='permission-denied'){ note.textContent="Microphone access is blocked. Allow it in your browser's site settings to talk instead of type."; note.hidden=false; } });
  rec.addEventListener('result',function(e){ arm(); var t=''; for(var i=0;i<e.results.length;i++) t+=e.results[i][0].transcript; input.value=t; input.dispatchEvent(new Event('input')); });
  micBtn.addEventListener('click',function(){ if(on) rec.stop(); else { try{ rec.start(); }catch(e){} } });
})();
