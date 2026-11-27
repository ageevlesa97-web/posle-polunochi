const shell=document.querySelector('#app'),slotsKey='polunoch_s2_slots';
function nav2(active){return '<nav class="nav" aria-label="Разделы игры">'+[['home','⌂','История'],['people','♡','83 героя'],['journal','≡','Дневник'],['saves','◇','Сохранения']].map(([id,icon,t])=>'<button data-tab="'+id+'" class="'+(id===active?'active':'')+'"><span aria-hidden="true">'+icon+'</span>'+t+'</button>').join('')+'</nav>'}
const ages=[32,29,34,28,36,27,33,31,38,35,29,30,28,34,27,32,26,31,38,35,29,37,28,32,33,30,27,28,34,29,32,36,27,35,38,31,29,34,28,37,39,33,28,31,30,29,27,34,36,38,32,30,33,26,29,34,32,27,28,30,29];
function galleryCard(h,full=false){
 const index=Number(h.id.slice(1)), age=h.age||ages[index];
 const portrait=h.image?'<img class="person-photo" src="../portraits/'+h.image+'" loading="lazy" alt="'+esc(h.name)+'">':'<div class="new-portrait" role="img" aria-label="'+esc(h.name)+'" style="background-position:'+((index%8)*100/7)+'% '+(Math.floor(index/8)*100/7)+'%"></div>';
 const bond=s?.bonds?.[h.id]||0, scenes=s?.moments?.[h.id]||[], affection=s?.affection?.[h.id]||0;
 const status=s?.hero===h.id?'Сейчас рядом':bond?'Вы знакомы':'Встреча впереди';
 return '<article class="person-card" id="person-'+h.id+'">'+portrait+'<div class="person-content"><div class="eyebrow">'+esc(h.role)+'</div><h2>'+esc(h.name)+', '+age+'</h2><p class="muted">'+esc(h.description||'Хочет '+h.wish+'.')+'</p><div class="row metrics"><span title="Симпатия">♡ '+affection+'</span><span title="Доверие">◇ '+bond+'</span><span>Сцены '+scenes.length+'/4</span></div><p class="muted small">'+status+'</p>'+(full?'<div class="personal"><h3>Личная история</h3><p>'+esc(h.secret||profile(h))+'</p><h3>Финалы отношений</h3>'+types.map((t,i)=>'<p>'+((s?.ends||{})[h.id+':'+i]?'✓ ':'◇ ')+esc(t)+'</p>').join('')+'</div>':'<a class="profile-link" href="#hero/'+h.id+'">Открыть карточку →</a>')+(s&&s.chapter<500&&s.hero!==h.id?'<button class="secondary" data-join="'+h.id+'">Пойти вместе</button>':'')+'</div></article>'
}
function page2(tab='home'){
 shell.className=''; const slots=get(slotsKey)||[];
 const cards=['dmitry','andrey','artem'].map(id=>'<button class="cast" data-person="'+id+'"><img class="cast-photo" alt="" src="../portraits/'+PEOPLE[id].image+'"><span><strong>'+PEOPLE[id].name+'</strong><small>'+PEOPLE[id].role+'</small></span></button>').join('');
 const pages={
 home:()=>'<div class="eyebrow">Романтическая история · Сезон 2</div><h2>Одна встреча меняет всё</h2><section class="hero v2-hero"><div class="hero-art"></div><div class="hero-shade"></div><div class="hero-content"><span class="tag">Интерактивная история</span><h1>Четвёртая<br>платформа</h1><p class="muted">Вера ждёт под вокзальными часами. В камере хранения остались письма, до сих пор не нашедшие своих адресатов.</p><button class="primary" data-read>'+(!s?'Начать второй сезон':s.chapter===500?'Открыть эпилог':'Продолжить · глава '+(s.chapter+1))+'</button></div></section><div class="row section-head"><h2>Люди, которые меняют всё</h2><button class="text-button" data-tab="people">Все 83 →</button></div><div class="cast-row">'+cards+'</div><div class="row section-head"><h2>25 сюжетных арок</h2><span class="muted">'+(s?.chapter||0)+' / 500</span></div><div class="arc-grid">'+CASES.map((c,i)=>'<details class="card"><summary><span class="eyebrow">Главы '+(20*i+1)+'–'+(20*i+20)+'</span><h3>'+esc(c[0])+'</h3></summary>'+steps.map((z,j)=>'<div class="chapter-row"><span>'+(i*20+j+1)+'</span><span>'+esc(z[0])+'</span><small>'+(!s?'':s.chapter>i*20+j?'✓':s.chapter===i*20+j?'Сейчас':'')+'</small></div>').join('')+'</details>').join('')+'</div>',
 people:()=>'<h1>Герои</h1><label class="search-heroes">Поиск по имени или профессии<input type="search" id="hero-search" placeholder="Например, Кирилл"></label><div class="portrait-grid">'+CAST.map(h=>galleryCard(h)).join('')+'</div><p hidden id="empty-list">Герои не найдены</p>',
 journal:()=>'<h1>Дневник</h1>'+(s?'<p>'+esc(s.name)+' · '+esc(hero().name)+'</p><div class="stats-bar">'+labels.map((l,i)=>'<span>'+l+' <b>'+s.stats[i]+'</b></span>').join('')+'</div><p>Завершено историй: '+s.record.length+' из 25.</p>'+s.record.map((v,i)=>'<section class="card"><h3>'+esc(CASES[i][0])+'</h3><p>'+result[v]+'</p></section>').join(''):'<p>Здесь появятся решения после начала игры.</p>'),
 saves:()=>'<h1>Точки возвращения</h1><section class="card"><h3>Автосохранение</h3><p>'+(!s?'Пока пусто':s.chapter===500?'Эпилог':'Глава '+(s.chapter+1)+' · '+esc(hero().name))+'</p><button class="primary" data-read>'+(s?'Продолжить':'Начать')+'</button></section><h2>Ручные сохранения</h2>'+Array.from({length:5},(_,i)=>'<section class="card"><h3>Слот '+(i+1)+'</h3><p>'+(slots[i]?(slots[i].chapter===500?'Эпилог':'Глава '+(slots[i].chapter+1)):'Пока пусто')+'</p>'+(s?'<button class="secondary" data-save="'+i+'">Сохранить здесь</button> ':'')+(slots[i]?'<button class="secondary" data-load="'+i+'">Загрузить</button>':'')+'</section>').join('')
 };
 shell.innerHTML='<header><div class="brand">после <i>полуночи</i></div><a class="text-button" href="../">Первый сезон</a></header>'+pages[tab]()+(tab==='home'?'<section class="card previous"><h3>Предыдущая история</h3><p class="muted">За пределами письма · Первый сезон</p><a class="secondary" href="../">Открыть первый сезон</a></section>':'')+nav2(tab);window.scrollTo(0,0)
}
function reader(){shell.className='s2-reader';render();window.scrollTo(0,0)}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;if(d.person){location.hash="hero/"+d.person;return}if(d.tab){history.replaceState(null,'',location.pathname+location.search);page2(d.tab);return}if('read'in d){reader();return}if(d.join){history.replaceState(null,'',location.pathname+location.search);s.hero=d.join;save();reader();return}if('save'in d||'load'in d){const slots=get(slotsKey)||[];if('save'in d){if(slots[d.save]&&!confirm('Перезаписать эту точку?'))return;slots[d.save]=s;try{localStorage.setItem(slotsKey,JSON.stringify(slots))}catch{alert('Не удалось сохранить точку.');return}page2('saves')}else if(confirm('Продолжить с этой точки? Текущее автосохранение будет заменено.')){const all=s?.ends||{};s=slots[d.load];s.ends={...all,...s.ends};save();reader()}}});
function openProfile(){
 const h=CAST.find(x=>location.hash==='#hero/'+x.id);
 if(!h){page2(location.hash==='#people'?'people':'home');return}
 shell.className='';shell.innerHTML='<header><a class="text-button" href="#people">‹ Все герои</a><span class="brand">после <i>полуночи</i></span></header><section class="solo-profile">'+galleryCard(h,true)+'</section>'+nav2('people');scrollTo(0,0)
}
window.addEventListener('hashchange',openProfile);openProfile();

document.addEventListener('input',e=>{
 if(e.target.id!=='hero-search')return;
 const query=e.target.value.trim().toLocaleLowerCase('ru');let count=0;
 for(const h of CAST){const show=(h.name+' '+h.role).toLocaleLowerCase('ru').includes(query);document.getElementById('person-'+h.id).hidden=!show;if(show)count++}
 document.getElementById('empty-list').hidden=count>0;
});
