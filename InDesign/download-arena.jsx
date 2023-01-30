#include ../third-party/restix/examples/lib/json2.js
#include ../third-party/restix/restix.jsx
#include ../.config

doc = app.activeDocument
folder = Folder(doc.filePath)

var testCase = "// Showing a resource";


function getArenaData(id) {
    var jsonFile = File(folder + "/arena-assets/" + id + '.json')
    var data
    if ( jsonFile.exists ) {
        jsonFile.open('r')
        data = JSON.parse(jsonFile.read())
        jsonFile.close()
    } else {
        var url = "https://api.are.na/v2/blocks/" + id + "?access_token=" + CONFIG['are.na'].accessToken
        var request = { "url": url }
        var response = restix.fetch(request)
        data = JSON.parse(response.body)
        jsonFile.encoding = 'UTF-8';
        jsonFile.open('w');
        jsonFile.write(response.body);
        jsonFile.close();
    }
    return data
}

function getArenaImage(id) {
    var data = getArenaData(id)
    var imageFile = File(folder + "/arena-assets/" + data.id + data.image.filename)
    if (!imageFile.exists) {
        var imageURL = data.image.original.url
        var request = { url: imageURL }
        var response = restix.fetchFile(request, imageFile)
    }
    return imageFile
}

for  (var i = 0; i < doc.allPageItems.length; i++) {
    var item = doc.allPageItems[i]
    var name = item.name
    var nameComponents = name.split('-')
    var arenaBlockID = nameComponents[1]

    // Image
    if (/^arena-/.test(name)) {
        if (item.graphics.length == 0) {
            item.place(getArenaImage(arenaBlockID))
        }
    }
    if (/^arena\./.test(name)) {
        var key = nameComponents[0].split('.')[1]
        item.contents = getArenaData(arenaBlockID)[key]
    }
}

// var testCase = "// Creating a resource";
// request = {
// 	url:"https://jsonplaceholder.typicode.com",
// 	command:"posts", 
// 	method:"POST",
	
// 	body: JSON.stringify({
//       title: 'foo',
//       body: 'bar',
//       userId: 1
//     }),

//     headers: [{name:"Content-type", value:"application/json; charset=UTF-8"}]
// }
// var response = restix.fetch(request);
// logResponse (response, testCase) ;


// var testCase = "// Updating a resource PUT";
// request = {
// 	url:"https://jsonplaceholder.typicode.com",
// 	command:"posts/1", 
// 	method:"PUT",
	
// 	body: JSON.stringify({
//  	id: 1,
//       title: 'foox',
//       body: 'barx',
//       userId: 1
//     }),

//     headers: [{name:"Content-type", value:"application/json; charset=UTF-8"}]
// }
// var response = restix.fetch(request);
// logResponse (response, testCase) ;


// var testCase = "// Updating a resource PATCH";
// request = {
// 	url:"https://jsonplaceholder.typicode.com",
// 	command:"posts/1", 
// 	method:"PATCH",
	
//     body: JSON.stringify({
//       title: 'foo'
//     }),

//     headers: [{name:"Content-type", value:"application/json; charset=UTF-8"} ]

// }
// var response = restix.fetch(request);
// logResponse (response, testCase) ;


// var testCase = "// Deleting a resource";
// request = {
// 	url:"https://jsonplaceholder.typicode.com",
// 	command:"posts/1", 
// 	method:"DELETE",
// }
// var response = restix.fetch(request);
// logResponse (response, testCase) ;

// var testCase = "// Filtering resources";
// request = {
// 	url:"https://jsonplaceholder.typicode.com",
// 	command:"posts?userId=1&id=7"
// }
// var response = restix.fetch(request);
// logResponse (response, testCase) ;

// var testCase = "// Fetch a file";
// var outFile = File(Folder.desktop + "/" + "restix_output_logo.png");
// if (outFile.exists) outFile.remove();
// request = {
// 	url:"https://www.publishingx.de/",
// 	command:"wp-content/uploads/2012/01/logo.png", 
// }
// var response = restix.fetchFile(request, outFile);
// logResponse (response, testCase) ;
// if (outFile.exists) {
// 	outFile.execute();
// 	$.writeln("Image downloaded");
// }
// else {
// 	$.writeln("Something went wrong");
// }



function logResponse (response, testCase) {
	// $.writeln(testCase + "  ----");
	// if (response.error) {
	// 	$.writeln("Response Error: " + response.error);
	// 	$.writeln("Response errorMsg: " + response.errorMsg);
	// }
	// $.writeln("Response HTTP Status: " + response.httpStatus);
	// $.writeln("Response Body: " + response.body);
    $.write(response.body)
}