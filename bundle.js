/* @ds-bundle: {"format":4,"namespace":"SLAYED","components":[{"name":"Button"},{"name":"IconButton"},{"name":"NavBar"},{"name":"Hero"},{"name":"SectionHeading"},{"name":"ServiceCard"},{"name":"BeforeAfter"},{"name":"TeamCard"},{"name":"CtaBand"},{"name":"Marquee"},{"name":"ContactSection"},{"name":"Footer"}]} */
(function(){
var R=window.React,h=R.createElement,F=R.Fragment;
function cx(){return Array.prototype.filter.call(arguments,Boolean).join(" ");}
function Photo(p){
  return p.src?h("img",{className:cx("sl-photo",p.tone&&"sl-tone-"+p.tone),src:p.src,alt:p.alt||""})
    :h("div",{className:cx("sl-photo sl-photo-ph",p.tone&&"sl-tone-"+p.tone),role:"img","aria-label":p.alt||"Photo"},h("span",null,p.alt||"Photo"));
}
function Logo(p){
  return p.logo?h("img",{className:"sl-logo-img",src:p.logo,alt:"SLAYED"}):h("span",{className:"sl-logo-text"},"SLAYED");
}
function Button(p){
  var v=p.variant||"dark",size=p.size||"md";
  var cls=cx("sl-btn","sl-btn-"+v,"sl-btn-"+size,p.className);
  var isLink=v==="link"||v==="linkOnDark";
  var arrow=h("span",{className:"sl-icon-arrow sl-btn-arrow","aria-hidden":"true"});
  var kids=isLink?h(F,null,h("span",{className:"sl-btn-text"},p.children),arrow):h(F,null,h("span",{className:"sl-btn-fill","aria-hidden":"true"}),h("span",{className:"sl-btn-label"},p.children));
  return p.href?h("a",{className:cls,href:p.href,onClick:p.onClick},kids):h("button",{type:p.type||"button",className:cls,onClick:p.onClick,disabled:p.disabled},kids);
}
function IconButton(p){
  var kids=p.arrow?h("span",{className:cx("sl-icon-arrow sl-iconbtn-arrow",p.arrow==="left"&&"sl-icon-arrow-left"),"aria-hidden":"true"}):p.children;
  return h("button",{type:"button",className:cx("sl-iconbtn","sl-iconbtn-"+(p.variant||"outline"),p.className),"aria-label":p.label,onClick:p.onClick},kids);
}
function NavBar(p){
  var links=p.links||["Services","Gallery","Our team","Contact"],dark=p.mode==="dark";
  var logo=dark&&p.logoOnDark?p.logoOnDark:p.logo;
  return h("header",{className:cx("sl-nav",dark?"sl-nav-dark":"sl-nav-light")},
    h("nav",{className:"sl-nav-links"},links.map(function(l){return h("a",{key:l,href:"#"},l);})),
    h("div",{className:"sl-nav-logo"},h(Logo,{logo:logo})),
    h("div",{className:"sl-nav-cta"},h(Button,{variant:dark?"light":"dark",href:p.ctaHref},p.cta||"Book online")));
}
function Hero(p){
  return h("section",{className:"sl-hero"},
    p.nav&&h("div",{className:"sl-hero-nav"},p.nav),
    h("div",{className:"sl-hero-shape","aria-hidden":"true"}),
    h("h1",{className:"sl-hero-h"},
      h("span",{className:"sl-hero-h1"},p.title||"Reveal your"),
      h("span",{className:"sl-hero-h2"},(p.titleOverlay||"style")+(p.titleEnd||".")),
      h("span",{className:"sl-hero-echo","aria-hidden":"true"},p.titleEcho!=null?p.titleEcho:((p.titleOverlay||"style").slice(-1)+(p.titleEnd||".")))),
    p.src&&h("img",{className:"sl-hero-photo",src:p.src,alt:p.alt||""}),
    h("p",{className:"sl-hero-desc"},p.subtitle||"Hair, nails, brows & lashes and more for every kind of you."),
    h("div",{className:"sl-hero-cta"},h(Button,{variant:"dark",href:p.primaryHref},p.primary||"Book online"),h(Button,{variant:"link",href:p.secondaryHref},p.secondary||"Explore services")),
    h("div",{className:"sl-hero-mouse","aria-hidden":"true"},h("span",{className:"sl-hero-mouse-dot"})),
    h("span",{className:"sl-hero-scroll-line","aria-hidden":"true"}),
    h("span",{className:"sl-hero-scroll-text"},p.scrollLabel||"Scroll to reveal"));
}
function SectionHeading(p){
  return h("div",{className:cx("sl-sh",p.align==="left"&&"sl-sh-left",p.onRed&&"sl-sh-onred")},
    p.eyebrow&&h("p",{className:"sl-eyebrow"},p.eyebrow),
    h("h2",{className:"sl-sh-title"},p.title));
}
function ServiceCard(p){
  var pos=p.bandPosition==="bottom"?"bottom":"top";
  var arrow=h("span",{className:"sl-icon-arrow sl-svc-arrow","aria-hidden":"true"});
  var f=p.photoFrame,fs=f?{"--ph-x":f.left+"px","--ph-y":f.top+"px","--ph-w":f.width+"px","--ph-h":f.height+"px"}:null;
  return h("a",{className:cx("sl-svc","sl-svc-"+pos,p.open&&"sl-svc-open"),href:p.href||"#"},
    h("div",{className:"sl-svc-photo",style:fs},h(Photo,{src:p.src,alt:p.alt||p.label})),
    h("div",{className:"sl-svc-band"},
      h("span",{className:"sl-svc-label"},p.label),
      h("div",{className:"sl-svc-detail"},h("span",{className:"sl-svc-title"},p.label),p.description&&h("span",{className:"sl-svc-desc"},p.description))),
    h("span",{className:"sl-svc-cta"},h("span",null,p.cta||"Explore"),arrow));
}
function BeforeAfter(p){
  var s=R.useState(p.initial==null?50:p.initial),pos=s[0],set=s[1];
  return h("div",{className:"sl-ba"},
    h("div",{className:"sl-ba-img"},h(Photo,{src:p.before,alt:"Before"})),
    h("div",{className:"sl-ba-img sl-ba-after",style:{clipPath:"inset(0 0 0 "+pos+"%)"}},h(Photo,{src:p.after,alt:"After",tone:p.before||p.after?null:"after"})),
    h("div",{className:"sl-ba-line",style:{left:pos+"%"}},h("span",{className:"sl-ba-handle"},h("span",{className:"sl-ba-chev sl-ba-chev-left","aria-hidden":"true"}),h("span",{className:"sl-ba-chev sl-ba-chev-right","aria-hidden":"true"}))),
    h("span",{className:"sl-ba-tag sl-ba-tag-before"},"Before"),
    h("span",{className:"sl-ba-tag sl-ba-tag-after"},"After"),
    h("input",{className:"sl-ba-range",type:"range",min:0,max:100,value:pos,"aria-label":"Compare before and after",onChange:function(e){set(+e.target.value);}}));
}
function TeamCard(p){
  var arrow=h("span",{className:"sl-icon-arrow sl-team-arrow","aria-hidden":"true"});
  return h("a",{className:cx("sl-team",p.open&&"sl-team-open"),href:p.href||"#"},
    h("div",{className:"sl-team-img"},h(Photo,{src:p.src,alt:p.alt||p.name})),
    h("div",{className:"sl-team-sheet","aria-hidden":"true"}),
    h("div",{className:"sl-team-shade","aria-hidden":"true"}),
    h("div",{className:"sl-team-fade","aria-hidden":"true"}),
    h("span",{className:"sl-team-name"},p.name),
    h("div",{className:"sl-team-info"},h("span",{className:"sl-team-info-name"},p.name),p.services&&h("span",{className:"sl-team-services"},p.services)),
    h("span",{className:"sl-team-cta"},h("span",null,p.cta||"Book now"),arrow));
}
function CtaBand(p){
  return h("section",{className:"sl-cta"},
    h(SectionHeading,{eyebrow:p.eyebrow||"Book a visit",title:p.title||"Your chair is waiting",onRed:true}),
    h("div",{className:"sl-cta-actions"},h(Button,{variant:"dark",href:p.primaryHref},p.primary||"Book a visit"),h("span",{className:"sl-cta-or"},"or"),h(Button,{variant:"link",href:p.secondaryHref},p.secondary||"Explore services")),
    p.chips&&h("div",{className:"sl-cta-chips"},p.chips.map(function(c){return h(Button,{key:c,variant:"outline",size:"sm"},c);})));
}
function Marquee(p){
  var items=p.items||["Tooth gems","Hair","Nails","Brows & lashes"],row=[];
  for(var r=0;r<3;r++)items.forEach(function(it,i){row.push(h("span",{key:r+"-"+i,className:"sl-mq-item"},it));row.push(h("span",{key:r+"-"+i+"s",className:"sl-mq-star","aria-hidden":"true"},"✦"));});
  return h("div",{className:"sl-mq"},h("div",{className:"sl-mq-track"},row));
}
function ContactSection(p){
  return h("section",{className:"sl-contact"},
    h("div",{className:"sl-contact-back","aria-hidden":"true"}),
    h("div",{className:"sl-contact-media"},h("div",{className:"sl-contact-photo"},h(Photo,{src:p.src,alt:p.alt||"The studio",tone:"mono"}))),
    h("div",{className:"sl-contact-body"},
      h(SectionHeading,{eyebrow:p.eyebrow||"Get in touch",title:p.title||"Stay connected",align:"left"}),
      p.intro&&h("p",{className:"sl-contact-intro"},p.intro),
      h("div",{className:"sl-contact-cols"},
        h("dl",null,(p.details||[]).map(function(d){return h(F,{key:d.label},h("dt",null,d.label),h("dd",null,d.href?h("a",{className:"sl-contact-link",href:d.href},d.value):d.value));})),
        h("dl",null,p.hours&&h(F,null,h("dt",null,"Hours"),p.hours.map(function(x,i){var o=typeof x==="string"?{text:x}:x;return h("dd",{key:i,className:"sl-contact-day"},o.text,o.note&&h("span",{className:"sl-contact-note"},o.note));})))),
      h(Button,{variant:"dark",href:p.ctaHref},p.cta||"Get in touch")));
}
var SOCIALS=[{icon:"youtube",label:"YouTube"},{icon:"x",label:"X"},{icon:"instagram",label:"Instagram"},{icon:"tiktok",label:"TikTok"}];
function FootList(p){
  return h("div",{className:"sl-foot-col"},h("p",{className:"sl-foot-label"},p.title),
    h("ul",{className:"sl-foot-list"},p.items.map(function(x){var o=typeof x==="string"?{label:x}:x;return h("li",{key:o.label},h("a",{href:o.href||"#"},o.label));})));
}
function Footer(p){
  var email=p.email||"hello@example.com",phone=p.phone||"+1 (902) 422-0000";
  return h("footer",{className:"sl-foot"},
    h("div",{className:"sl-foot-cols"},
      h("div",{className:"sl-foot-col sl-foot-col-socials"},h("p",{className:"sl-foot-label"},"Socials"),h("div",{className:"sl-foot-socials"},(p.socials||SOCIALS).map(function(s){var o=typeof s==="string"?{label:s}:s;var b=h(IconButton,{key:o.label,label:o.label,variant:"onDark"},o.icon?h("span",{className:"sl-social sl-social-"+o.icon,"aria-hidden":"true"}):o.label);return o.href?h("a",{key:o.label,href:o.href,className:"sl-foot-social-link","aria-label":o.label},b):b;}))),
      h(FootList,{title:"Explore",items:p.explore||["Home","Services","Gallery","Team","Contact"]}),
      h(FootList,{title:"Services",items:p.services||["Hair","Nails","Brows & lashes","Skin & waxing","Holistic"]}),
      h("div",{className:"sl-foot-contact"},
        h("div",{className:"sl-foot-group sl-foot-loc"},
          h("div",{className:"sl-foot-col"},h("p",{className:"sl-foot-label"},"Location"),h("p",{className:"sl-foot-detail"},p.address||"123 Main Street, Anytown, (ZIP)")),
          h(Button,{variant:"linkOnDark",href:p.directionsHref},"Get a direction")),
        h("div",{className:"sl-foot-group"},h("p",{className:"sl-foot-label"},"Email"),h("a",{className:"sl-foot-detail",href:"mailto:"+email},email)),
        h("div",{className:"sl-foot-group"},h("p",{className:"sl-foot-label"},"Call us"),h("a",{className:"sl-foot-detail",href:"tel:"+phone.replace(/[^+\d]/g,"")},phone)))),
    h("hr",{className:"sl-foot-rule"}),
    h("div",{className:"sl-foot-mark"},p.logo?h("img",{src:p.logo,alt:"SLAYED"}):h("span",null,"SLAYED")));
}
window.SLAYED=Object.assign(window.SLAYED||{},{Button:Button,IconButton:IconButton,NavBar:NavBar,Hero:Hero,SectionHeading:SectionHeading,ServiceCard:ServiceCard,BeforeAfter:BeforeAfter,TeamCard:TeamCard,CtaBand:CtaBand,Marquee:Marquee,ContactSection:ContactSection,Footer:Footer});
})();
