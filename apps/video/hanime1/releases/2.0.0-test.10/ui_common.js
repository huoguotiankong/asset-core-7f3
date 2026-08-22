/* Hanime1 Test10 UI helpers */
var HanimeUI10=(function(H){
var GREEN='#35B779',GRAY='#888888';
function active(t,on){return on?'<b><font color="'+GREEN+'">'+t+'</font></b>':t;}
function rowLabel(t){return '<b><font color="'+GREEN+'">'+t+'</font></b>';}
function setVar(key,val){return $('#noLoading#').lazyRule(function(k,v){if(v==='')clearMyVar(k);else putMyVar(k,v);refreshPage(false);return 'hiker://empty';},key,String(val));}
function setSingleTag(t){return $('#noLoading#').lazyRule(function(x){putMyVar('hanime8_tags',x?JSON.stringify([x]):'[]');refreshPage(false);return 'hiker://empty';},String(t||''));}
function tab(title,id,cur){return {title:active(title,cur===id),url:$('#noLoading#').lazyRule(function(v){putMyVar('hanime10_tab',v);refreshPage(false);return 'hiker://empty';},id),col_type:'scroll_button',extra:{lineVisible:false}};}
function moreSelect(title,key,arr){return H.selectUrl(title,key,arr||[]);}
function epLabel(v,i){var t=String((v&&v.title)||''),m=t.match(/(?:第\s*)?(\d+)\s*(?:話|话|集)/i)||t.match(/\b(?:EP?|Part)\s*[-_. ]?(\d+)\b/i);return m?('第'+m[1]+'集'):('第'+(i+1)+'集');}
function tagsSelect(tags,route){var opts=(tags||[]).map(function(x){return x.name||String(x);}),vals=(tags||[]).map(function(x){return x.name||String(x);});var js="var o="+JSON.stringify(opts)+",v="+JSON.stringify(vals)+";for(var i=0;i<o.length;i++){if(String(o[i])===String(input))return '"+route+"&tag='+encodeURIComponent(v[i]);}return 'hiker://empty';";return 'select://'+JSON.stringify({title:'全部标签',options:opts,col:3,js:js});}
return {green:GREEN,gray:GRAY,active:active,rowLabel:rowLabel,setVar:setVar,setSingleTag:setSingleTag,tab:tab,moreSelect:moreSelect,epLabel:epLabel,tagsSelect:tagsSelect};
})(HanimeUI9);
