
var request = require('request');
var fs = require('fs-extra');
var config = require('./config.js')

var auth = {'auth': {
    'user': config.user,
    'pass': config.password,
    'sendImmediately': true}};


var baseUrl = "https://secure.doccle.be/doccle-euui";
var downloadQueue = [];


function downloadItem(){
    if(downloadQueue.length > 0){
                    var activeItem = downloadQueue[0];
        
                    console.log("(" + downloadQueue.length + ") downloading " + baseUrl + activeItem.url)
        
                    request.get(baseUrl + activeItem.url , auth)
                    .on('error', function(err) {
                        console.log(err)
                        })
                    .pipe(fs.createWriteStream(activeItem.destination))
                    .on('close', function(response) {
                            downloadQueue.splice(0, 1);
                            downloadItem();
                    });

    }
}



request.get(baseUrl + '/rest/v1/documents?lang=nl', auth
, function (err, res, body) {
            var result = require('querystring').parse(body)
            var json  = JSON.parse(body);
            
            for(var i = 0; i < json.documents.length;++i){
                console.log(json.documents[i].sender.label + "\t\t\t-\t" + json.documents[i].name);

                var dd = new Date(json.documents[i].creationDate);
                var datePrefex =  dd.getFullYear() + "_"  + (dd.getMonth()+1) + "_" + dd.getDate();
                var folder = "archive/" + json.documents[i].sender.label.replace(/\//g,'-');
                var url = json.documents[i].contentUrl;
                var destination = folder + "/" + datePrefex + "_" +  json.documents[i].name.replace(/\//g,'-') + ".pdf";
            
            
                fs.ensureDirSync(folder);
                downloadQueue.push({'url': url, 'destination': destination });
            }


            downloadItem();
    }
);


