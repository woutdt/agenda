var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var agendaSchema = new Schema({
  vak: String,
  important: Boolean,
  taken: [{
    naam: String,
    completed: { type: Boolean, default: false},
    show: {
      type: Boolean,
      default: true
    },
    deadline: String
  }],
  created_At: {
    type: String
  },
  time_created: String,
  deleted : {
    type: Boolean,
    default: false
  }
});

var Agenda = mongoose.model('Agenda' , agendaSchema);

module.exports = Agenda;
