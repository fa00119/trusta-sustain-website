/* Trusta product previews: progressive enhancement, no product APIs or customer data. */
(function(){
const tabs=Array.from(document.querySelectorAll('[data-trusta-preview]'));
if(tabs.length!==3)return;
const activate=(next,focus)=>{
tabs.forEach(tab=>{const active=tab===next;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;const panel=document.getElementById(tab.getAttribute('aria-controls'));if(panel)panel.hidden=!active;});
if(focus)next.focus();
if(typeof window.gtag==='function')window.gtag('event','product_preview_select',{product:next.dataset.trustaPreview||'unknown',source_path:window.location.pathname});
};
tabs.forEach((tab,index)=>{
tab.addEventListener('click',()=>activate(tab,false));
tab.addEventListener('keydown',event=>{let i=index;if(event.key==='ArrowRight')i=(index+1)%tabs.length;else if(event.key==='ArrowLeft')i=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')i=0;else if(event.key==='End')i=tabs.length-1;else return;event.preventDefault();activate(tabs[i],true);});
});
})();