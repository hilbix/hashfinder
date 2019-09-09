// <div id="main">Please enable JavaScript!  Bitte JavaScript einschalten!</div>
// <script src="onready.js"></script></body></html> ensures:
// - this is the last thing loaded
// - DOM is ready
// Based on an idea presented in https://gist.github.com/shesek/441c02cf1f094c36f57a

;(function(){
  var list=window.onready;
  window.onready = { push: function(fn) { window.setTimeout(fn) } };
  if (typeof list=='function') list=[list];
  if (list) for (var i=0; i<list.length; i++) window.setTimeout(list[i]);
  else window.document.getElementById('main').innerHTML='JavaScript version not compatible (or loading error)!  <b>Sorry!</b>  Inkompatible JavaScript-Version (oder Ladefehler)!';
})();

