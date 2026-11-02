export const ranks=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
export const names=['You','Marlow','Vesper'];
export function shuffle(cards){return cards.map(c=>({c,n:Math.random()})).sort((a,b)=>a.n-b.n).map(x=>x.c)}
const log=(s,message)=>[{id:s.seq+1,message},...s.logs].slice(0,80);
export function fresh(){
 const deck=shuffle(Array.from({length:156},(_,id)=>({id,rank:ranks[Math.floor(id/4)%13],suit:['♠','♥','♣','♦'][id%4]}))).slice(24);
 return {hands:[deck.slice(0,44),deck.slice(44,88),deck.slice(88)],pile:[],rank:ranks[Math.floor(Math.random()*13)],turn:0,phase:'turn',passes:0,lastPlayer:null,canChoose:false,round:1,seq:0,logs:[{id:0,message:'The Void has taken 24 secret cards. Your move.'}],winner:null,last:null,reveal:null};
}
export function reduce(s,a){
 if(a.type==='RESET')return fresh();
 if(a.seq!==undefined&&a.seq!==s.seq)return s;
 let n={...s,seq:s.seq+1};
 if(a.type==='PLAY'&&s.phase==='turn'&&a.player===s.turn){
  const cards=s.hands[a.player].filter(c=>a.ids.includes(c.id));
  if(cards.length<1||cards.length>4||cards.length!==a.ids.length)return s;
  const rank=s.canChoose&&ranks.includes(a.rank)?a.rank:s.rank;
  n.hands=s.hands.map((h,i)=>i===a.player?h.filter(c=>!a.ids.includes(c.id)):h);
  Object.assign(n,{rank,canChoose:false,pile:[...s.pile,...cards],passes:0,lastPlayer:a.player,last:{player:a.player,cards,rank},phase:'challenge',deadline:Date.now()+5000});
  n.logs=log(s,`${names[a.player]} played ${cards.length}, claiming ${rank}s.`);return n;
 }
 if(a.type==='PASS'&&s.phase==='turn'&&a.player===s.turn){
  n.logs=log(s,`${names[a.player]} passed.`);n.passes=s.passes+1;n.turn=(s.turn+1)%3;
  if(n.passes===3){Object.assign(n,{pile:[],passes:0,turn:s.lastPlayer??((s.turn+1)%3),rank:ranks[(ranks.indexOf(s.rank)+1)%13],canChoose:true,round:s.round+1,lastPlayer:null});n.logs=log(s,'Three passes. The pile vanishes into the Void. A new rank round begins.');}return n;
 }
 if(a.type==='ACCEPT'&&s.phase==='challenge'){
  if(s.hands[s.last.player].length===0){n.phase='over';n.winner=s.last.player;}else{n.phase='turn';n.turn=(s.last.player+1)%3;}return n;
 }
 if(a.type==='CALL'&&s.phase==='challenge'&&a.player!==s.last.player&&a.player>=0&&a.player<3){
  const bluff=s.last.cards.some(c=>c.rank!==s.last.rank);const loser=bluff?s.last.player:a.player;
  n.hands=s.hands.map((h,i)=>i===loser?[...h,...s.pile]:h);
  n.reveal={...s.last,bluff,challenger:a.player,loser,count:s.pile.length};n.phase='reveal';n.pile=[];
  n.turn=bluff?a.player:(s.last.player+1)%3;n.passes=0;
  if(bluff){n.rank=ranks[(ranks.indexOf(s.rank)+1)%13];n.canChoose=true;n.round++;n.lastPlayer=null;}
  n.logs=log(s,`${names[a.player]} called LIAR! ${bluff?'Bluff caught':'It was the truth'} — ${names[loser]} takes ${s.pile.length} cards.`);return n;
 }
 if(a.type==='CONTINUE'&&s.phase==='reveal'){
  n.reveal=null;const winner=s.hands.findIndex(h=>h.length===0);n.phase=winner<0?'turn':'over';n.winner=winner<0?null:winner;return n;
 }return s;
}
export function aiPlay(s){
 const h=s.hands[s.turn],rank=s.canChoose?[...ranks].sort((a,b)=>h.filter(c=>c.rank===b).length-h.filter(c=>c.rank===a).length)[0]:s.rank;
 const honest=h.filter(c=>c.rank===rank),trash=h.filter(c=>c.rank!==rank);let cards;
 if(honest.length&&Math.random()<.7)cards=honest.slice(0,4);
 else if(Math.random()<.68)cards=shuffle(trash.length?trash:h).slice(0,Math.min(h.length,1+Math.floor(Math.random()*3)));
 if(!cards?.length)return {type:'PASS',player:s.turn,seq:s.seq};
 return {type:'PLAY',player:s.turn,ids:cards.map(c=>c.id),rank,seq:s.seq};
}
