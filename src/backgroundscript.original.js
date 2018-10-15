//Return the requested session cookie, since i cant get them through the contentscript
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.data == 'getCrunchyrollSessionCookie') {
		chrome.cookies.get({"url": "http://crunchyroll.com", "name": "sess_id"}, function(cookie){
			sendResponse({sessionid: cookie});
		});
		return true;
	}
});
