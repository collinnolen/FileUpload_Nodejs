var dbController = require('./fileUploadDBController');
var bodyParser = require('body-parser');
var upload = require('express-fileupload');

var urlencodedParser = bodyParser.urlencoded({extended: false});

module.exports = function(app){

  app.use(upload());

  app.get('/fileupload', function(req, res){
    dbController.getFilesInfo(function(err, data){
      res.render('fileUploadViews/fileHome', {files:data});
    });
  });


  app.post('/fileupload', function(req, res){
    if(req.files || req.files != undefined){
      //uploads files to the server.
      dbController._gridfsUploadFiles(req.files.file, function(err){
        if(err) console.log(err);
        else{
          //writes files from server to the database
          dbController._gridfsWrite(function(err){
            if(err) console.log('error');
            dbController.getFilesInfo(function(err, data){
              dbController.getFilesInfo(function(err, data){
                if(err) res.send('error getting file info.');
                else res.send({files:data});
              });
            });
          });
        }//end else
      });
    }
  });


  app.delete('/fileupload/:id', function(req, res){
    var _id = req.params.id;
    dbController._gridfsDelete(_id, function(err){
      if(err) res.send(err);
      else res.json('success');
    });
  });


  app.post('/fileupload/download/:id',  function(req, res){
    var _id = req.params.id;
    var _data;
    dbController._gridfsCheckFileExists(_id, function(err, found_file, data){
      _data = data;
      if(err) res.send("Error has occured.");
      else if(found_file){ //file found
        dbController._gridfsGetFileReadstream(_id, function(err, file_readstream){
          if(err) res.send('Error occured while downloading file from server.');
          else{
            res.writeHead(200, {
              'Content-Disposition': 'attachment; filename='+ _data.filename,
              'Content-Type': 'application/download',
              'Content-Length': _data.length
            });
            file_readstream.pipe(res);
            file_readstream.on('finish', function(){
              res.end();
            });
          }//end else
        });
      }
      else{ //File not found
        res.send("file doesnt exists");
      }
    });
  });


  //prevents no icon 404
  app.get('/favicon.ico', function(req, res) {
      res.status(204);
  });

};
