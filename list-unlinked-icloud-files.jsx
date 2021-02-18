/**
 * Creates the copy / pastable command to trigger icloud downloads.
 */
var links = app.activeDocument.links;
var invalids = []
for (var i = 0; i < links.length; i++ ){
    if( links[i].status == LinkStatus.LINK_MISSING ) {
        invalids.push( links[i] )
    }
}

var paths = ["Copy the message to terminal."]

for (var i = 0; i < invalids.length; i++ ){
    var p = invalids[i].filePath.replace(/\:/g, '/').replace('Macintosh HD - Data', '')
    var last = p.split('/').pop()
    var modified = '.' + last + '.icloud'
    paths.push( 'brctl download "' + p + '"')
}

alert(paths.join('\n'))