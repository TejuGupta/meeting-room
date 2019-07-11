
function introduce(queries)  {
  if (queries.length > 1) {
    return Promise.resolve({
      text: "Great, thank you for providing all the information! We will send the booking details shortly. :tada:"
    });
  } else {
    return Promise.resolve({
      "text": "I am RendezvousBot, and I\'m here to get some more information before I book a meeting room for you.\n",
      "attachments": [
        {
          "color": "#5A352D",
          "title": "Do you want to start the meeting room process?",
          "callback_id": "book_a_room:start",
          "actions": [
            {
              "name": "start",
              "text": "Ok",
              "type": "button",
              "value": "ok",
            },
            {
              "name": "cancel",
              "text": "Cancel",
              "style": "danger",
              "type": "button",
              "value": "cancel",
              "confirm": {
                "title": "Are you sure?",
                "text": "Weren't you looking to book a meeting room?",
                "ok_text": "Yes",
                "dismiss_text": "No"
              }
            }
          ],
        },
      ],
    });
  }
};


function openDialog(userId) {
  return Promise.resolve(
    {
      "title": "Meeting Information",
      "callback_id": "submit-meeting-form",
      "submit_label": "Submit",
      "elements": [
        {
          "label": "Add title",
          "type": "text",
          "name": "title",
          "hint": "Subject",
        },
        {
          "label": "Who is the organizer?",
          "type": "select",
          "data_source": "users",
          "name": "creator",
          "hint": "Pick organizer",
        },
        {
          "label": "Who are the attendees for the meeting?",
          "type": "textarea",
          "name": "attendees",
          "hint": "Provide additional group attendees if required. (comma separated email list)"
        },
        {
          "label": "Choose a date",
          "type": "text",
          "name": "date",
          "hint": "YYYY-MM-DD",
        },
        {
          "label": "Start time",
          "type": "text",
          "name": "from_time",
          "hint": "HH:MM",
        },
        {
          "label": "End time",
          "type": "text",
          "name": "to_time",
          "hint": "HH:MM",
        },
        {
          "label": "Add location",
          "type": "text",
          "name": "location",
          "hint": "Location",
        },
      ],
    }
  );
}

function startProcess(userId) {
  return Promise.resolve(
      {
        "type": "modal",
        "callback_id": "book_a_room:form_submit",
        "title": {
          "type": "plain_text",
          "text": "Meeting Information",
          "emoji": true
        },
        "submit": {
          "type": "plain_text",
          "text": "Submit",
          "emoji": true
        },
        "close": {
          "type": "plain_text",
          "text": "Cancel",
          "emoji": true
        },
        "blocks": [
          {
            "type": "input",
            "element": {
              "action_id": "book_a_room:title",
              "type": "plain_text_input",
              "placeholder": {
                "type": "plain_text",
                "text": "Subject"
              }
            },
            "label": {
              "type": "plain_text",
              "text": "Add title"
            }
          },
          {
            "type": "input",
            "element": {
              "type": "multi_users_select",
              "action_id": "book_a_room:attendees",
              "placeholder": {
                "type": "plain_text",
                "text": "Pick users"
              }
            },
            "label": {
              "type": "plain_text",
              "text": "Who are the attendees for the meeting?"
            }
          },
          {
            "type": "input",
            "element": {
              "action_id": "book_a_room:group_attendees",
              "type": "plain_text_input",
              "multiline": true,
              "placeholder": {
                "type": "plain_text",
                "text": "Email address of groups"
              }
            },
            "label": {
              "type": "plain_text",
              "text": "Add additional group attendees"
            }
          },
          {
            "type": "input",
            "element": {
              "action_id": "book_a_room:meeting_date",
              "type": "datepicker",
              "initial_date": "2019-10-14",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a date",
                "emoji": true
              }
            },
            "label": {
              "type": "plain_text",
              "text": "Choose date",
              "emoji": true
            }
          },
          {
            "type": "input",
            "element": {
              "action_id": "book_a_room:start_time",
              "type": "plain_text_input",
              "placeholder": {
                "type": "plain_text",
                "text": "HH:MM AM/PM"
              }
            },
            "label": {
              "type": "plain_text",
              "text": "Start time"
            }
          },
          {
            "type": "input",
            "element": {
              "action_id": "book_a_room:end_time",
              "type": "plain_text_input",
              "placeholder": {
                "type": "plain_text",
                "text": "HH:MM AM/PM"
              }
            },
            "label": {
              "type": "plain_text",
              "text": "End time"
            }
          },
          {
            "type": "input",
            "element": {
              "action_id": "book_a_room:location",
              "type": "plain_text_input",
              "placeholder": {
                "type": "plain_text",
                "text": "Location"
              }
            },
            "label": {
              "type": "plain_text",
              "text": "Add location"
            }
          }
        ]
      }
  );
}

function confirmationMessage(meetingLink, payload) {
  const link = `<${meetingLink}>`;
  return Promise.resolve(
    {
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Your meeting is confirmed!"
          }
        },
        {
          "type": "section",
          "block_id": "section567",
          "text": {
            "type": "mrkdwn",
            "text": link,
          },
        }
      ]
    }
  );
}

module.exports = {
  introduce,
  startProcess,
  openDialog,
  confirmationMessage
};