var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var helper = require('sendgrid').mail;
var MongoClient = require('mongodb').MongoClient;
    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    var port = 8000;
    app.get('/', function (req, res) {
       res.render('index');
    });
    app.post('/send-email', function (req, res) {
      var url = "mongodb://localhost:27017/";
       MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");
          dbo.collection("toMail").find({}).toArray(function(err, result) {
          if (err) throw err;
          for(let i = 0; i < result.length; i += 1) {
              var fromEmail = new helper.Email(req.body.to);
              var toEmail = new helper.Email(result[i].to);
              var subject = req.body.subject;
              var content = new helper.Content('text/plain', req.body.body);
              var mail = new helper.Mail(fromEmail, subject, toEmail, content);
              var sg = require('sendgrid')('');
              var request = sg.emptyRequest({
                    method: 'POST',
                    path: '/v3/mail/send',
                    body: mail.toJSON()
              });
              sg.API(request, function (error, response) {
               if (error) {
                     console.log('Error response received');
                }
              else{
                     console.log('message sent');
              }
              console.log(response.statusCode);
              console.log(response.body);
              console.log(response.headers);
              });
           }
    });

    db.close();
    });
});
     app.listen(8000, function(){
        console.log('Server is running at port: ',port);
     });
