var upload = require('express-fileupload');
var mongoose = require('mongoose');
var grid = require('gridfs-stream');
var fs = require('fs');
var async = require('async');

var conn = mongoose.createConnection('mongodb://test:test1@ds031581.mlab.com:31581/nodejs_db', {useMongoClient: true});

  module.exports.getFilesInfo = function(callback){
    conn.openUri('mongodb://test:test1@ds031581.mlab.com:31581/nodejs_db',function (err) {
      var gfs = grid(conn.db, mongoose.mongo);
      gfs.files.find().toArray(function (err, data){
        if(err) callback('No data');
        callback(null, data);
      });
    });
  }


  // Uses GRID for mongodb for file large file storage.
  module.exports._gridfsWrite = function(callback){
    fs.readdir('uploads', (err, files) =>{
      //Opens the connection to the database.
      conn.openUri('mongodb://test:test1@ds031581.mlab.com:31581/nodejs_db', function (err) {
        if(err) throw err;
        var gfs = grid(conn.db, mongoose.mongo);
        // Goes through each file in the uploads directory and uploads it to the database.
        async.each(files,
          //funciton being passed in
          function(file, callback){
            //write to database.
            var writestream = gfs.createWriteStream({
              filename: file
            });
            fs.createReadStream('uploads/' + file).pipe(writestream);
            // Deletes the files in the uploads folder after moved to the database.
            writestream.on('finish', function(){
                removeFilefromDir('uploads/', file, function(err){
                  if(err) callback(err);
                  else callback(null);
                });
            });
          }, //end function being passed in
          //Called when everything is done.
          function(err){
            if(err) callback(err);
            else callback(null);
          }
        );
      }); //end conn.openUri
    }); // end fs.readdir
  }// End _gridfsWrite


  module.exports._gridfsDelete = function(data, callback){
    conn.openUri('mongodb://test:test1@ds031581.mlab.com:31581/nodejs_db', function (err) {
      if(err) callback(err);

      var gfs = grid(conn.db, mongoose.mongo);

      gfs.remove({_id:data}, function (err) {
        if (err) callback(err);
        callback('success');
      });
    });
  }// end _gridfsDelete


  module.exports._gridfsCheckFileExists = function(id, callback){
    conn.openUri('mongodb://test:test1@ds031581.mlab.com:31581/nodejs_db', function (err) {
      var gfs = grid(conn.db, mongoose.mongo);
      //seraches database by id and returns true or false with data about file if true.
      gfs.findOne({_id:id}, function (err, data){
        if(err) callback(err, false, null);
        else callback(null, (data != null), data);
      });
    });
  }// end _gridfsCheckFileExists


  module.exports._gridfsGetFileReadstream = function(id, callback){
    conn.openUri('mongodb://test:test1@ds031581.mlab.com:31581/nodejs_db',function (err) {
      var gfs = grid(conn.db, mongoose.mongo);
      var readstream = gfs.createReadStream({
        _id:id
      });
      callback(null, readstream);
    });
  }// end retriveFiles


  module.exports._gridfsUploadFiles = function(file , callback){
    console.log(file)
    file.mv('uploads/' + file.name, function(err){
      if (err) callback(err);
      else callback(null);
    });
  }//end _gridfsUploadFile



  function removeFilefromDir(directory, filename, callback){
    fs.unlink(directory + filename, (err)=>{
      if(err) callback(err);
      else callback(null);
    });
  }
