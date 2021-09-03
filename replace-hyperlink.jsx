var links = app.activeDocument.hyperlinks;
// alert(links.length)
var prev = 'pan'
var next = ''
var log = [];
for(var i = 0; i < links.length; i++) {
    var link = links[i]
    if ( link.destination instanceof HyperlinkURLDestination) {
        log.push(links[i].destination.destinationURL);
        links[i].destination.destinationURL = links[i].destination.destinationURL.replace('?_=' + prev, '');
        if (links[i].destination.destinationURL.search(/com$/) > -1 ) {
            links[i].destination.destinationURL = links[i].destination.destinationURL.replace('.mnmly.com', '.mnmly.com?_=' + next);
        } else {
            links[i].destination.destinationURL = links[i].destination.destinationURL.replace('.mnmly.com/', '.mnmly.com/?_=' + next);
        }
    }
}

// alert(log.join('\n'));
