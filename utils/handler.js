var status = require('http-status');
var handleOne = function handleOne(property, res, error, result) {
   if (error) {
      return res.
      status(status.INTERNAL_SERVER_ERROR).
      json({ error: error.toString() });
   }

   if (typeof property !== 'string') {
       var { prop, msg } = property;
   }

   if (!result) {
      return res.
      status(status.NOT_FOUND).
      json({ error: (msg ? msg : property) + ' not found' });
   }
   var json = {};
   json[prop ? prop : property] = result;
   res.json(json);
};

var handleMany = function handleMany(property, res, error, result) {
   if (error) {
      return res.
      status(status.INTERNAL_SERVER_ERROR).
      json({ error: error.toString() });
   }
   var json = {};
   json[property] = result;
   res.json(json);
};

module.exports.handleOne = handleOne;
module.exports.handleMany = handleMany;