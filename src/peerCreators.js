import Peer from 'simple-peer';

export const createSignalingPeer = (socket, channel, id) => {
  let peer = new Peer({ initiator: true, trickle: false, channelName: channel })
    .on('signal', data => {
      socket.perform('send_signal', { payload: data, to: id })
    })
  return peer
}

export const createPeer = (resp, channel) => {
  let peer = new Peer({ trickle: false, channelName: channel })
    .on('connect', () => {
      console.log('hit connect')
    })
    .on('data', raw => {
      console.log(raw.toString())
    })
    .on('stream', stream => {
      console.log(stream)
    })
    .signal(resp.payload)
  return peer
}