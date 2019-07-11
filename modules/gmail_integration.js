var fs = require('fs');
var readline = require('readline');
const { google } = require('googleapis');
const bot = require('../lib/bot');
const axios = require('axios');
var _ = require('lodash');
var moment = require('moment-timezone');

var SCOPES = ['https://www.googleapis.com/auth/calendar.event'];
var TOKEN_PATH = 'token.json';

function authorize(credentials, callback, payload) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const OAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
          getNewToken(OAuth2Client, callback, payload);
      } else {
        OAuth2Client.credentials = JSON.parse(token);
          return callback(OAuth2Client, payload);
      }
  });
}

function getNewToken(oauth2Client, callback, payload) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.error('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) return console.error(err);
              console.log('Token stored to', TOKEN_PATH);
            });
            callback(oauth2Client, payload);
        });
    });
}

function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    return events;
  });
}

function createMeetingInvite(payload) {
  fs.readFile(__dirname + '/credentials.json', function processClientSecrets(err, content) {
    if (err) {
      'Error loading client secret file: ' + err;
    } else {
      authorize(JSON.parse(content), createEvents, payload);
    }
  });

  return "Successfully scheduled..";
}

async function createEvents(auth, payload) {
  await getUserInfo(payload.submission.creator).then((creator) => {
    getProfileInfo(payload.submission.creator).then((profile) => {
      const calendar = google.calendar({version: 'v3', auth});
      const arr = _.split(payload.submission.attendees, ',')
      arr.push(profile.email);

      const attendees = arr.map(guest => { return {"email": guest}; });
      const startDateTime = moment.tz(payload.submission.date.concat(' ', payload.submission.from_time), creator.tz).format();
      const endDateTime = moment.tz(payload.submission.date.concat(' ', payload.submission.to_time), creator.tz).format();

      var event = {
        "summary":  payload.submission.title,
        "location": payload.submission.location,
        "description": payload.submission.description,
        "start": {
          "dateTime": startDateTime,
          "timeZone": creator.tz,
        },
        "end": {
          "dateTime": endDateTime,
          "timeZone": creator.tz,
        },
        "recurrence": [
          "RRULE:FREQ=DAILY;COUNT=2"
        ],
        "attendees": attendees,
        "reminders": {
          "useDefault": false,
          "overrides": [
            {"method": "email", "minutes": 1440},
            {"method": "popup", "minutes": 10},
          ],
        },
      };
      
      calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        sendNotifications: true,
        resource: event,
      }, function(err, event) {
        if (err) {
          console.log('Could not create calendar event: ' + err);
          return;
        }

        sendConfirmationMessage(event.data.htmlLink, payload);
      });
    }).catch(error => {
      console.log("Profile fetching error....", error);
    });
  }).catch(error => {
    console.log("Creator fetching error....", error);
  });
}

async function getUserInfo(user) {
  var config = {
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
      'Authorization': "Bearer " + process.env.SLACK_AUTH_TOKEN
    },
    params: {
      token: process.env.SLACK_AUTH_TOKEN,
      user: user
    }
  };

  return axios.get('https://slack.com/api/users.info', config)
    .then(response => { 
      return Promise.resolve(response.data.user);
    })
    .catch(error => {
      console.log("User info retrieval error....", error);
  });
}

async function getProfileInfo(user) {
  var config = {
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
      'Authorization': "Bearer " + process.env.SLACK_AUTH_TOKEN
    },
    params: {
      token: process.env.SLACK_AUTH_TOKEN,
      user: user,
    }
  };

  return axios.get('https://slack.com/api/users.profile.get', config)
    .then(response => { 
      return Promise.resolve(response.data.profile);
    }).catch(error => {
      console.log("Profile retrieval error....", error);
  });
}

function sendConfirmationMessage(meetingLink, payload) {
  console.log("final payload >>>>>", payload);
  bot.confirmationMessage(meetingLink, payload)
    .then(result => { 
      axios({
        method: 'post',
        url: 'https://hooks.slack.com/services/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',
        data: { 
          text: `Your meeting is confirmed! :calendar: \n <${meetingLink}>` 
        },
        headers: {
          'Content-type': 'application/json;charset=utf-8',
          'Authorization': "Bearer " + process.env.SLACK_AUTH_TOKEN
        }
      }).then(response => { 
          console.log("confirmation response....", response.data);
        })
        .catch(error => {
          console.log("confirmation error....", error);
      });
    }).catch(console.error);
}


module.exports = {
  createMeetingInvite
};