var manifestData = chrome.runtime.getManifest();
console.log("----------Crunchysync Contentscript v" + manifestData.version + "----------");
var t0 = performance.now();
document.getElementById("sidebar_elements").innerHTML = "";
document.getElementById("sortable").innerHTML =
	"<style>"+
		"#sortable div{"+
			"color: black;"+
		"}"+
		"#sortable div li{"+
			"position: relative;"+
			"width: 960px;"+
			"height: 150px;"+
			"margin-bottom: 10px;"+
			"border: none;"+
			"border-radius: 5px;"+
			"background-color: white;"+
			"overflow: hidden;"+
		"}"+
		"#sortable div li a{"+
			"position: absolute;"+
			"top: 0;"+
			"left: 0;"+
			"width: 960px;"+
			"height: 150px;"+
		"}"+
		"#sortable div li img{"+
			"position: absolute;"+
			"top: 0;"+
			"left: 0;"+
			"width: auto;"+
			"height: 150px;"+
			"border: none;"+
		"}"+
		"#sortable progress{"+
			"position: absolute;"+
			"-webkit-appearance: none;"+
			"background-color: rgba(0,0,0,0);"+
			"bottom: 0;"+
			"left: 0;"+
			"width: 960px;"+
			"height: 5px;"+
		"}"+
		"#sortable progress[value]::-webkit-progress-bar{"+
			"background-color: rgba(0,0,0,0);"+
		"}"+
		"#sortable progress[value]::-webkit-progress-value{"+
			"background-color: orange;"+
		"}"+
		"#sortable .animeTitle{"+
			"color: white;"+
			"position: absolute;"+
			"top: 5px;"+
			"left: 275px;"+
			"font-size: 11pt;"+
			"padding: 0 5px;"+
			"background-color: orange;"+
		"}"+
		"#sortable .episodeName{"+
			"color: white;"+
			"position: absolute;"+
			"top: 23px;"+
			"left: 275px;"+
			"font-size: 13pt;"+
			"padding: 0 5px;"+
			"background-color: orange;"+
			"font-weight: bold;"+
		"}"+
		"#sortable .episodeNumber{"+
			"color: white;"+
			"position: absolute;"+
			"top: 44px;"+
			"left: 275px;"+
			"font-size: 10pt;"+
			"padding: 0 5px;"+
			"background-color: orange;"+
		"}"+
		"#sortable .description{"+
			"position: absolute;"+
			"top: 65px;"+
			"left: 275px;"+
			"height: 80px;"+
			"overflow: hidden;"+
		"}"+
	"</style>"+
	"<div id='watching'></div>"+
	"<div id='unseen' hidden></div>"+
	"<div id='done' hidden></div>"+
	"<div id='all' hidden></div>";
document.getElementsByClassName("main-tabs")[0].innerHTML =
	"<a id='watchingbtn' href='#watching' class='left selected'>Watching</a>"+
	"<a id='unseenbtn' href='#unseen' class='left'>Unseen</a>"+
	"<a id='donebtn' href='#done' class='left'>Done</a>"+
	"<a id='allbtn' href='#all' class='left'>All</a>";
document.getElementById("watchingbtn").addEventListener("click", function(){changeTab(0);});
document.getElementById("unseenbtn").addEventListener("click", function(){changeTab(1);});
document.getElementById("donebtn").addEventListener("click", function(){changeTab(2);});
document.getElementById("allbtn").addEventListener("click", function(){changeTab(3);});
chrome.storage.local.get(["animes"], function(result) {
	for(var i in result.animes){
		var anime = result.animes[i];
		var element =
		"<li name="+anime.most_likely_media.name+">"+
			"<a href="+anime.most_likely_media.url+">"+
			"<img src="+anime.most_likely_media.screenshot_image.fwide_url+">"+
			"<progress value="+anime.most_likely_media.playhead+" max="+anime.most_likely_media.duration+"></progress>"+
			"<div>"+
				"<span class='animeTitle'>"+anime.series.name+"</span>"+
				"<span class='episodeName'>"+anime.most_likely_media.name + "</span>"+
				"<span class='episodeNumber'> Episode Nr."+anime.most_likely_media.episode_number+"</span>"+
				"<span class='description'>"+anime.most_likely_media.description+"</span>"+
			"</div>"+
			"</a>"+
		"</li>";
		document.getElementById("all").innerHTML += element;
		if(anime.most_likely_media.playhead >= anime.most_likely_media.duration){
			document.getElementById("done").innerHTML += element;
		}else{
			if(anime.most_likely_media.playhead > 0 || anime.most_likely_media.episode_number != 1){
				document.getElementById("watching").innerHTML += element;
			}else{
				document.getElementById("unseen").innerHTML += element;
			}
		}
	}
	var t1 = performance.now();
	console.log("Queue loaded! ("+result.animes.length+" items, "+(t1-t0)+"ms)");
	console.log("----------Crunchysync Contentscript v" + manifestData.version + "----------");
});

function changeTab(selected){
	document.getElementsByClassName("main-tabs")[0].children[0].classList.remove("selected");
	document.getElementsByClassName("main-tabs")[0].children[1].classList.remove("selected");
	document.getElementsByClassName("main-tabs")[0].children[2].classList.remove("selected");
	document.getElementsByClassName("main-tabs")[0].children[3].classList.remove("selected");
	document.getElementById("sortable").children[0].hidden = true;
	document.getElementById("sortable").children[1].hidden = true;
	document.getElementById("sortable").children[2].hidden = true;
	document.getElementById("sortable").children[3].hidden = true;
	document.getElementsByClassName("main-tabs")[0].children[selected].classList.add("selected");
	document.getElementById("sortable").children[selected].hidden = false;
}
