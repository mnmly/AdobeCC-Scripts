// Open a URL in the default web browser on macOS
function openURL(url) {
    var appleScript = 'tell application "System Events" to open location "' + url + '"';
    app.doScript(appleScript, ScriptLanguage.APPLESCRIPT_LANGUAGE);
  }

function copyToPateboard(text) {
    var command = 'do shell script "echo \\"" & "' + text + '\\" | pbcopy"';
    app.doScript(command, ScriptLanguage.APPLESCRIPT_LANGUAGE);
}
  
var doc = app.activeDocument
if (doc.selectedPageItems.length > 0) {

    var item = doc.selectedPageItems[0]
    var id = parseInt(item.name.split('-').pop(), 10)

    if( item.contentType == ContentType.GRAPHIC_TYPE && item.graphics.length > 0) {
        var idFromItem = parseInt(item.graphics[0].itemLink.name.replace(/\w{32}\.\w+$/, ''), 10)
        if ( id != idFromItem ) {
            var confirmed = confirm("The image is chnaged from the original image put in the frame, do you want to go to the source of the image?")
            if ( confirmed ) {
                item.name = 'arena-' + idFromItem
                id = idFromItem
            }
        }
    }

    copyToPateboard(id)
    if ( !isNaN(id) ) {
        openURL("https://are.na/block/" + id);
    }
}
