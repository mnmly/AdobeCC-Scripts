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
    var id = parseInt(doc.selectedPageItems[0].name.split('-').pop(), 10)
    copyToPateboard(id)
    if ( !isNaN(id) ) {
        openURL("https://are.na/block/" + id);
    }
}
