window.onload = function () {
	// var tags = document.querySelectorAll('.tag');
	// [].forEach.call(tags, function (tag) {
	// 	tag.addEventListener('click',activate,false);
	// });
	request('POST','../new/scripts/tags.php',null,callback);
	function callback(request) {
		if (request.readyState === 4) {
			var tags = JSON.parse(request.responseText)
			  , tagbox = document.getElementById('tagbox')
			  , ul = document.getElementById('list')
			  , total = 17
			  , array = [];
			for (var i = 0; i < total; i++) {
				var tag = tags[i];
				array.push(tag);
			}
			balance(array, ul, tagbox);
		}
	}
	var nom = document.getElementById('nominate');
	nom.addEventListener('click',suggest,false);
	// var submit = document.getElementById('submit');
	// submit.addEventListener('click',animate,true);
};
function prefixEvent(element, type, callback, remove) {
	var pfx = ["webkit", "moz", "MS", "o", ""];
	for (var i = 0; i < pfx.length; i++) {
		if (!pfx[i])
			type = type.toLowerCase();
		if (remove)
			element.removeEventListener(pfx[i]+type, callback, false);
		else
			element.addEventListener(pfx[i]+type, callback, false);
		// prefixEvent(elem, "AnimationStart", AnimationListener);
		// prefixEvent(elem, "AnimationIteration", AnimationListener);
		// prefixEvent(elem, "AnimationEnd", AnimationListener);
	}
}
function activate(e) {
	var submit = document.getElementById('submit')
	  , tagline = document.getElementById('tagline')
	  , active = document.querySelectorAll('.active');
	e.target.classList.remove('tag');
	e.target.classList.add('active');
	e.target.removeEventListener('click',activate,false);
	e.target.addEventListener('click',deactivate,false);
	if (!submit.classList.contains('glowing'))
		submit.classList.add('glowing');
	if (!active.length) {
		changeText(tagline, 'Submit your tags to get a recommendation.');
	}
}
function deactivate(e) {
	var tagline = document.getElementById('tagline')
	  , active = document.querySelectorAll('.active');
	e.target.classList.remove('active');
	e.target.classList.add('tag');
	e.target.removeEventListener('click',deactivate,false);
	e.target.addEventListener('click',activate,false);
	if (active.length === 1) {
		changeText(tagline, 'Find movies that match your interests.');
	}
}
function changeText(elem, text) {
	elem.setAttribute('class','fadeout-line');
	prefixEvent(elem,'AnimationEnd',fadein);
	function fadein(e) {
		elem.innerHTML = text;
		elem.setAttribute('class','fadein-line');
		prefixEvent(elem,'AnimationEnd',remove);
	}
}
function suggest(e) {
	var centre = document.getElementById('centre')
	  , wrap = document.createElement('div')
	  , h1 = document.createElement('h1')
	  , title = document.createTextNode('Suggest Your Favorites!')
	  , input = document.createElement('input')
	  , a = document.createElement('a')
	  , ul = document.createElement('ul')
	  , nom = document.getElementById('nominate');
	wrap.setAttribute('id','wrap');
	wrap.setAttribute('class','fadein-wrap');
	prefixEvent(wrap,'AnimationEnd',remove);
	h1.appendChild(title);
	input.setAttribute('type','text');
	input.setAttribute('id','term');
	input.setAttribute('placeholder','Search for movies');
	input.addEventListener('keypress',searchEnter,false);
	a.setAttribute('id','search');
	a.addEventListener('click',searchTerm,false);
	ul.setAttribute('id','results');
	wrap.appendChild(h1);
	wrap.appendChild(input);
	wrap.appendChild(a);
	wrap.appendChild(ul);
	centre.classList.add('fadeout-centre');
	function fadein(e) {
		e.target.parentNode.removeChild(e.target);
		nom.innerHTML = 'Return to Shuffler';
		nom.removeEventListener('click',suggest,false);
		nom.addEventListener('click',home,false);
		document.body.appendChild(wrap);
		if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
			input.focus();
		}
	}
	prefixEvent(centre,'AnimationEnd',fadein);
}
function home(e) {
	request('POST','../new/scripts/tags.php',null,callback);
	console.log('AJAX call was sent, show loading image.')
	function callback(request) {
		if (request.readyState === 4) {
			var tags = JSON.parse(request.responseText)
			  , total = 17
			  , wrap = document.getElementById('wrap')
	  		, centre = document.createElement('div')
	  		, header = document.createElement('div')
	  		, logo = document.createElement('div')
	  		, h1 = document.createElement('h1')
	  		, tagline = document.createTextNode('Find movies that match your interests.')
	  		, tagbox = document.createElement('div')
	  		, ul = document.createElement('ul')
	  		, buttons = document.createElement('div')
	  		, submit = document.createElement('a')
	  		, get = document.createTextNode('Get Movie')
	  		, nom = document.getElementById('nominate')
	  		, array = [];
	  	centre.setAttribute('id','centre');
			centre.setAttribute('class','fadein-centre');
			prefixEvent(centre,'AnimationEnd',remove);
			header.setAttribute('class','header');
			logo.setAttribute('class','logo');
			tagbox.setAttribute('id','tagbox');
			ul.setAttribute('id','list');
			for (var i = 0; i < total; i++) {
				var tag = tags[i];
				array.push(tag);
			}
			balance(array, ul, tagbox);
			tagbox.appendChild(ul);
			buttons.setAttribute('class','buttons');
			submit.setAttribute('id','submit');
			submit.setAttribute('class','button');
			submit.appendChild(get);
			buttons.appendChild(submit);
			h1.setAttribute('id','tagline');
			h1.appendChild(tagline);
			header.appendChild(logo);
			centre.appendChild(header);
			centre.appendChild(h1);
			centre.appendChild(tagbox);
			centre.appendChild(buttons);
			wrap.className = "fadeout-wrap";
			function fadein(e) {
				e.target.parentNode.removeChild(e.target);
				nom.innerHTML = 'Suggest Movies';
				nom.removeEventListener('click',home,false);
				nom.addEventListener('click',suggest,false);
				document.body.appendChild(centre);
			}
			prefixEvent(wrap,'AnimationEnd',fadein);
		}
	}
}
function remove(e) {
	e.target.removeAttribute('class');
	prefixEvent(e.target,'AnimationEnd',remove,true);
}
function searchEnter(e) {
	if (e.keyCode === 13) {
		searchTerm(e);
	}
}
function searchTerm(e) {
	var searchTerm = document.getElementById('term').value
	  , results = document.getElementById('results')
	  , info = 'search=' + searchTerm;
	if (searchTerm) {
		request('POST','../scripts/search.php',info,callback);
		document.getElementById('term').value = '';
		function callback(request) {
			if (request.readyState === 4) {
				var movies = request.responseXML.getElementsByTagName("movie");
				while (results.firstChild) {
					results.removeChild(results.firstChild);
				}
				for (var i = 0; i < movies.length; i++) {
					var title = request.responseXML.getElementsByTagName("title")[i].firstChild.nodeValue
					  , year = request.responseXML.getElementsByTagName("year")[i].firstChild.nodeValue
					  , poster = request.responseXML.getElementsByTagName("poster")[i].firstChild.nodeValue;
					addResult(title, year, poster);
				}
			}
		}
	}
}
function request(type, path, data, callback){
	var request = new XMLHttpRequest; 
	request.onreadystatechange = function(){callback(request)};
	request.open(type,path,true); 
	request.setRequestHeader("Content-type","application/x-www-form-urlencoded"); 
	request.send(data);
}
function addResult(t, y, p) {
	var li = document.createElement('li')
		, post = document.createElement('div')
		, info = document.createElement('div')
		, img = document.createElement('img')
	  , h2 = document.createElement('h2')
	  , h3 = document.createElement('h3')
	  , a = document.createElement('a')
	  , nom = document.createTextNode('Nominate')
	  , title = document.createTextNode(t)
	  , year = document.createTextNode('Release Year: ' + y);
	post.appendChild(img);
	post.setAttribute('class','poster');
	img.setAttribute('src',p);
	h2.appendChild(title);
	h3.appendChild(year);
	a.setAttribute('class','choice');
	a.addEventListener('click',nomination,false);
	a.appendChild(nom);
	info.appendChild(h2);
	info.appendChild(h3);
	info.appendChild(a);
	info.setAttribute('class','info');
	li.appendChild(post);
	li.appendChild(info);
	document.getElementById('results').appendChild(li);
}
function nomination(e) {
	var wrap = document.getElementById('wrap')
	  , h1 = document.createElement('h1')
	  , mov = document.createTextNode(((e.target.previousSibling).previousSibling).innerHTML +
			' (' + (e.target.previousSibling).innerHTML.slice(-4) + ')')
	  , tagbox = document.createElement('div')
	  , ul = document.createElement('ul')
	  , buttons = document.createElement('div')
	  , button = document.createElement('a');
	console.log(mov);
	h1.appendChild(mov);
	tagbox.setAttribute('id','tagbox');
	ul.setAttribute('id','list');
	tagbox.appendChild(ul);
	buttons.setAttribute('class','buttons');
	button.setAttribute('class','button');
	button.setAttribute('id','submitnom');
	buttons.appendChild(button);
	while (wrap.firstChild) {
		wrap.removeChild(wrap.firstChild);
	}
	wrap.appendChild(h1);
	wrap.appendChild(tagbox);
	wrap.appendChild(buttons);
	request('POST','../scripts/tags.php',null,callback);
	console.log('AJAX call was sent, show loading image.')
	function callback(request) {
		if (request.readyState === 4) {
			var tags = JSON.parse(request.responseText);
			for (var i = 0; i < tags.length; i++) {
				var tag = tags[i];
				addTag(tag);
			}
		}
	}
}
function balance(array, ul, tagbox) {
	var result = []
	  , shortest = []
	  , longest = []
	  , num = 0
	  , total = 0
	  , avg = 0;
	function extractRandom(arr) {
    var index = Math.floor(Math.random() * arr.length)
      , result = arr[index];
    arr.splice(index, 1);
    return(result);
  }
  num = Math.ceil(array.length / 2);
	shortest = [].concat((array.sort(function (a, b) { return a.length - b.length; })).slice(0,num));
	longest = [].concat((array.sort(function (a, b) { return b.length - a.length; })).slice(0,num-1));
  while (shortest.length || longest.length) {
    if (shortest.length)
      result.push(extractRandom(shortest));
    if (longest.length)
      result.push(extractRandom(longest));
  }
	for (var i = 0; i < array.length; i++) {
		total += array[i].length;
	}
	avg = total / array.length;
	console.log(avg);
	if (window.innerWidth > 688) {
		if (avg < 8.0)
			tagbox.style.width = "99%";
		if (avg < 7.5)
			tagbox.style.width = "97%";
		if (avg < 7.2)
			tagbox.style.width = "95%";
		if (avg < 6.8)
			tagbox.style.width = "93%";
		if (avg < 6.5)
			tagbox.style.width = "91%";
		if (avg < 6.2)
			tagbox.style.width = "89%";
	}
	for (var i = 0; i < result.length; i++) {
		addTag(result[i], ul);
	}
}
function addTag(t, ul) {
	var tag = document.createTextNode(t)
	  , li = document.createElement('li')
	  , a = document.createElement('a');
	a.setAttribute('class','tag');
	a.addEventListener('click',activate,false);
	a.appendChild(tag);
	li.appendChild(a);
	ul.appendChild(li);
}