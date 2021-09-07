var links = app.activeDocument.hyperlinks;
// alert(links.length)
var prev = 'pan'
var next = ''
var subdomain = ''
var log = [];
for(var i = 0; i < links.length; i++) {
    var link = links[i]
    if ( link.destination instanceof HyperlinkURLDestination) {
        log.push(links[i].destination.destinationURL);
        var url = links[i].destination.destinationURL
        url = url.replace('?_=' + prev, '');
        if ( url.split('.')[0] != 'works' ) { url = url.replace(url.split('.')[0], 'https://works'); }
        if ( subdomain ) {
            url = url.replace('works.mnmly.com', subdomain + '.mnmly.com');
        } else {
            if (url.search(/com$/) > -1 ) {
                url = url.replace('.mnmly.com', '.mnmly.com?_=' + next);
            } else {
                url = url.replace('.mnmly.com/', '.mnmly.com/?_=' + next);
            }
        }
        links[i].destination.destinationURL = url
    }
}
