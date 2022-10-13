const express = require('express')
const { ExpressPeerServer } = require('peer');
const app = express()
const port = 3000

app.use(express.static('public'))

const server = app.listen(port, () => {
  console.log(`Ready on http://localhost:${port} `)
})

const peerServer = ExpressPeerServer(server, {
  path: '/',
  allow_discovery: true,
});

app.use('/peer-server', peerServer);
