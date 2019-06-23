var crunchysyncHidden = true;
var crunchysync = document.createElement('div');
crunchysync.setAttribute("id", "crunchysync");
crunchysync.hidden = crunchysyncHidden;
var iframe = document.createElement('iframe');
iframe.setAttribute("src", chrome.runtime.getURL("index.html"));
iframe.setAttribute("class", "card");
var closeCrunchysync = document.createElement('div');
closeCrunchysync.setAttribute("id", "closecrunchysync");
closeCrunchysync.setAttribute("title", "Close Crunchysync");
closeCrunchysync.hidden = crunchysyncHidden;
document.getElementById('header_userpanel_beta').getElementsByTagName("ul")[0].children[0].children[0].removeAttribute("href");
document.getElementById("template_scroller").appendChild(closeCrunchysync);
document.getElementById('closecrunchysync').addEventListener("click", function(){toggleCrunchysync();});
document.getElementsByTagName("body")[0].appendChild(crunchysync);
document.getElementById('crunchysync').appendChild(iframe);
document.getElementById('header_userpanel_beta').getElementsByTagName("ul")[0].children[0].addEventListener("click", function(){toggleCrunchysync();});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.theme !== undefined){
  		setTheme(request.theme);
  	}else{
  		setTheme("light");
  	}
    sendResponse();
  }
);

chrome.storage.local.get(["theme"], function(result) {
	if(result.theme !== undefined){
		setTheme(result.theme);
	}else{
		setTheme("light");
	}
});

//Changes the css color values according to the provided theme
function setTheme(theme){
	var html = document.getElementsByTagName('html')[0];
  html.classList.remove("light");
  html.classList.remove("dark");
  html.classList.add(theme);
}

function toggleCrunchysync(){
  crunchysyncHidden = !crunchysyncHidden;
  document.getElementById('crunchysync').hidden = crunchysyncHidden;
	document.getElementById('closecrunchysync').hidden = crunchysyncHidden;
}
