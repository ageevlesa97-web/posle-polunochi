(function(root){
const ids=['artem','dan','lev'],trust={artem:'ta',dan:'td',lev:'tl'};
const initial=(name='Алиса')=>({version:2,name:name.trim().slice(0,24)||'Алиса',node:'arrival',stats:{courage:0,empathy:0,insight:0,artem:0,dan:0,lev:0,ta:0,td:0,tl:0},flags:[],route:null,routeReason:null,outcome:null,world:null,history:[],visited:['arrival'],ended:null,candidates:[]});
function condition(s,r){return (!r.stats||Object.entries(r.stats).every(([k,v])=>s.stats[k]>=v))&&(!r.flags||r.flags.every(f=>s.flags.includes(f)));}
function allowed(s,c){return condition(s,{stats:c.need,flags:c.needFlags})&&(!c.needAny||c.needAny.some(r=>condition(s,r)));}
function routeCandidates(s){const eligible=ids.filter(k=>s.stats[k]>=4&&s.stats[trust[k]]>=2);if(!eligible.length)return [];const top=Math.max(...eligible.map(k=>s.stats[k]));return eligible.filter(k=>s.stats[k]===top);}
function choices(s,story){if(s.node==='tie')return [...s.candidates.map(k=>({text:'Продолжить с '+({artem:'Артёмом',dan:'Дэном',lev:'Львом'}[k]),to:'route_'+({artem:'a',dan:'d',lev:'l'}[k]),effects:{},route:k})),{text:'Выбрать дружбу и свой путь',to:'route_solo',effects:{},route:'solo'}];return story[s.node].choices;}
function strong(s){return ids.includes(s.route)&&s.stats[s.route]>=8&&s.stats[trust[s.route]]>=4&&s.flags.includes('commit')&&!s.flags.includes('friendzone');}
function broken(s){return ids.includes(s.route)&&(s.flags.includes('betrayal')||s.stats[trust[s.route]]<2);}
function choose(s,index,story){if(s.ended)throw Error('История завершена');const n=story[s.node],c=choices(s,story)[index];if(!c||!allowed(s,c))throw Error('Недоступный выбор');const t=JSON.parse(JSON.stringify(s)),changes=[];for(const[k,v]of Object.entries(c.effects||{})){const old=t.stats[k];t.stats[k]=Math.max(0,old+v);if(t.stats[k]!==old)changes.push({key:k,value:t.stats[k]-old});}for(const f of c.flags||[])if(!t.flags.includes(f))t.flags.push(f);if(c.route)t.route=c.route;
 t.history.push({node:n.id,title:n.title,text:n.text.replaceAll('{name}',t.name),choice:c.text,ch:n.ch,changes});
 let to=c.to;
 if(to==='@route'){t.candidates=routeCandidates(t);t.routeReason=ids.map(k=>({id:k,affection:t.stats[k],trust:t.stats[trust[k]]}));if(t.candidates.length===1){t.route=t.candidates[0];to='route_'+({artem:'a',dan:'d',lev:'l'}[t.route]);}else if(t.candidates.length>1)to='tie';else{t.route='solo';to='route_solo';}}
 if(to==='@accountability'){if(broken(t))to='broken';else if(t.route==='solo'||t.flags.includes('friendzone'))to='solo_future';else if(!strong(t))to='@ending_slow';else to=({artem:'a_future',dan:'d_future',lev:'l_future'}[t.route]);}
 if(to==='illusion'){t.ended='illusion';t.outcome='illusion';}
 else if(to.startsWith('@ending_')){let end=to.slice(8);if(['dan','lev'].includes(end)&&(t.flags.includes('exposure')||t.flags.includes('coverup')||broken(t)))end='broken';else if(['home','war','dan','lev'].includes(end)&&!strong(t))end='slow';t.ended=end;}
 else{if(!story[to])throw Error('Нет сцены '+to);t.node=to;if(!t.visited.includes(to))t.visited.push(to);if(story[to].outcome)t.outcome=story[to].outcome;if(story[to].world)t.world=story[to].world;}
 return t;
}
function valid(s,story){return !!(s&&s.version===2&&typeof s.name==='string'&&s.name.length<=24&&story[s.node]&&s.stats&&['courage','empathy','insight',...ids,...Object.values(trust)].every(k=>Number.isFinite(s.stats[k])&&s.stats[k]>=0)&&Array.isArray(s.flags)&&s.flags.every(f=>typeof f==='string')&&Array.isArray(s.history)&&s.history.every(h=>h&&typeof h.text==='string'&&typeof h.choice==='string'&&Array.isArray(h.changes))&&Array.isArray(s.visited)&&s.visited.every(id=>!!story[id])&&[null,...ids,'solo'].includes(s.route)&&[null,'home','war','release','dan','lev','slow','broken','solo','illusion'].includes(s.ended)&&Array.isArray(s.candidates)&&s.candidates.every(k=>ids.includes(k)));
}
const api={initial,allowed,choose,valid,choices,routeCandidates,strong,broken,trust};root.Engine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
