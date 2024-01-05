// Load previous ID
if (app && app.activeScript) {
    var pathComponents = app.activeScript.toString().split('/')
    pathComponents.pop()
    var arenaAuthFile = File(pathComponents.join('/') + "/../.config")
    if (arenaAuthFile.exists) {
        arenaAuthFile.open('r')
        var txt = arenaAuthFile.read().replace('CONFIG =', '')
        CONFIG = JSON.parse(txt)
    } else {
        alert('.config not found. Private blocks will fail to load.\nPlease refer to https://github.com/mnmly/AdobeCC-Scripts#setting-up-access-token-for-arena and create .config file.')
        CONFIG = {
            "are.na": {
                "accessToken": ""
            }
        }
    }
}