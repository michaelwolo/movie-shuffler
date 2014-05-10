window.addEventListener('load',home,false);
function $(el) {
	return document.getElementById(el);
}
function elem(type, id, classes) {
	var el = document.createElement(type);
	if (id)
		el.setAttribute('id',id);
	if (classes) {
		for (var i = 0; i < classes.length; i++) {
			el.classList.add(classes[i]);
		}
	}
	return el;
}
function append(el, array) {
	for (var i = 0; i < array.length; i++) {
		el.appendChild(array[i]);
	}
	return el;
}
function prefixEvent(el, type, callback, remove) {
	var pfx = ["webkit", "moz", "MS", "o", ""];
	for (var i = 0; i < pfx.length; i++) {
		if (!pfx[i])
			type = type.toLowerCase();
		if (remove)
			el.removeEventListener(pfx[i]+type, callback, false);
		else
			el.addEventListener(pfx[i]+type, callback, false);
		// prefixEvent(el, "AnimationStart", AnimationListener);
		// prefixEvent(el, "AnimationIteration", AnimationListener);
		// prefixEvent(el, "AnimationEnd", AnimationListener);
	}
}
function activate(e) {
	var submit = $('submit')
	  , tagline = $('tagline')
	  , active = document.querySelectorAll('.active');
	e.target.classList.remove('tag');
	e.target.classList.add('active');
	e.target.removeEventListener('click',activate,false);
	e.target.addEventListener('click',deactivate,false);
	// if (!submit.classList.contains('popping'))
	// 	submit.classList.add('popping');
	if (!active.length) {
		if (/\bothers\b/.test(tagline.innerHTML))
			changeText(tagline, 'Submit your tags when you\'re ready.');
		else
			changeText(tagline, 'Submit your tags by clicking the button below.');
	}
}
function deactivate(e) {
	var tagline = $('tagline')
	  , active = document.querySelectorAll('.active');
	e.target.classList.remove('active');
	e.target.classList.add('tag');
	e.target.removeEventListener('click',deactivate,false);
	e.target.addEventListener('click',activate,false);
	if (active.length === 1) {
		if (/\bbelow\b/.test(tagline.innerHTML))
			changeText(tagline, 'Find movies that match your interests.');
		else
			changeText(tagline, 'Tag this movie for others to discover.');
	}
}
function changeText(el, text) {
	el.setAttribute('class','fadeout-line');
	prefixEvent(el,'AnimationEnd',fadein);
	function fadein(e) {
		el.innerHTML = text;
		el.setAttribute('class','fadein-line');
		prefixEvent(el,'AnimationEnd',remove);
	}
}
function suggest(e) {
	var centre = $('centre')
	  , wrap = elem('div','wrap',['fadein-wrap'])
	  , h1 = elem('h1')
	  , title = document.createTextNode('Suggest Your Favorites!')
	  , input = elem('input','term')
	  , a = elem('a','search')
	  , ul = elem('ul','results')
	  , nom = $('nominate');
	prefixEvent(wrap,'AnimationEnd',remove);
	input.setAttribute('type','text');
	input.setAttribute('placeholder','Search for movies');
	input.addEventListener('keypress',searchEnter,false);
	a.addEventListener('click',searchTerm,false);
	append(wrap,[append(h1,[title]),input,a,ul]);
	centre.classList.add('fadeout-centre');
	prefixEvent(centre,'AnimationEnd', function () {
		changeUp(centre, wrap, nom, suggest, home, 'Return to Shuffler', input);
	});
}
function home(e) {
	e.target.removeEventListener('click',home,false);
	request('POST','scripts/tags.php',null,callback);
	function callback(request) {
		if (request.readyState === 4) {
			var tags = JSON.parse(request.responseText)
			  , total = 17
			  , wrap = $('wrap')
			  , cent1 = $('centre')
	  		, centre = elem('div','centre',['fadein-centre'])
	  		, header = elem('div',null,['header'])
	  		, logo = elem('div',null,['logo'])
	  		, h1 = elem('h1','tagline')
	  		, tagline = document.createTextNode('Find movies that match your interests.')
	  		, tagbox = elem('div','tagbox')
	  		, ul = elem('ul','list')
	  		, buttons = elem('div',null,['buttons'])
	  		, submit = elem('a','submit',['button'])
	  		, get = document.createTextNode('Get Movie')
	  		, nom = $('nominate')
	  		, array = [];
			prefixEvent(centre,'AnimationEnd',remove);
			submit.addEventListener('click',getMovie,false);
			for (var i = 0; i < total; i++) {
				array.push(tags[i]);
			}
			balance(array, ul, tagbox);
			append(centre,[append(header,[logo]), append(h1,[tagline]), append(tagbox,[ul]), append(buttons,[append(submit,[get])])]);
			if (wrap) {
				wrap.className = "fadeout-wrap";
				prefixEvent(wrap,'AnimationEnd', function () {
					changeUp(wrap, centre, nom, home, suggest, 'Suggest Movies');
				});
			} else if (!cent1.firstChild) {
				changeUp(cent1, centre, nom, home, suggest, 'Suggest Movies');
			} else {
				cent1.className = "fadeout-centre";
				prefixEvent(cent1,'AnimationEnd', function () {
					changeUp(cent1, centre, nom, home, suggest, 'Suggest Movies');
				});
			}
		}
	}
}
function changeUp(rid, add, nom, f1, f2, text, input) {
	rid.parentNode.removeChild(rid);
	nom.innerHTML = text;
	nom.removeEventListener('click',f1,false);
	nom.addEventListener('click',f2,false);
	append(document.body,[add]);
	if (input && !/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
		input.focus();
}
function remove(e) {
	if (e.target.tagName.toLowerCase() === 'a') {
		e.target.classList.remove("popping");
	} else {
		e.target.removeAttribute('class');
	}
	prefixEvent(e.target,'AnimationEnd',remove,true);
}
function searchEnter(e) {
	if (e.keyCode === 13) {
		searchTerm(e);
	}
}
function searchTerm(e) {
	var searchTerm = $('term').value
	  , results = $('results')
	  , info = 'search=' + searchTerm;
	if (searchTerm) {
		request('POST','scripts/search.php',info,movies);
		$('term').value = '';
	}
}
function movies(request) {
	if (request.readyState === 4) {
		var movies = JSON.parse(request.responseText)
		  , ranked = objectSort(movies, 'rating'); // Fix "Frozen" Issue
		while (results.firstChild) {
			results.removeChild(results.firstChild);
		}
		for (var i = 0; i < ranked.length; i++) {
			if (ranked[i].rating > 0) {
				var title = ranked[i].title
			    , year = ranked[i].year
			    , poster = ranked[i].poster;
			  if (!(title.toLowerCase().indexOf('director\'s cut') > -1)) // Fix "Donnie Darko" Issue
					addResult(title, year, poster);
			}
		}
	}
}
function objectSort(array, key) {
  return array.sort(function(b, a) {
    var x = a[key]; var y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}
function request(type, path, data, callback){
	var request = new XMLHttpRequest; 
	request.onreadystatechange = function(){callback(request)};
	request.open(type,path,true); 
	request.setRequestHeader("Content-type","application/x-www-form-urlencoded"); 
	request.send(data);
}
function addResult(t, y, p) {
	var li = elem('li')
		, post = elem('div',null,['poster'])
		, info = elem('div',null,['info'])
		, img = elem('img')
	  , h2 = elem('h2')
	  , h3 = elem('h3')
	  , a = elem('a',null,['choice'])
	  , nom = document.createTextNode('Nominate')
	  , title = document.createTextNode(t)
	  , year = document.createTextNode('Release Year: ' + y);
	img.setAttribute('src',p);
	a.addEventListener('click',selectChoice,false);
	append($('results'),[append(li,[append(post,[img]),append(info,[append(h2,[title]),append(h3,[year]),append(a,[nom])])])]);
}
function selectChoice(e) {
	var wrap = $('wrap')
	  , h1 = elem('h1','info')
	  , mov = document.createTextNode(((e.target.previousSibling).previousSibling).innerHTML +
			' (' + (e.target.previousSibling).innerHTML.slice(-4) + ')')
	  , h2 = elem('h2','tagline')
	  , tagline = document.createTextNode('Tag this movie for others to discover.')
	  , tagbox = elem('div','tagbox')
	  , ul = elem('ul','list')
	  , buttons = elem('div',null,['buttons'])
	  , button = elem('a','submit',['button'])
	  , tag = document.createTextNode('Tag Movie');
	button.addEventListener('click',nominateMovie,false);
	while (wrap.firstChild) {
		wrap.removeChild(wrap.firstChild);
	}
	append(wrap,[append(h1,[mov]),append(h2,[tagline]),append(tagbox,[ul]),append(buttons,[append(button,[tag])])]);
	request('POST','scripts/tags.php',null,callback);
	function callback(request) {
		if (request.readyState === 4) {
			var tags = JSON.parse(request.responseText);
			for (var i = 0; i < tags.length; i++) {
				addTag(tags[i], ul);
			}
		}
	}
}
function balance(array, ul, tagbox, kept) {
	var result = []
	  , shortest = []
	  , longest = []
	  , num = 0
	  , total = 0
	  , avg = 0;
  for (var i = 0; i < array.length; i++) {
		total += array[i].length;
	}
	if (kept) {
		for (var i = 0; i < kept.length; i++) {
			total += kept[i].length;
		}
		avg = total / (array.length + kept.length);
	} else {
		avg = total / array.length;
	}
	console.log(avg);
	if (tagbox.hasAttribute('style'))
		tagbox.removeAttribute('style');
	if (window.innerWidth > 688 && avg < 7.5)
		tagbox.style.width = Math.round(100-9*(7.5-avg))+'%';
  num = Math.floor(array.length / 2);
	shortest = [].concat((array.sort(function (a, b) { return a.length - b.length; })).splice(0,num));
  while (shortest.length || array.length) {
    if (shortest.length)
      result.push(extractRandom(shortest));
    if (array.length)
      result.push(extractRandom(array));
  }
	for (var i = 0; i < result.length; i++) {
		addTag(result[i], ul);
	}
	addShuffler(ul).addEventListener('click',shuffle,false);
}
function extractRandom(arr) {
  var index = Math.floor(Math.random() * arr.length)
    , result = arr[index];
  arr.splice(index, 1);
  return(result);
}
function addTag(t, ul, active) {
	var tag = document.createTextNode(t)
	  , li = elem('li');
	if (active) {
		var a = elem('a',null,['active']);
		a.addEventListener('click',deactivate,false);
	} else {
		var a = elem('a',null,['tag']);
		a.addEventListener('click',activate,false);
	}
	append(ul,[append(li,[append(a,[tag])])]);
}
function addShuffler(ul) {
	var shuffle = elem('a',null,['shuffle'])
	  , li = elem('li');
	append(li,[append(ul,[shuffle])]);
	return shuffle;
}
function shuffle(e) {
	var tags = document.querySelectorAll('.tag')
	  , active = document.querySelectorAll('.active')
	  , ul = $('list')
	  , tagbox = $('tagbox')
	  , keep = []
	  , leave = []
	  , newTags = [];
	[].forEach.call(tags, function (tag) {
		leave.push(tag.innerText || tag.textContent);
	});
	[].forEach.call(active, function (tag) {
		keep.push(tag.innerText || tag.textContent);
	});
	request('POST','scripts/tags.php',null,callback);
	function callback(request) {
		if (request.readyState === 4) {
			var tags = JSON.parse(request.responseText);
			for (var i = 0; i < leave.length; i++) {
				tags.splice(tags.indexOf(leave[i]),1);
			}
			for (var i = 0; i < keep.length; i++) {
				tags.splice(tags.indexOf(keep[i]),1);
			}
			while (ul.firstChild) {
				ul.removeChild(ul.firstChild);
			}
			for (var i = 0; i < keep.length; i++) {
				addTag(keep[i], ul, true);
			}
			for (var i = 0; i < (17-keep.length); i++) {
				newTags.push(tags[i]);
			}
			balance(newTags, ul, tagbox, keep);
			append(tagbox,[ul]);
		}
	}
}
function nominateMovie(e) {
	var  t = 'title='
	  , info = (($('info')).innerHTML)
	  , title = encodeURIComponent(info.substring(0, info.indexOf(' (')))
	  , y = '&year='
	  , year = info.substring(info.length-5,info.length-1)
	  , tags = '&tags='
	  , array = []
	  , active = document.querySelectorAll('.active')
	  , wrap = $('wrap')
	  , loading = setTimeout(function () {
	  		if (e.target) {
	  			e.target.style.width = e.target.offsetWidth+'px';
	  	    e.target.innerHTML = 'Loading..';
	  		}
	    }, 600);
	[].forEach.call(active, function (tag) {
		array.push(tag.innerHTML);
	});
	request('POST','scripts/nomination.php',t+title+y+year+tags+array.join(','),callback);
	function callback(request) {
		if (request.readyState === 4) {
			var response = request.responseText;
			if (response === 'Error') {
				console.log('Hmm. Something fishy is going on.');
			} else {
				var json = JSON.parse(response)
			    , wrap = $('wrap')
			    , centre = elem('div','centre',['fadein-centre'])
			    , h1 = elem('h1',null,['title'])
			    , title = document.createTextNode(json.title+' ('+json.year+')')
			    , video = elem('div',null,['video'])
			    , contain = elem('div',null,['video-container'])
			    , iframe = elem('iframe')
			    , p = elem('p')
			    , buttons = elem('div',null,['buttons'])
			    , again = elem('a','back',['button'])
			    , againText = document.createTextNode('Make Another Suggestion')
			    , thanks = document.createTextNode('Thanks! Enjoy the trailer.');
			  iframe.setAttribute('src','http://www.youtube.com/embed/'+json.trailer+'?rel=0&showinfo=0');
				iframe.setAttribute('frameborder',0);
				iframe.setAttribute('allowfullscreen','');
				again.addEventListener('click',suggest,false);
				prefixEvent(centre,'AnimationEnd',remove);
				wrap.classList.add('fadeout-wrap');
				prefixEvent(wrap,'AnimationEnd', function () {
					wrap.parentNode.removeChild(wrap);
					append(document.body,[append(centre,[append(h1,[title]),append(video,[append(contain,[iframe])]),append(p,[thanks]),append(buttons,[append(again,[againText])])])]);
				});
			}
		}
	}
}
function getMovie(e) {
	var active = document.querySelectorAll('.active')
	  , array = []
	  , loading = setTimeout(function () {
	  		if (e.target) {
	  			e.target.style.width = e.target.offsetWidth+'px';
	  	    e.target.innerHTML = 'Loading..';
	  		}
	    }, 600);
	e.target.removeEventListener('click',getMovie,false);
	[].forEach.call(active, function (tag) {
		array.push(tag.innerHTML);
	});
	request('POST','scripts/suggestion.php','tags='+array.join(','),movieback);
}
function movieback(req) {
	if (req.readyState === 4) {
		var json = JSON.parse(req.responseText)
		  , centre = $('centre')
		  , suggest = elem('div','centre',['fadein-centre'])
		  , h1 = elem('h1',null,['title'])
		  , title = document.createTextNode(json.title+' ('+json.year+')')
		  , video = elem('div',null,['video'])
		  , contain = elem('div',null,['video-container'])
		  , iframe = elem('iframe')
		  , p = elem('p')
		  , buttons = elem('div',null,['buttons'])
		  , back = elem('a','back',['button'])
		  , backText = document.createTextNode('Return to Shuffler')
		  , again = elem('a','again',['button'])
		  , againText = document.createTextNode('Show Another')
		  , rating = document.createTextNode(json.rating+'% liked this movie on Rotten Tomatoes.')
			, tags = json.tags;
		iframe.setAttribute('src','http://www.youtube.com/embed/'+json.trailer+'?rel=0&showinfo=0');
		iframe.setAttribute('frameborder',0);
		iframe.setAttribute('allowfullscreen','');
		back.addEventListener('click',home,false);
		again.addEventListener('click', function another(e) {
			var loading = setTimeout(function () {
			  		if (e.target) {
			  			e.target.style.width = e.target.offsetWidth+'px';
			  	    e.target.innerHTML = 'Loading..';
			  		}
			    }, 600);
			again.removeEventListener('click',another,false);
			request('POST','scripts/suggestion.php','tags='+tags,movieback);
		}, false);
		prefixEvent(suggest,'AnimationEnd',remove);
		centre.classList.add('fadeout-centre');
		prefixEvent(centre,'AnimationEnd', function () {
			centre.parentNode.removeChild(centre);
			append(document.body,[append(suggest,[append(h1,[title]),append(video,[append(contain,[iframe])]),append(p,[rating]),append(buttons,[append(again,[againText]),append(back,[backText])])])]);
		});
	}
}