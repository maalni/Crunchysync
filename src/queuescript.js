var manifestData = chrome.runtime.getManifest();
console.log("----------Crunchysync Contentscript v" + manifestData.version + "----------");
document.getElementsByTagName('head')[0].innerHTML +=
"<style>"+
	"progress{"+
		"-webkit-appearance: none;"+
		"background-color: rgba(0,0,0,0);"+
	"}"+
	"progress[value]::-webkit-progress-bar{"+
		"background-color: rgba(0,0,0,0);"+
	"}"+
	"progress[value]::-webkit-progress-value{"+
		"background-color: orange;"+
	"}"+
"</style>";
document.getElementById("sidebar_elements").innerHTML = "";
document.getElementById("sortable").innerHTML = "";
document.getElementById("sortable").innerHTML += "<div id='watching'></div>";
document.getElementById("sortable").innerHTML += "<div id='unseen' hidden></div>";
document.getElementById("sortable").innerHTML += "<div id='done' hidden></div>";
document.getElementById("sortable").innerHTML += "<div id='all' hidden></div>";
document.getElementsByClassName("main-tabs")[0].innerHTML = "";
document.getElementsByClassName("main-tabs")[0].innerHTML += "<a href='#watching' token='home-queue' class='left selected'>Watching</a>";
document.getElementsByClassName("main-tabs")[0].innerHTML += "<a href='#unseen' token='home-queue' class='left'>Unseen</a>";
document.getElementsByClassName("main-tabs")[0].innerHTML += "<a href='#done' token='home-queue' class='left'>Done</a>";
document.getElementsByClassName("main-tabs")[0].innerHTML += "<a href='#all' token='home-queue' class='left'>All</a>";
chrome.storage.local.get(["animes"], function(result) {
	for(var i in result.animes){
		var anime = result.animes[i];
		var element =
		"<li name=" + anime.most_likely_media.name + " style='position: relative; width: 960px; height: 150px; margin-bottom: 10px; border: none; border-radius: 5px; background-color: white; overflow: hidden;'>"+
			"<a href="+ anime.most_likely_media.url + " style='position: absolute; top: 0; left: 0; width: 960px; height: 150px;'>"+
			"<img src="+ anime.most_likely_media.screenshot_image.fwide_url + " style='position: absolute; top: 0; left: 0; width: auto; height: 150px; border: none;'>"+
			"<progress value=" + anime.most_likely_media.playhead + " max=" + anime.most_likely_media.duration + " style='position: absolute; bottom: 0; left: 0; width: 960px; height: 5px;'></progress>"+
			"<div>"+
				"<span id='animeTitle' style='position: absolute; top: 10px; left: 270px;'>" + anime.series.name + "</span>"+
				"<span id='episodeName' style='position: absolute; top: 30px; left: 270px;'>" + anime.most_likely_media.name + "</span>"+
				"<span id='episodeNumber' style='position: absolute; top: 50px; left: 270px;'> Episode Nr." + anime.most_likely_media.episode_number + "</span>"+
				"<span id='description' style='position: absolute; top: 70px; left: 270px;'>" + anime.most_likely_media.description + "</span>"+
			"</div>"+
			"</a>"+
		"</li>";
		document.getElementById("all").innerHTML += element;
		if(anime.most_likely_media.playhead >= anime.most_likely_media.duration){
			document.getElementById("done").innerHTML += element;
		}else{
			if(anime.most_likely_media.playhead > 0){
				document.getElementById("watching").innerHTML += element;
			}else{
				document.getElementById("unseen").innerHTML += element;
			}
		}
	}
});
console.log("Queue loaded!");
console.log("----------Crunchysync Contentscript v" + manifestData.version + "----------");
