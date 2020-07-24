# outroar
> A peer to peer video chat application, allowing for multiple users to chat in real-time.

[Video Demo](https://www.youtube.com/watch?v=SbmwHn9Asgs)

[Live Demo](https://outroar-app.herokuapp.com/)

This is a video chat app, built on React and Redux for the frontend, and Rails as an API backend. It utilizes webRTC for peer-to-peer data streaming, allowing for real-time communications over text, voice, and video with multiple users at once. It also uses an ActionCable websocket for webRTC signaling, and for other chat features (live user presence, admin actions, etc). You can create an account, with passwords saved in an encrypted form on the database due to the bcrypt gem, and client-to-server auth using JWT.

This is the frontend, the backend can be found [here](https://github.com/gothfemme/outroar-backend).

## Development Setup

### Frontend

_Before starting, you will have to change the `BASE_URL` constant in `/src/store/actions/adapter.js` and the ActionCable url in `/src/App.js` to point to your own backend._

OS X & Linux:

```sh
npm install
npm start
```

### Backend

_Before starting, you will have to change the urls in `/config/initializers/cors.rb` and `Rails.application.config.action_cable.allowed_request_origins` in `/config/environments/development.rb`._

OS X & Linux:

```sh
bundle install
rails db:create
rails db:migrate
rails s
```

## Usage example

Since this is a chat application, you will need another user in order to really make much use of it! Furthermore in its current form, the implementation of webRTC in this app only works _between computers on the same wifi network_ due to Firewall/NAT issues. However if you do have two computers on the same network, everything works! Either way, you can create an account, log in, make rooms, join rooms, make new comments, etc.


## Meta

Kat Michaela – [@gothfemme](https://twitter.com/gothfemme) – k@gothfem.me - [github](https://github.com/gothfemme/)

## Contributing

1. Fork it (<https://github.com/gothfemme/outroar-frontend/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
