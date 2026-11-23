(function(root){
const keys=['courage','empathy','insight','balance'];
const initial=(name='Алиса',people)=>({version:3,name:(name||'Алиса').trim().slice(0,24)||'Алиса',node:'c0',chapter:0,stats:Object.fromEntries([...keys,...Object.keys(people),...Object.keys(people).map(k=>'t_'+k)].map(k=>[k,0])),world:{safety:0,support:0,evidence:0},flags:[],dates:{},seen:[],route:null,candidates:[],routeReason:null,service:null,ending:null,history:[],last:[],campUsed:false,finalChoice:0,milestones:[]});
function allowed(s,c){return !c.need||Object.entries(c.need).every(([k,v])=>(s.stats[k]??s.world[k]??0)>=v);}
function castAvailable(s,chapters){return [...new Set(chapters.slice(0,s.chapter+1).map(c=>c.hero))];}
function availableDates(s,chapters,people){if(s.campUsed)return [];const maxStage=Math.min(3,Math.floor(s.chapter/20));return castAvailable(s,chapters).filter(k=>{const stage=s.dates[k]||0;return stage<=maxStage&&stage<4;});}
function candidates(s,people){const found=Object.keys(people).filter(k=>s.stats[k]>=8&&s.stats['t_'+k]>=6&&!s.flags.includes('betrayed_'+k)&&!s.flags.includes('friend_'+k));if(!found.length)return [];const best=Math.max(...found.map(k=>s.stats[k]));return found.filter(k=>s.stats[k]===best);}
function strong(s){return s.route&&s.route!=='solo'&&s.stats[s.route]>=10&&s.stats['t_'+s.route]>=8&&!s.flags.includes('betrayed_'+s.route)&&!s.flags.includes('friend_'+s.route);}
function choices(s,story,chapters,people){const n=story[s.node];if(s.ending)return [];
if(n.kind==='chapter')return chapters[s.chapter].choices.map((c,i)=>({...c,action:'plot',index:i}));
if(n.kind==='result')return [{text:'Перейти к личной части главы →',action:'camp'}];
if(n.kind==='camp'){
 const result=availableDates(s,chapters,people).map(k=>({text:`Встреча: ${people[k].name} · ${['знакомство','откровенность','конфликт','будущее'][s.dates[k]||0]}`,action:'date',hero:k}));
 if(s.chapter===84&&s.route==='artem'&&!s.service)return [{text:'Обсудить местную эвакуационную команду',action:'service',service:'home',need:{safety:45,evidence:45},impact:'Нужны безопасность 45 и доказательства 45: работа в городе станет реальной альтернативой.'},{text:'Поддержать отправку в санитарный отряд',action:'service',service:'war',impact:'Артём уйдёт на войну. Его возвращение не гарантировано.'},{text:'Не обещать ждать и честно расстаться',action:'service',service:'release',impact:'Ваши отношения завершатся без обязательства ожидания.'}];
 return [...result,{text:s.chapter===88?'Прочитать итог всей истории':'Продолжить без дополнительной встречи →',action:'next'}];}
if(n.kind==='route')return [...s.candidates.map(k=>({text:'Продолжить романтическую линию: '+people[k].name,action:'route',hero:k})),{text:'Мой выбор — дружба и самостоятельный путь',action:'route',hero:'solo'}];
if(n.kind==='date'){
 const k=n.person,other=s.route&&(s.route==='solo'||s.route!==k),stage=n.stage;
 const variants=[
 ['Ответить на флирт и предложить ещё одну встречу','Выслушать и рассказать что-то личное о себе','Сразу обозначить дружеские отношения','Закончить вечер без новых обещаний'],
 ['Сохранить сказанное между вами и поддержать','Задать трудный вопрос без обвинения','Передать его тайну ради общего дела','Признать, что пока не готова к этой близости'],
 ['Поддержать честный поступок, даже если он неудобен','Вместе продумать последствия и границы','Использовать его тайну, чтобы получить преимущество','Не выбирать за него; остаться рядом как друг'],
 ['Сказать, что хочешь попробовать отношения','Обсудить пространство, работу и взаимные ожидания','Выбрать дружбу вместо романтических обещаний','Попросить время, не обещая чувства заранее']
 ];return variants[stage].map((text,i)=>({text:other&&stage===3&&i===1?'Обсудить границы дружбы и личное пространство':text,action:'bond',hero:k,stage,index:i,disabled:other&&i===0,reason:other&&i===0?'У тебя уже есть романтическая линия. Здесь возможна дружеская встреча.':null,effects:i===0?{[k]:3,['t_'+k]:1}:i===1?{[k]:1,['t_'+k]:2,empathy:1}:i===2&&[1,2].includes(stage)?{['t_'+k]:-99}:{},impact:i===2&&[1,2].includes(stage)?'Предательство: романтическая линия этого человека будет закрыта.':i===2?'Дружба: этот герой больше не участвует в выборе романтической линии.':null}));}
return [];
}
function finish(s){if(s.finalChoice===2||s.route==='solo'||!s.route)return 'solo';if(s.flags.includes('betrayed_'+s.route)||s.stats['t_'+s.route]<4)return 'broken';if(s.finalChoice===3||s.service==='release'||s.flags.includes('friend_'+s.route))return 'release';if(s.finalChoice===1||!strong(s))return 'slow';if(s.route==='artem'&&s.service==='war')return 'war';return 'love_'+s.route;}
function choose(s,index,story,chapters,people){const n=story[s.node],c=choices(s,story,chapters,people)[index];if(!c||c.disabled||!allowed(s,c)||s.ending)throw Error('Этот выбор недоступен');const t=JSON.parse(JSON.stringify(s));t.last=[];
for(const[k,v]of Object.entries(c.effects||{})){let old=t.stats[k];t.stats[k]=Math.max(0,old+v);if(t.stats[k]!==old)t.last.push({key:k,value:t.stats[k]-old});}
for(const[k,v]of Object.entries(c.world||{})){t.world[k]+=v;t.last.push({key:k,value:v});}
t.history.push({node:s.node,ch:s.chapter,title:n.title,choice:c.text,changes:t.last});if(!t.seen.includes(s.node))t.seen.push(s.node);
switch(c.action){
 case 'plot':if(t.chapter===69&&c.index===3)t.flags.push('want_solo');if(t.chapter===88)t.finalChoice=Math.min(3,c.index);t.node=`c${t.chapter}r${c.index}`;break;
 case 'camp':t.node='camp'+t.chapter;break;
 case 'date':t.node=`date_${c.hero}_${t.dates[c.hero]||0}`;break;
 case 'bond':if(c.index===2){if([1,2].includes(c.stage)){t.flags.push('betrayed_'+c.hero);t.world.evidence+=2;t.last.push({key:'evidence',value:2});}else t.flags.push('friend_'+c.hero);}t.dates[c.hero]=(t.dates[c.hero]||0)+1;t.campUsed=true;t.node='camp'+t.chapter;break;
 case 'service':t.service=c.service;break;
 case 'route':t.route=c.hero;t.chapter=70;t.campUsed=false;t.node='c70';break;
 case 'next':
  if([9,19,29,39,49,59,69,79,88].includes(t.chapter)){let tier=Math.floor(t.chapter/10)+1;t.milestones.push({chapter:t.chapter,safety:t.world.safety>=tier*6,support:t.world.support>=tier*6,evidence:t.world.evidence>=tier*6});}
  if(t.chapter===88){t.ending=finish(t);break;}
  if(t.chapter===69){t.candidates=candidates(t,people);t.routeReason=Object.keys(people).map(k=>({id:k,affection:t.stats[k],trust:t.stats['t_'+k],excluded:t.flags.includes('betrayed_'+k)||t.flags.includes('friend_'+k)}));if(t.flags.includes('want_solo')||!t.candidates.length)t.route='solo';else if(t.candidates.length===1)t.route=t.candidates[0];else{t.node='route';break;}}
  t.chapter++;t.campUsed=false;t.node='c'+t.chapter;break;
 default:throw Error('Unknown action');}
return t;
}
function valid(s,story,people){return !!(s&&s.version===3&&typeof s.name==='string'&&s.name.length<=24&&story[s.node]&&Number.isInteger(s.chapter)&&s.chapter>=0&&s.chapter<89&&s.stats&&[...keys,...Object.keys(people),...Object.keys(people).map(k=>'t_'+k)].every(k=>Number.isFinite(s.stats[k])&&s.stats[k]>=0)&&s.world&&['safety','support','evidence'].every(k=>Number.isFinite(s.world[k])&&s.world[k]>=0)&&Array.isArray(s.flags)&&s.flags.every(f=>typeof f==='string')&&s.dates&&Object.entries(s.dates).every(([k,v])=>people[k]&&Number.isInteger(v)&&v>=0&&v<=4)&&Array.isArray(s.history)&&s.history.every(h=>h&&story[h.node]&&typeof h.choice==='string'&&Array.isArray(h.changes))&&Array.isArray(s.last)&&Array.isArray(s.seen)&&Array.isArray(s.candidates)&&s.candidates.every(k=>!!people[k])&&Array.isArray(s.milestones)&&[null,'solo',...Object.keys(people)].includes(s.route)&&[null,'home','war','release'].includes(s.service)&&[null,'solo','broken','release','slow','war',...Object.keys(people).map(k=>'love_'+k)].includes(s.ending));}
const api={initial,allowed,choices,choose,valid,castAvailable,availableDates,candidates,strong,finish};root.Engine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
