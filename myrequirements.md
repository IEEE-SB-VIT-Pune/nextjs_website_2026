import React, { useEffect } from "react";
import axios from "axios";
import { EventCard1, EventCard2 } from "../components/EventCard";
import { Loader } from "../components/Loader";
import Evector from "../assets/images/events/icons/eventpageVector.png";
// import Fade from "react-reveal/Fade";
import EventsDataNew from "../data/EventsDataNew";

import "../css/events/Events.css";

function EventPage() {
  const [previousEvents, setPreviousEvents] = React.useState([]);
  const [loader, setLoader] = React.useState(true);

  // let body = {};

  // const fetchAllEvents = async () => {
  //   let config = {
  //     //config to send the token in the header
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   };
  //   try {
  //     const response = await axios.get(
  //       //post request to the backend
  //       // "https://ieeevitpune.com/"+"events/getAllEvents",
  //       body,
  //       config
  //     );
  //     if (response.data.success === true) {
  //       const sortedData = response.data.data.info.sort((a, b) =>
  //         a.date_time_info.details[0].date.localeCompare(
  //           b.date_time_info.details[0].date
  //         )
  //       );
  //       setPreviousEvents(sortedData);
  //       console.log(response);
  //     } else {
  //       console.log(response);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  //   setLoader(false);
  // };

  useEffect(() => {
    // fetchAllEvents();
    // console.log(EventsDataNew);
    setPreviousEvents(EventsDataNew.data.info);
    // eslint-disable-next-line
  }, []);

  // console.log(previousEvents);
  return (
    <>
      <div className="Ebody">
        {/* {loader && <Loader />} */}
        <div className="headerEvents">
          <img src={Evector} className="eventVector" alt="" />
          <h1 className="eventHeading"> Event Highlights </h1>
        </div>

        {/* <div className="EbS">
          <button className="EbuttonStyle">Previous</button>
          <button className="EbuttonStyle">Upcoming</button>
        </div> */}

        {previousEvents.map((ev, index) => {
          if (window.innerWidth > 450) {
            if (index % 2 === 0) {
              return (
                // <Fade bottom key={ev._id}>
                <EventCard1
                  id={ev._id}
                  key={ev._id}
                  title={ev.event_name}
                  description={ev.event_description}
                  url={ev.images[0]}
                />
                // </Fade>
              );
            } else {
              return (
                // <Fade bottom key={ev._id}>
                <EventCard2
                  key={ev._id}
                  id={ev._id}
                  title={ev.event_name}
                  description={ev.event_description}
                  url={ev.images[0]}
                />
                // </Fade>
              );
            }
          } else
            return (
              <EventCard1
                key={ev._id}
                id={ev._id}
                title={ev.event_name}
                description={ev.event_description}
                url={ev.images[0]}
              />
            );
        })}
      </div>
    </>
  );
}

export default EventPage;
import codegif from "./assets/images/eventPage_Animation/code.gif";
import webdevgif from "./assets/images/eventPage_Animation/webDev.gif";
import neural from "./assets/images/eventPage_Animation/neural.gif";
import python from "./assets/images/eventPage_Animation/python.gif";
import quantum from "./assets/images/eventPage_Animation/quantum.gif";
import blockchain from "./assets/images/eventPage_Animation/blockchain.gif";

const previousEvents = [
  {
    id: 1,
    title: "CodeZest",
    description: `An exciting coding event, a brain game that tests the programmer’s
                problem solving skills. Not just a ambitious coding competion alone but also an but along 
                an interactive session with an expert in the domain.`,
    url: codegif,
  },

  {
    id: 2,
    title: "Neural Network Bootcamp",
    description: `A workshop that demystified the difference between deep learning and machine learning 
                    providing practical knowledge to implement in various fields and projects.`,
    url: neural,
  },

  {
    id: 3,
    title: "Avenir",
    description: `A workshop that demystified the difference between deep learning and machine learning 
                providing practical knowledge to implement in various fields and projects. `,
    url: webdevgif,
  },

  {
    id: 4,
    title: "IEEE Day",
    description: `A workshop that demystified the difference between deep learning and machine learning 
                    providing practical knowledge to implement in various fields and projects.`,
    url: "",
  },

  {
    id: 5,
    title: "Blockchain",
    description: `A workshop that demystified the difference between deep learning and machine learning 
                providing practical knowledge to implement in various fields and projects. `,
    url: blockchain,
  },

  {
    id: 6,
    title: "Python Workshop",
    description: `A workshop that demystified the difference between deep learning and machine learning 
                     providing practical knowledge to implement in various fields and projects. `,
    url: python,
  },
  {
    id: 7,
    title: "Quantum Computing",
    description: `A workshop that demystified the difference between deep learning and machine learning 
                     providing practical knowledge to implement in various fields and projects. `,
    url: quantum,
  },
];

export default previousEvents;
