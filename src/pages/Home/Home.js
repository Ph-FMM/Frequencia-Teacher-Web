import * as React from "react";
import { Redirect } from "react-router";

import { fire } from "../../config/firebaseConfig";
import Header from "../../components/HomeHeader/Header";
import Loading from "../../components/Loading/Loading";
import CreateEvent from "../CreateEvent/CreateEvent";

import { toast } from "react-toastify";

import * as Class from "../../controllers/ClassController";
import * as Event from "../../controllers/EventController";
import * as User from "../../controllers/UserController";

import Avatar from "../../assets/profile-user.png";

import "./styles.css";
import "react-toastify/dist/ReactToastify.css";

class Events {
  constructor(
    name_,
    date_,
    description_,
    timeBegin_,
    timeEnd_,
    keyWord_,
    students_,
    key_
  ) {
    this.name = name_;
    this.date = date_;
    this.description = description_;
    this.timeBegin = timeBegin_;
    this.timeEnd = timeEnd_;
    this.keyWord = keyWord_;
    this.students = students_;
    this.key = key_;
  }
}

var new_event_class = "",
  editEvent = false,
  eventToEdit = new Events();

toast.configure();

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      goLogin: false,
      username: "",
      subjects: "",
      avatar: Avatar,
      avatarURL: null,

      edit: false,

      email: "",
      emailError: "",
      pswd: "",
      pswdError: "",

      loading: false,
      classes: [],
      new_event: false,
      reportState: null,
    };
  }

  componentDidMount() {
    try {
      editEvent = false;
      this.loadClasses();
      this.loadSubject();
    } catch (e) {
      fire.auth().signOut();
      this.setState({ goLogin: true });
    }
  }

  loadSubject = async () => {
    const uid = await fire.auth().currentUser.uid;
    const subjects = await User.getSubject(uid);

    this.setState({ subjects });
  };

  loadClasses = async () => {
    this.setState({ loading: true });
    Class.loadClasses().then(
      (classroom) => {
        this.setState({ classes: classroom, loading: false });
      },
      (error) => {
        window.location.replace("/");
      }
    );
  };

  handleChange = (ev) => {
    this.setState({ [ev.target.name]: ev.target.value });
  };

  render() {
    if (this.state.goLogin) {
      return <Redirect to={{ pathname: "/" }} />;
    }

    if (this.state.reportState) {
      return (
        <Redirect to={{ pathname: "/report", state: this.state.reportState }} />
      );
    }
    return (
      <div>
        {this.state.new_event ? (
          <CreateEvent
            nameClass={new_event_class}
            subjects={this.state.subjects}
            editEvent={editEvent}
            eventToEdit={eventToEdit}
          />
        ) : (
          <div>
            <Loading loading={this.state.loading} />
            <Header />
            <div className="homeFeed">
              {localStorage.getItem("EventCreated")
                ? toast.success("Evento criado com sucesso", {
                    autoClose: 3500,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  }) | localStorage.removeItem("EventCreated")
                : null}
              {localStorage.getItem("EventEdited")
                ? toast.info("Evento editado com sucesso", {
                    autoClose: 3500,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  }) | localStorage.removeItem("EventEdited")
                : null}
              {this.state.classes.map((c, index) => (
                <div className="rectanguleClass" key={index}>
                  <div className="nameClass">
                    <h1>{c.name}</h1>
                  </div>
                  <div className="events">
                    {c.events.map((e, ind) => (
                      <div className="rectanguleEvent" key={ind}>
                        <div className="nameEvent">
                          <h2>{e.title}</h2>
                        </div>
                        <div className="dateEvent">
                          <h2>{e.date}</h2>
                        </div>
                        <div className="line" />
                        <div className="descriptionEvent">
                          <h2>Descrição: {e.description}</h2>
                        </div>
                        <div className="timeBeginEvent">
                          <h2>Início: {e.begin}</h2>
                        </div>
                        <div className="timeEndEvent">
                          <h2>Fim: {e.end}</h2>
                        </div>
                        <div className="keyWordEvent">
                          <h2>Palavra-passe: {e.formatedKeys}</h2>
                        </div>
                        <div className="editEvent">
                          <button
                            onClick={(ev) => {
                              ev.preventDefault();
                              this.setState({ new_event: true });
                              new_event_class = c.name;
                              editEvent = true;
                              eventToEdit = e;
                            }}
                          >
                            <h1>Editar evento</h1>
                          </button>
                        </div>
                        <div className="deleteEvent">
                          <button
                            onClick={async (ev) => {
                              ev.preventDefault();

                              await Event.deleteEvent(e, c.name).then(() => {
                                const { classes } = this.state;
                                classes[index].events.splice(ind, 1);
                                this.setState({ classes });
                                toast.error("Evento deletado com sucesso", {
                                  autoClose: 3500,
                                  closeOnClick: true,
                                  pauseOnHover: true,
                                  draggable: true,
                                });
                              });
                            }}
                          >
                            <h1>Excluir evento</h1>
                          </button>
                        </div>
                        <div className="frequenceEvent">
                          <button
                            onClick={(ev) => {
                              ev.preventDefault();

                              const reportState = {
                                classroom: c.name,
                                id: e.id,
                                keyCount: e.keyCount,
                              };

                              this.setState({ reportState });
                            }}
                          >
                            <h1>Frequência</h1>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="createEvent">
                    <button
                      onClick={(ev) => {
                        ev.preventDefault();
                        new_event_class = c.name;
                        this.setState({ new_event: true });
                      }}
                    >
                      <h1>+ Criar evento</h1>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}
