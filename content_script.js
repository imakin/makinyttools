/*jslint browser: true */
/*global document: false */

console.log('makin tools running');

window.mkndata = {};
var mkndiv = document.createElement('div');
mkndiv.id = 'mkndiv';
mkndiv.setAttribute('style',`
    position:fixed;
    bottom:20px;
    left:20px;
    z-index:2029;
    padding:10px;
    background:rgba(255,255,255,0.5);
    border:solid 1px gray;
    min-width: none;
    max-width: 300px;
    min-height: 2em;
    width: 50px;
    height: 3em;
    transition: width 1s;
`);
let mkndivclose = document.createElement('button');
mkndivclose.type = 'button';
mkndivclose.addEventListener('click',(ev)=>{
    mkndiv.style.display = 'none';
});
mkndivclose.innerText = 'close';
mkndiv.appendChild(mkndivclose);
document.body.appendChild(mkndiv);

function create_get_element(element_id, tag, parent){
    let el = document.getElementById(element_id);
    if (!el){
        el = document.createElement(tag);
        el.id = element_id;
        parent.appendChild(el);
    }
    return el;
}

if (document.location.host.endsWith('youtube.com')){

    check_iklan_interval = 0;

    var ytd_player = null;
    var ytp_ad_module = null;

    let mkndiv_status = document.createElement('p');
    mkndiv.style.overflow = 'hidden'
    mkndiv_status.id = "mkndiv_status"
    let mknbt_fastforward = document.createElement('button');
    mknbt_fastforward.setAttribute('type','button');
    mknbt_fastforward.innerHTML = 'FF6x Ads'
    let mknbt_skip = document.createElement('button');
    mknbt_skip.setAttribute('type','button');
    mknbt_skip.innerHTML = 'Skip'
    mkndiv.appendChild(mknbt_fastforward);
    mkndiv.appendChild(mknbt_skip);
    mkndiv.appendChild(mkndiv_status);

    mkndiv.addEventListener('mouseenter',(ev)=>{
        mkndiv.style.width = 'auto';
        mkndiv.style.height = 'auto';
    });
    mkndiv.addEventListener('mouseleave',(ev)=>{
        mkndiv.style.width = '50px';
        mkndiv.style.height = '2em';
    })

    function mkndiv_status_set(text){
        mkndiv_status.innerHTML = text;
    }

    function mkn_fastforward(ev){
        try{
            document.querySelector('.html5-main-video').playbackRate = 6;
        }catch(e){
            mkndiv_status_set('trying to fast forward video failed');
        }
    }
    function mkn_skip(ev){
        try{
            document.querySelector('.html5-main-video').currentTime = 260;
        }catch(e){
            mkndiv_status_set('trying to skip video failed');
        }
    }

    mknbt_fastforward.addEventListener('click',mkn_fastforward);
    mknbt_skip.addEventListener('click',mkn_skip);

    window.check_iklan_sampling = 5;
    function check_iklan_step(){
        window.check_iklan_sampling -= 1;
        mkndiv_status_set(`check iklan in ${check_iklan_sampling} of ${interval_length}`);
        if (window.check_iklan_sampling<1){
            window.check_iklan_sampling = 5;
        }
        else {
            return;
        }
        //~ try {
            //~ //
            //~ if (document.querySelector('.ytp-ad-preview-text')){
                //~ mkn_skip();
                //~ Array.prototype.forEach.call(document.querySelectorAll('.html5-main-video'),(el)=>{
                    //~ el.playbackRate = 6;
                //~ });
                //~ mkndiv_status_set('ads fast forwarded');
            //~ }
        //~ }catch(e){
            //~ console.log('trying to fast forward video failed');
        //~ }
        var elbt = document.querySelector('.ytp-ad-skip-button-modern');
        if (elbt!==null){
            elbt.click();
            mkndiv_status_set('clicking modernbt. type:'+elbt.className+' bold');
            return;
        }
        var el = document.querySelector('#ytd-player .ytp-ad-skip-button-slot, .ytp-ad-overlay-close-button, .ytp-ad-preview-container');
        if (el!==null) {
                mkn_skip();
                //~ el.click();
                mkndiv_status_set('clicking skip button. type:'+el.className+' bold');
        }
    }
    window.interval_length = 200;
    //~ if (document.hidden){
        //~ window.interval_length = 1000;
    //~ }
    window.check_iklan_interval = setInterval(check_iklan_step, window.interval_length);
    //~ function reduce_interval(){
        //~ clearInterval(window.check_iklan_interval);
        //~ window.check_iklan_interval = setInterval(check_iklan_step, 1000);
    //~ }
    //~ setTimeout(reduce_interval, 20000);
    //~ document.addEventListener("visibilitychange", ()=>{
        //~ if (document.hidden){
            //~ reduce_interval();
        //~ }
    //~ });



    //Channel black list
    
    function get_channel_name(){
        let current_channel_el = document.querySelector('#primary #below #channel-name .ytd-channel-name');
        if (current_channel_el==null) return;
        let current_channel = current_channel_el.innerText;
        return current_channel;
    };
    
    const blacklistdiv = create_get_element('makinyoutubetools_blacklistdiv','div', mkndiv);
    function channel_get_blacklist(return_text){
        let STORAGE_KEY = 'makinyoutubetools_chlist';
        let blacklisttext = localStorage.getItem(STORAGE_KEY);
        try {
            blacklist = JSON.parse(blacklisttext);
            if (blacklist==null) blacklist = [];
        } catch(e) {
            blacklist = [];
        }
        blacklistdiv.innerText = blacklisttext;
        if (return_text){
            return blacklisttext;
        }
        return blacklist;
    }
    function channel_write_blacklist(data_text){
        let STORAGE_KEY = 'makinyoutubetools_chlist';
        localStorage.setItem(STORAGE_KEY,data_text);
    }
    function channel_is_blocked(){
        let current_channel = get_channel_name();
        let blacklist = channel_get_blacklist();
        if (blacklist.indexOf(current_channel)>=0){
            return true;
        }
        return false;
    }
    function channel_block(){
        let current_channel = get_channel_name();
        let blacklist = channel_get_blacklist();
        if (blacklist.indexOf(current_channel)>=0){
            return;
        }
        else{
            blacklist.push(current_channel);
        }
        channel_write_blacklist(JSON.stringify(blacklist));
    }
    function channel_blacklist_clear(){
        channel_write_blacklist('[]');
    }
    function channel_unblock(){
        let current_channel = get_channel_name();
        let blacklisttext = channel_get_blacklist(true);
        blacklisttext = blacklisttext.replace(`"${current_channel}"`,'');
        blacklisttext = blacklisttext.replace(',,',',');
        console.log(blacklisttext);
        channel_write_blacklist(blacklisttext);
    }
    
    const btn_blacklist_clear = create_get_element('makinyoutubetools_blacklist_bt_clear', 'button', mkndiv);
    btn_blacklist_clear.innerText = 'blacklist clear';
    btn_blacklist_clear.addEventListener('click',channel_blacklist_clear);
    const btn_blacklist = create_get_element('makinyoutubetools_blacklist_bt', 'button', mkndiv);    
    btn_blacklist.addEventListener('click',function(ev){
        if (btn_blacklist.innerText=='block'){
            channel_block();
        }
        else {
            channel_unblock();
        }
    });
    
    const blocking_div = create_get_element('makinyoutubetools_blocking_div', 'div', document.body);
    blocking_div.setAttribute('style',`
        position: fixed;
        z-index: 2028;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background:gray;
        text-align:center;
        padding-top: 30vh;
        color: white;
        display: none;
        font-size: 3em;
    `);
    blocking_div.innerText = "channel blocked";
    
    
    function channel_blacklist_check(){
        let current_channel = get_channel_name();
        let blacklist = channel_get_blacklist();
        if (channel_is_blocked()){
            btn_blacklist.innerText = 'unblock';
            document.querySelector('.html5-main-video').pause();
            blocking_div.style.display = 'block';
        }
        else {
            btn_blacklist.innerText = 'block';
            blocking_div.style.display = 'none';
        }
    }
    setInterval(channel_blacklist_check,1000);
    
    
    
    
    //embed mode
    const bt_embed_mode = create_get_element('makinyoutubetools_embedmode', 'button', mkndiv);
    const embed_div = create_get_element('makinyoutubetools_embeddiv', 'div', document.body);
    embed_div.setAttribute('style',blocking_div.getAttribute('style'));
    
    const KEY_EMBED = 'makinyoutubetools_embed_mode';
    bt_embed_mode.innerText = 'activate Embed Mode';
    if (localStorage.getItem(KEY_EMBED)==1){
        bt_embed_mode.innerText = 'deactivate Embed Mode';
    }
    bt_embed_mode.addEventListener('click',(ev)=>{
        if (bt_embed_mode.innerText=='activate Embed Mode'){
            localStorage.setItem(KEY_EMBED, '1');
            bt_embed_mode.innerText = 'deactivate Embed Mode';
        } else {
            localStorage.setItem(KEY_EMBED, '0');
            bt_embed_mode.innerText = 'activate Embed Mode';
        }
    });
    
    function embed_mode_check(){
        let active = localStorage.getItem(KEY_EMBED);
        try{
            let videoid = /(?:.+watch\?v=)(?<vid>.+)/g.exec(document.location.href)[1];
        }
        catch(e){
            return;
        }
        let targetsrc = `https://www.youtube-nocookie.com/embed/${videoid}`;
        if (active=='1'){
            //~ if (embed_div.querySelector('iframe') && embed_div.querySelector('iframe').src==targetsrc){
                //~ return;
            //~ }
            //~ embed_div.innerHTML = '';
            //~ let iframe = document.createElement('iframe');
            //~ iframe.setAttribute('src',targetsrc);
            //~ embed_div.appendChild(iframe);
            //~ embed_div.style.display = 'block';
            let bt = document.querySelector('yt-sharing-embed-renderer');
            if (bt && bt.checkVisibility()){
                return;//already shown
            }
            document.querySelector('#actions button[aria-label="Share"]').click();
            setTimeout(()=>{
                document.querySelector('#share-targets button[title="Embed"]').click();
            },1000);
        }
        else {
            //~ embed_div.style.display = 'none';
        }
    }
    if (localStorage.getItem(KEY_EMBED)=='1'){
        setInterval(embed_mode_check, 2000);
    }
}

function makeselector(el){
    var selector = el.tagName.toLowerCase();
    var target = el.parentNode;
    while (target.tagName!="BODY"){
        selector = target.tagName.toLowerCase() + ' ' + selector;
        target = target.parentNode;
    }
    console.log(el.className);
    return selector;
}

