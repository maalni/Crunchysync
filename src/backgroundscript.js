chrome.runtime.onMessage.addListener(function(e,o,n){if("getCrunchyrollSessionCookie"==e.data)return chrome.cookies.get({url:"http://crunchyroll.com",name:"sess_id"},function(e){n({sessionid:e})}),!0});