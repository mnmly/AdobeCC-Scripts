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

var paths = []
for (var i = 0; i < invalids.length; i++ ){
    var p = invalids[i].filePath.replace(/\:/g, '/').replace('Macintosh HD - Data', '')
    paths.push( p );
}

executeDownloadCommand(paths)

function executeDownloadCommand(paths) {
    var termfile = new File(File($.fileName).parent.fsName + '/download-command.term');
    var command = '';
    for ( var i = 0; i < paths.length; i++ ) {
        command += '/usr/bin/brctl download "' + paths[i] + '";';
        command += ' ';
    }
    alert(command)
    termfile.open('w');
    termfile.writeln(
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN"' +
                '"http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n' +
                '<plist version="1.0">\n' +
                    '<dict>\n' +
                        '<key>WindowSettings</key>\n' +
                    '<array>\n' +
                    ' <dict>\n' +
                    '<key>CustomTitle</key>\n' +
                    '<string>icloud download command</string>\n' +
                    '<key>ExecutionString</key>\n' +
                    '<string>' + command + '</string>\n' +
                    '</dict>\n' +
                    '</array>\n' +
                    '</dict>\n' +
                '</plist>\n');

    termfile.close();
    termfile.execute();
    termfile.remove();
}

alert('Starting Download from icloud')