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
    min-width: 30vw;
    max-width: 300px;
    min-height: 2em;
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
            document.querySelector('.html5-main-video').currentTime = 60;
        }catch(e){
            mkndiv_status_set('trying to skip video failed');
        }
    }

    mknbt_fastforward.addEventListener('click',mkn_fastforward);
    mknbt_skip.addEventListener('click',mkn_skip);

    function check_iklan_step(){
        try {
            //
            if (document.querySelector('.ytp-ad-preview-text')){
                mkn_skip();
                Array.prototype.forEach.call(document.querySelectorAll('.html5-main-video'),(el)=>{
                    el.playbackRate = 6;
                });
                mkndiv_status_set('ads fast forwarded');
            }
        }catch(e){
            console.log('trying to fast forward video failed');
        }
        var el = document.querySelector('#ytd-player .ytp-ad-skip-button-slot, .ytp-ad-overlay-close-button');
        if (el!==null) {
                mkn_skip();
                el.click();
                mkndiv_status_set('clicking skip button. type:'+el.className+' bold');
        }
    }
    window.interval_length = 500;
    if (document.hidden){
        window.interval_length = 2000;
    }
    window.check_iklan_interval = setInterval(check_iklan_step, window.interval_length);
    function reduce_interval(){
        clearInterval(window.check_iklan_interval);
        window.check_iklan_interval = setInterval(check_iklan_step, 2000);
    }
    setTimeout(reduce_interval, 20000);
    document.addEventListener("visibilitychange", ()=>{
        if (document.hidden){
            reduce_interval();
        }
    });



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
    
    
    //~ window.channel_black_list_interval = 0;
    //~ function channel_black_list_routine(){
        //~ let current_channel_el = document.querySelector('#primary #below #channel-name .ytd-channel-name');
        //~ if (current_channel_el==null) return;
        //~ let current_channel = current_channel_el.innerText;
        
        //~ let STORAGE_KEY = 'makinyoutubetools_chlist';
        //~ let watchlist = localStorage.getItem(STORAGE_KEY);
        //~ try {
            //~ watchlist = JSON.parse(watchlist);
            //~ if (watchlist==null) watchlist = [];
        //~ } catch(e) {
            //~ watchlist = [];
        //~ }
        //~ watchlist.push(current_channel);
        //~ let watchlist_string = JSON.stringify(watchlist);
        
        //~ localStorage.setItem(STORAGE_KEY, watchlist_string);
        //~ console.log(watchlist_string);
        
        //~ let watchlistdiv = document.createElement('div');
        //~ watchlistdiv.innerText = watchlist_string;
        //~ mkndiv.appendChild(watchlistdiv);
        //~ clearInterval(channel_black_list_interval);
    //~ }
    //~ window.channel_black_list_interval = setInterval(channel_black_list_routine, 1000);
    
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

