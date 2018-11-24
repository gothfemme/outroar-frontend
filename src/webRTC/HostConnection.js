import Peer from 'simple-peer';

let peers = []

const HostConnection = (data, socket) => {
  let peer = new Peer({ initiator: false, trickle: false })
  peer.signal(data.payload)
  peer.on('connect', () => peers.push(peer))
  peer.on('data', (msg) => console.log(msg))
  return {
    send: (msg) => {
      peers.forEach(p => p.send(msg))
    }
  }
}