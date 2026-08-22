/* JavBus alpha1 local-file compatibility guard */
if(typeof JavBusCore==='object'){
  JavBusCore.readJson=function(path){try{var x=JSON.parse(fetch(path)||'[]');return Array.isArray(x)?x:[];}catch(e){return[];}};
}
