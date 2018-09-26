chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.data == 'getCrunchyrollSessionCookie') {
		chrome.cookies.get({"url": "http://crunchyroll.com", "name": "sess_id"}, function(cookie){
			sendResponse({sessionid: cookie});
		});
		return true;
	}
});