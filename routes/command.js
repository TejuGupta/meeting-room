const CommandRouter = require("express").Router();
const GmailIntegration = require('../modules/gmail_integration');
const bot = require('../lib/bot');

CommandRouter.post('/api/bookRooms', (req, res) => {
  const meetings = new GmailIntegration();
  res.status(200).send({
    success: 'true',
    message: `Meetings...${meetings.authorize()}`,
  })
});

CommandRouter.post('/', async (req, res) => {
  const payload = req.body;
  const queryStr = payload.text;

  if (!queryStr) {
    var data = { text: "`/meeting-room book <subject> <date> <start-time> <end-time> [attendees list] <location>` -- \n This will book a meeting room and send an invite to all the attendees automatically."};
    res.json(data);
  } else {
    queries = queryStr.split(" ");

    if (queries[0] == "book") {
      bot.introduce(queries)
      .then(function(result) {
        return res.json(result);
      }).catch(console.error);
    } else {
      var data = { text: "`/meeting-room book <subject> <date> <start-time> <end-time> [attendees list] <location>` -- \n This will book a meeting room and send an invite to all the attendees automatically."};
      res.json(data);
    }
  }
});

module.exports = CommandRouter;