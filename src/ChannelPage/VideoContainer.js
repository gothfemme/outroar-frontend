import React from 'react';
import { Segment } from 'semantic-ui-react';
import VideoPlayer from './VideoPlayer';

const VideoContainer = ({ myStream, currentUsers, myUsername }) => {
  // let myVideo;
  // const setRef = (el) => {
  //   myVideo = el
  //   if (myVideo) {
  //     myVideo.srcObject = myStream.stream
  //   }
  // }
  return (
    <Segment inverted style={{ borderRadius:"0", display:"flex", margin:"0", flexDirection:"row", flexBasis:"auto", minHeight:"50vh", flexWrap:"wrap", alignItems:"center", alignContent: "center", justifyContent:"center", boxShadow:"inset 0 0 5px 1px rgb(0, 0, 0, 0.5)"}}>
    {myStream.stream &&
      // <div style={{textAlign:"center", padding:"1rem", flex:"1 1 20%", maxWidth:"36vw", minWidth:"10vw"}}>
      //   <div style={{position:"relative"}}>
      //     <video muted ref={setRef} autoPlay={true} style={{borderRadius:"1%", boxShadow:"0 1px 5px #000", width:"100%"}}>
      //     </video>
      //   </div>
      //   <div>{myUsername}</div>
      // </div>
      <VideoPlayer isMe={true} stream={myStream.stream} username={myUsername}/>
    }
  {currentUsers.filter(u => u.stream).map(p => <VideoPlayer key={p.id} isMe={false} stream={p.stream} username={p.username}/>)}
  </Segment>
  )
};

export default VideoContainer;