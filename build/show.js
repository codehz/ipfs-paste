// deno-fmt-ignore-file
// deno-lint-ignore-file
import * as pug from "https://deno.land/x/pug@v0.1.1/runtime.js";
  /**
   * Template function
   * generated from show.pug
   * 
   * @param {object} locals
   * @return {string}
   */
  export default function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;
    var locals_for_with = (locals || {});
    
    (function (files, hash) {
      pug_html = pug_html + "\u003C!DOCTYPE html\u003E\u003Chtml lang=\"en\"\u003E";
pug_mixins["css"] = pug_interp = function(url){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Clink" + (pug.attr("href", url, true, true)+" rel=\"stylesheet\" type=\"text\u002Fcss\"") + "\u003E";
};
pug_mixins["csslink"] = pug_interp = function(source){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_mixins["css"](`/static/${source}.css`);
};
pug_mixins["script"] = pug_interp = function(url){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Cscript" + (pug.attr("src", url, true, true)+pug.attr("defer", true, true, true)) + "\u003E\u003C\u002Fscript\u003E";
};
pug_mixins["jslink"] = pug_interp = function(source){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_mixins["script"](`/static/${source}.js`);
};
pug_html = pug_html + "\u003Cmeta charset=\"UTF-8\"\u003E\u003Cmeta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"\u003E\u003Cmeta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"\u003E\u003Clink rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"\u002Fstatic\u002Fapple-touch-icon.png\"\u003E\u003Clink rel=\"icon\" type=\"image\u002Fpng\" sizes=\"32x32\" href=\"\u002Fstatic\u002Ffavicon-32x32.png\"\u003E\u003Clink rel=\"icon\" type=\"image\u002Fpng\" sizes=\"16x16\" href=\"\u002Fstatic\u002Ffavicon-16x16.png\"\u003E\u003Clink rel=\"manifest\" href=\"\u002Fstatic\u002Fsite.webmanifest\"\u003E\u003Clink rel=\"mask-icon\" href=\"\u002Fstatic\u002Fsafari-pinned-tab.svg\" color=\"#5bbad5\"\u003E\u003Cmeta name=\"msapplication-TileColor\" content=\"#3498e0\"\u003E\u003Cmeta name=\"theme-color\" content=\"#3498e0\"\u003E\u003Cmeta name=\"color-scheme\" content=\"light dark\"\u003E";
pug_mixins["csslink"]("default");
pug_mixins["script"]("https://cdn.jsdelivr.net/npm/overlayscrollbars@1.13.1/js/OverlayScrollbars.min.js");
pug_mixins["css"]("https://cdn.jsdelivr.net/npm/overlayscrollbars@1.13.1/css/OverlayScrollbars.min.css");
pug_mixins["jslink"]("default");
pug_mixins["csslink"]("show");
pug_html = pug_html + "\u003Ctitle\u003EPaste " + (pug.escape(null == (pug_interp = hash) ? "" : pug_interp)) + "\u003C\u002Ftitle\u003E\u003Cheader\u003E\u003Cdiv class=\"panel panel-left\"\u003E\u003Cdiv class=\"title\"\u003EPaste\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"panel panel-right\"\u003E\u003Cdiv class=\"a-create\"\u003ECreate new paste\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fheader\u003E\u003Csection\u003E";
// iterate files
;(function(){
  var $$obj = files;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var item = $$obj[pug_index0];
if (item.type === "file") {
pug_html = pug_html + "\u003Cdiv class=\"card\"\u003E\u003Cdiv class=\"card-header\"\u003E\u003Cdiv class=\"filename\"\u003E" + (pug.escape(null == (pug_interp = item.filename) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Ccode class=\"card-body content\"\u003E" + (pug.escape(null == (pug_interp = item.content) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E\u003C\u002Fdiv\u003E";
}
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var item = $$obj[pug_index0];
if (item.type === "file") {
pug_html = pug_html + "\u003Cdiv class=\"card\"\u003E\u003Cdiv class=\"card-header\"\u003E\u003Cdiv class=\"filename\"\u003E" + (pug.escape(null == (pug_interp = item.filename) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Ccode class=\"card-body content\"\u003E" + (pug.escape(null == (pug_interp = item.content) ? "" : pug_interp)) + "\u003C\u002Fcode\u003E\u003C\u002Fdiv\u003E";
}
    }
  }
}).call(this);

pug_html = pug_html + "\u003C\u002Fsection\u003E\u003Cdiv class=\"placeholder\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Fhtml\u003E";
    }.call(this, "files" in locals_for_with ?
        locals_for_with.files :
        typeof files !== 'undefined' ? files : undefined, "hash" in locals_for_with ?
        locals_for_with.hash :
        typeof hash !== 'undefined' ? hash : undefined));
    ;;return pug_html;}