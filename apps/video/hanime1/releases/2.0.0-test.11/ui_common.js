/* Hanime1 Test11 UI compatibility: no HTML in scroll buttons */
(function(U){
function active(t,on){return (on?'● ':'')+String(t||'');}
function rowLabel(t){return '▌'+String(t||'');}
function tab(title,id,cur){return {title:active(title,cur===id),url:$('#noLoading#').lazyRule(function(v){putMyVar('hanime10_tab',v);refreshPage(false);return 'hiker://empty';},id),col_type:'scroll_button',extra:{lineVisible:false}};}
function epLabel(v,i){var t=String((v&&v.title)||''),m=t.match(/(?:第\s*)?(\d+)\s*(?:話|话|集)/i)||t.match(/#\s*(\d+)/)||t.match(/\b(?:EP?|Part)\s*[-_. ]?(\d+)\b/i);return m?('第'+m[1]+'集'):('第'+(i+1)+'集');}
U.active=active;U.rowLabel=rowLabel;U.tab=tab;U.epLabel=epLabel;
})(HanimeUI10);
