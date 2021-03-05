import 'bootstrap/dist/css/bootstrap.css'
import React from 'react'
import DateTimePicker from 'react-datetime-picker'
import { useState } from 'react'

function App() {
  const [startDate, setStartDate] = useState(new Date())
  const [eventName, setEventName] = useState('Test Event')
  const [eventDesc, setEventDesc] = useState('Test Event Description')
  const [signedIn, setSignedIn] = useState(false)
  const [events, setEvents] = useState({})

  var gapi = window.gapi
  var CLIENT_ID =
    '985843940115-vj2ggcgsas9hfrepbpmtd6r84ebich66.apps.googleusercontent.com'
  var API_KEY = 'AIzaSyAw723ejATbumevYsS1JAWcVFEW-a2efAc'
  var DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  ]
  var SCOPES = 'https://www.googleapis.com/auth/calendar.events'

  var endDate = new Date()
  endDate.setTime(startDate.getTime() + 7200000)

  const handleLoad = (e) => {
    e.preventDefault()
    gapi.load('client:auth2', () => {
      console.log('loaded_client')

      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })

      gapi.client.load('calendar', 'v3', () =>
        console.log('calenderAPI loaded')
      )

      gapi.auth2
        .getAuthInstance()
        .signIn()
        .then(() => {
          setSignedIn(true)
          console.log('user signed in')
          getEvents()
        })
    })
  }

  const getEvents = () => {
    gapi.client.calendar.events
      .list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      })
      .then((response) => {
        setEvents(response.result.items)
      })
  }

  const handleInsert = (e) => {
    e.preventDefault()
    var event = {
      summary: eventName,
      description: eventDesc,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
    }
    var request = gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    })

    request.execute((event) => {
      console.log(event)
      getEvents()
    })
  }
  const handleDelete = (id) => {
    var request = gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: id,
    })
    request.execute(() => {
      getEvents()
    })
  }
  const handleSignOut = () => {
    gapi.auth2
      .getAuthInstance()
      .signOut()
      .then(() => {
        setSignedIn(false)
        console.log('user signed out')
      })
  }
  if (!signedIn) {
    return (
      <section>
        <div className='container'>
          <p className='text-muted'>No User Login</p>
        </div>
        <div className='text-center'>
          <button
            className='btn btn-primary'
            type='button'
            onClick={handleLoad}
          >
            Click to Sign In
          </button>
        </div>
      </section>
    )
  }
  if (signedIn) {
    return (
      <main>
        <div className='container'>
          <p className='text-muted'>User Currently Signed In</p>
        </div>
        <div className='container'>
          <form className='form-group' onSubmit={handleInsert}>
            <label className='h6 text-danger' htmlFor='eventName'>
              Event Name:
            </label>
            <input
              className='input-group'
              type='text'
              id='eventName'
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            <label className='h6 text-danger' htmlFor='eventDesc'>
              Event Description:{' '}
            </label>
            <input
              className='input-group'
              type='text'
              id='eventDesc'
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
            />
            <label className='h6 text-danger' htmlFor='startDateTime'>
              Event Date/Time:{' '}
            </label>
            <DateTimePicker
              className='input-group'
              onChange={setStartDate}
              value={startDate}
              id='startDateTime'
              minDate={new Date()}
            />
            <div className='text-right'>
              <button className='btn-primary' type='submit'>
                Add Event
              </button>
            </div>
          </form>
        </div>
        <div className='container'>
          <table className='table'>
            <thead className='h5 text-info text-center'>
              <tr>
                <td>Event Name</td>
                <td>Event Description</td>
                <td>Date/Time</td>
              </tr>
            </thead>
            <tbody className='text-center'>
              {Object.entries(events).map(([key, value]) => {
                return (
                  <tr key={key}>
                    <td>{value.summary}</td>
                    <td>{value.description}</td>
                    <td>{value.start.dateTime}</td>
                    <td>
                      <button
                        className='btn-danger'
                        type='button'
                        aria-label='Close'
                        onClick={() => handleDelete(value.id)}
                      >
                        Cancel Event
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className='text-center'>
            <button
              className='btn-warning'
              type='button'
              onClick={handleSignOut}
            >
              Log Out
            </button>
          </div>
        </div>
      </main>
    )
  }
}

export default App
