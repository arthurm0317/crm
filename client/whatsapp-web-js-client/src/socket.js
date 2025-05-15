const {io} = require('socket.io-client')

const socket = ()=>io('https://https://landing-page-socket.8rxpnw.easypanel.host//')

module.exports = {
    socket
}