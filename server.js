var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var port = 3000;

var app = express();
var Agenda = require("./models/model.js");

mongoose.connect("mongodb://woutdt:Wout2002@ds135290.mlab.com:35290/agenda", function(err) {
  if(err) throw err;
  console.log("database connected");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var errorHandler = {
  "message": "Oops, something went wrogn..."
};

//check if array values are all the same
Array.prototype.AllValuesSame = function(){

    if(this.length > 0) {
        for(var i = 1; i < this.length; i++)
        {
            if(this[i] !== this[0])
                return false;
        }
    }
    return true;
}

//find all
function findAll(res) {
     Agenda.find({}, function(err, data) {
      if(err) res.json({"message": "oops something went wrogn..."});
      return res.json(data);
    });
};

//find find one by task
function findOneByTask(req, res) {
  Agenda.findOne({'taken._id': new mongoose.Types.ObjectId(req.query.id) }, function(err, data) {
    return res.json(data);
  });
};

//find one
function findOne(req, res) {
  Agenda.findOne({'_id': req.query.id}, function(err, data) {
    if(err) return res.json(errorHandler);
    return res.json(data);
  });
};

function timeConversion(millisec) {

        var seconds = (millisec / 1000).toFixed(1);

        var minutes = (millisec / (1000 * 60)).toFixed(1);

        var hours = (millisec / (1000 * 60 * 60)).toFixed(1);

        var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

        if (seconds < 60) {
            return seconds + " Sec";
        } else if (minutes < 60) {
            return minutes + " Min";
        } else if (hours < 24) {
            return hours + " Hours";
        } else {
            return days + " Days"
        }
    }

//get all vakken
app.get("/find", function(req, res) {
  if(req.query.id) {
    Agenda.findOne({ '_id': req.query.id }, function(err, data) {
      if(err) return res.json(errorHandler);
      var date1 = data.created_At;
      var date2 = Date.now();
      var date3 = date2 - date1;
      var final = timeConversion(date3) + ' Ago';
      data.time_created = final;
      var l;
      for(l = 0; l < data.taken.length; l++) {
        taak = data.taken[l];
        var datum1 = taak.deadline;
        var datum2 = Date.now();
        var datum3 = datum1 - datum2;
        var finaldate = 'Deadline: '+ timeConversion(datum3);
        taak.time_until_deadline = finaldate;
      };
      return res.json(data);
    });
  } else {
    Agenda.find({}, function(err, data) {
      if(err) return res.json(errorHandler);
      var i;
      for(i = 0; i < data.length; i++) {
        vak = data[i];
        var date1 = vak.created_At;
        var date2 = Date.now();
        var date3 = date2 - date1;
        var final = timeConversion(date3) + ' Ago';
        vak.time_created = final;
        var l;
        for(l = 0; l < data[i].taken.length; l++) {
          taak = data[i].taken[l];
          var datum1 = taak.deadline;
          var datum2 = Date.now();
          var datum3 = datum1 - datum2;
          var finaldate = 'Deadline: '+ timeConversion(datum3);
          taak.time_until_deadline = finaldate;
        };
      };
      return res.json(data);
    });
  };
});

//create new vak
app.post("/new", function(req, res) {
  var date = Date.now();
  var agenda = new Agenda({
    vak: req.body.vak,
    important: req.body.important,
    created_At: date
  });

  agenda.save(function(err) {
    if(err) res.json({"message": "sorry something went wrogn..."});
    Agenda.find({}, function(err, data) {
      if(err) res.json({"message": "sorry something went wrogn..."});
      res.json(data);
    });
  });
});

//create new task
app.post("/newTask", function(req, res) {
  var millisec = Number(req.body.millisec) + Number(Date.now());
  var takenObj = { naam: req.body.taakname, deadline: millisec };
  Agenda.findOneAndUpdate({ _id: req.query.id}, { $push: { taken: takenObj }}, function(err, data) {
    Agenda.findOne({_id: req.query.id}, function(err, data) {
      if(err) {
        console.log(err);
        res.json({"message": "sorry something went wrogn..."});
      } else {
        res.json(data);
      };
    });
  });
});

//update task => true/false
app.put("/taskSwitch", function(req, res) {
  Agenda.aggregate([
    { "$unwind" : '$taken' },
    { "$match" :
        { "taken._id" : new mongoose.Types.ObjectId(req.query.id) }
    },
    { "$limit": 1 }
  ], function(err, data) {
    data = data[0];
    if(data.taken.completed == true) {
      Agenda.update({ 'taken._id': req.query.id }, { '$set': { 'taken.$.completed': false, 'taken.$.show': true}}, function(err, data) {
        if(err) return res.json(errorHandler);
        findOneByTask(req, res);
      });
    } else if(data.taken.completed == false) {
      Agenda.aggregate([
        { '$match':
            { 'taken.completed': true }
        }
      ], function(err, data) {
        if(err) res.json(errorHandler);
        var i;
        var analyse = [];
        for(i = 0; i < data.length; i++) {
          taken = data[i].taken;
          var l;
          for(l = 0; l < taken.length; l++) {
            if(taken[l].completed == true) {
              analyse.push(taken[l].show);
            };
          };
        };
        var analysys = analyse.AllValuesSame();
        if(analysys == true && analyse[0]==true) {
          var setShow = true;
        } else if(analysys == true && analyse[0]==false) {
          var setShow = false;
        } else if(analysys == false) {
          res.json(errorHandler);
        } else {
          var setShow = true;
        };
        if(setShow == true) {
          Agenda.update({ 'taken._id': req.query.id }, { '$set': { 'taken.$.completed': true, 'taken.$.show': true }}, function(err, data) {
             if(err) return res.json(errorHandler);
             findOneByTask(req, res);
           });
        } else {
          Agenda.update({ 'taken._id': req.query.id }, { '$set': { 'taken.$.completed': true, 'taken.$.show': false }}, function(err, data) {
             if(err) return res.json(errorHandler);
             findOneByTask(req, res);
           });
        }
      });
    } else {
      return res.json(errorHandler);
    };
  });
});

//hide/show completed tasks
app.put("/toggleshow", function(req, res) {
  Agenda.aggregate([
    { '$match':
      { 'taken.completed': true }
    }
  ], function(err, data) {
    if(err) return res.json(errorHandler);
    var i;
    for(i = 0; i < data.length; i++) {
      var taken = data[i].taken;
      var l;
      for(l = 0; l < taken.length; l++) {
        if(taken[l].completed == true) {
          if(taken[l].show == true) {
            Agenda.update({ 'taken._id': taken[l]._id }, { '$set': { 'taken.$.show': false }}, function(err) {
              if(err) return res.json(errorHandler);
            });
          } else if(taken[l].show == false) {
            Agenda.update({ 'taken._id': taken[l]._id }, { '$set': { 'taken.$.show': true }}, function(err) {
              if(err) return res.json(errorHandler);
            });
          } else {
            Agenda.update({ 'taken._id': taken[l]._id }, { '$set': { 'taken.$.show': true}}, function(err) {
              if(err) res.json(errorHandler);
            });
          };
        } else if(taken[l].completed == false) {
          console.log("false");
        };
      };
    };
    Agenda.find({ 'taken.completed': true }, function(err, data) {
      if(err) res.json(errorHandler);
      res.json(data);
    });
  });
});

//permanent delete a vak
app.delete("/delVak", function(req, res) {
  Agenda.deleteOne({'_id': req.query.id}, function(err) {
    if(err) res.json({"message": "oops something went wrogn"});
    findAll(res);
  });
});

//soft delete vak
app.put("/softDelVak", function(req, res) {
  Agenda.findOne({ '_id': req.query.id }, function(err, data) {
    if(err) return res.json(errorHandler);
    if(data.deleted == false) {
      data.deleted = true;
      data.save(function(err) {
        if(err) return res.json(errorHandler);
        findOne(req, res);
      });
    } else if(data.deleted == true) {
      data.deleted = false;
      data.save(function(err) {
        if(err) return res.json(errorHandler);
        findOne(req, res);
      });
    } else {
      return res.json(errorHandler);
    };
  });
});

//recover all softdeleted objects
app.put("/recover", function(req, res) {
  Agenda.aggregate([
    { '$match':
          { 'deleted': true }
    }
  ], function(err, data) {
    var length = data.length;
    var i;
    for (i = 0; i < length; i++) {
      vak = data[i];
      Agenda.update({ '_id': vak._id }, { '$set': { 'deleted': false }}, function(err) {
        if(err) return res.json(errorHandler);
      });
    };
    findAll(res);
  });
});

//get all softdeleted objects
app.get("/litterbin", function(req, res) {
  Agenda.aggregate([
    { '$match':
      { 'deleted' : true }
    }
  ], function(err, data) {
    if(err) return res.json(errorHandler);
    if(data.length == 0) {
      res.json({ "message": "no objects in  litterbin" });
    } else {
      res.json(data);
    };
  });
});

//delete task
app.delete("/delTask", function(req, res) {
  Agenda.findOne({'taken._id': req.query.id}, function(err, data) {
    var dataid = data._id;
    if(err) {
      res.json(errorHandler);
    } else {
      Agenda.update({'taken._id': new mongoose.Types.ObjectId(req.query.id)}, { $pull : { taken :  { _id: new mongoose.Types.ObjectId(req.query.id) }}}, function(err) {
        if(err) res.json({"message": "sorry, something went wrogn"});
      });
      Agenda.findOne({'_id': new mongoose.Types.ObjectId(dataid)}, function(err, docs) {
        if(err) res.json(errorHandler);
        res.json(docs);
      });
    }
  });
});

//update vak to important
app.put("/vakSwitch", function(req, res) {
  Agenda.findOne({'_id': req.query.id}, function(err, data){
    if(err) res.json(errorHandler);
    if(data.important == true) {
      data.important = false;
      data.save(function(err) {
        if(err) res.json(errorHandler);
        findOne(req, res);
      });
    } else if(data.important == false) {
      data.important = true;
      data.save(function(err) {
        if(err) res.json(errorHandler);
        findOne(req, res);
      });
    } else {
      res.json(errorHandler);
    };
  });
});

app.listen(port, function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log("server running on port: "+port);
  }
});
