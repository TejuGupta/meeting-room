const slackInteractiveMessages = require('@slack/interactive-messages');
const bot = require('../lib/bot');
const gmailIntegration = require('../modules/gmail_integration');
const axios = require('axios');

const slackInteractions = slackInteractiveMessages.createMessageAdapter(process.env.SLACK_SIGNING_SECRET);

slackInteractions.action('book_a_room:start', (payload, respond) => {
  bot.openDialog(payload.user.id)
    .then(result => { 
      var postOptions = {
        headers: {
          'Content-type': 'application/json;charset=utf-8',
          'Authorization': "Bearer " + process.env.SLACK_AUTH_TOKEN
        },
      };

      axios.post('https://slack.com/api/dialog.open', {
        token: process.env.SLACK_AUTH_TOKEN,
        trigger_id: payload.trigger_id,
        callback_id: "book_a_room:form_submit",
        dialog: result
      }, postOptions)
        .then(response => { 
          console.log("axios response....", response.data);
        })
        .catch(error => {
          console.log("axios error....", error);
      });
    }).catch(console.error);
});

slackInteractions.action({ type: 'dialog_submission' }, (payload, respond) => {
  gmailIntegration.createMeetingInvite(payload);

  respond({
    text: "Thank you for your submission! We will send the booking details shortly. :tada:"
  })
});

module.exports = slackInteractions;