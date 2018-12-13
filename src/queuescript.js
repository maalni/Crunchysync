var crunchysyncHidden = true;
document.getElementById('header_userpanel_beta').getElementsByTagName("ul")[0].children[0].innerHTML = "<a id='crqueuenavbaricon' class='header-icon' token='topbar'><iframe id='crunchysync' src='" + chrome.runtime.getURL("index.html") + "' hidden></iframe><div class='icon-container'><svg viewBox='0 0 48 48'><use xlink:href='/i/svg/header.svg#cr_bookmark_header'></use></svg></div><div class='caption'>Queue</div></a>";
document.getElementById('header_userpanel_beta').getElementsByTagName("ul")[0].children[0].addEventListener("click", function(){toggleCrunchysync();});
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
	if(theme == "dark"){
		html.style.setProperty("--secondary-color", "#333333");
		html.style.setProperty("--darkened-secondary-color", "#262626");
		html.style.setProperty("--tertiary-color", "white");
		html.style.setProperty("--darkened-tertiary-color", "#F2F2F2");
	}else if(theme == "light"){
		html.style.setProperty("--secondary-color", "white");
		html.style.setProperty("--darkened-secondary-color", "#F2F2F2");
		html.style.setProperty("--tertiary-color", "#333333");
		html.style.setProperty("--darkened-tertiary-color", "#262626");
	}
}

function toggleCrunchysync(){
  crunchysyncHidden = !crunchysyncHidden;
  document.getElementById('crunchysync').hidden = crunchysyncHidden;
}

function closeCrunchysync(){
  crunchysyncHidden = true;
  document.getElementById('crunchysync').hidden = crunchysyncHidden;
}
