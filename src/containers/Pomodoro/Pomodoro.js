import React, { Component } from 'react';
import Sound from 'react-sound';
import gongSound from '../../assets/gong.mp3';
import bongSound from '../../assets/bong.mp3';
import Settings from '../../components/Settings';
import SessionLog from '../../components/SessionLog';
import './Pomodoro.css';
import { saveSessionData } from '../../firebase';
import Timer from '../../components/Timer';

const SESSION_LENGTH = 5;
const SHORT_BREAK_LENGTH = 5;
const LONG_BREAK_LENGTH = 15;

class Pomodoro extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timerIsRunning: false,
      seconds: SESSION_LENGTH,
      sessionSoundStatus: Sound.status.STOPPED,
      isBreak: false,
      breakSoundStatus: Sound.status.STOPPED,
      sessionCount: 0,
      isPaused: false,
      sessionLength: SESSION_LENGTH,
      shortBreakLength: SHORT_BREAK_LENGTH,
      longBreakLength: LONG_BREAK_LENGTH,
      currentPage: 'timer'
    };
  }

  componentDidMount = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  startTimer = isBreak => {
    const {
      sessionCount,
      sessionLength,
      longBreakLength,
      shortBreakLength
    } = this.state;

    const breakLength =
      sessionCount % 4 === 0 ? longBreakLength : shortBreakLength;
    const seconds = isBreak ? breakLength : sessionLength;

    this.setState({
      sessionCount: !isBreak ? sessionCount + 1 : sessionCount
    });
    this.setState({
      timerIsRunning: true,
      isBreak,
      seconds
    });

    this.startIntervalAndTimeout(seconds, isBreak);
  };

  startIntervalAndTimeout = (seconds, isBreak) => {
    this.interval = setInterval(() => {
      const { seconds } = this.state;
      this.setState({ seconds: seconds - 1 });
    }, 1000);
    const { sessionLength } = this.state;

    this.timeout = setTimeout(() => {
      clearInterval(this.interval);

      showNotification(isBreak);

      this.setState({
        timerIsRunning: false,
        sessionSoundStatus: !isBreak ? Sound.status.PLAYING : null,
        breakSoundStatus: isBreak ? Sound.status.PLAYING : null,
        isBreak: !this.state.isBreak,
        seconds: isBreak ? this.state.sessionLength : 0
      });

      if (!isBreak) {
        this.startTimer(!isBreak);
        saveSessionData(sessionLength);
      }
    }, seconds * 1000);
  };

  handleStartButton = () => {
    this.startTimer(false);
  };

  handleStopButton = () => {
    const { sessionCount, isBreak, sessionLength } = this.state;
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    this.setState({
      timerIsRunning: false,
      isBreak: false,
      seconds: sessionLength,
      sessionCount: isBreak ? sessionCount : sessionCount - 1
    });
  };

  pause = () => {
    const { sessionCount, seconds } = this.state;
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    this.setState({
      timerIsRunning: false,
      seconds: seconds,
      sessionCount: sessionCount,
      isPaused: true
    });
  };

  unpause = () => {
    const { isBreak, seconds } = this.state;
    this.setState({ isPaused: false, timerIsRunning: true });
    this.startIntervalAndTimeout(seconds, isBreak);
  };

  stopSessionEndingSound = () => {
    this.setState({ sessionSoundStatus: Sound.status.STOPPED });
  };

  stopBreakEndingSound = () => {
    this.setState({ breakSoundStatus: Sound.status.STOPPED });
  };

  showSettings = () => {
    this.setState({ currentPage: 'settings' });
  };

  showSessionLog = () => {
    this.setState({  currentPage: 'sessionLog' });
  };

  handleSettingsApply = (sessionLength, shortBreakLength, longBreakLength) => {
    this.setState({
      sessionLength: sessionLength,
      shortBreakLength: shortBreakLength,
      longBreakLength: longBreakLength,
      seconds: sessionLength,
      currentPage: 'timer'
    });
  };

  handleCancel = () => {
    this.setState({
      currentPage: 'timer'
    });
  };

  handleReturnFromSessionLog = () => {
    this.setState({  currentPage: 'timer' });
  };

  render() {
    const {
      seconds,
      timerIsRunning,
      sessionSoundStatus,
      isBreak,
      breakSoundStatus,
      sessionCount,
      isPaused,
      sessionLength,
      shortBreakLength,
      longBreakLength,
      currentPage
    } = this.state;

    return (
      <div>
        {currentPage === 'timer' && (
          <div>
            <Timer
              isBreak={isBreak}
              sessionCount={sessionCount}
              seconds={seconds}
              isPaused={isPaused}
              timerIsRunning={timerIsRunning}
              handleStartButton={this.handleStartButton}
              handleStopButton={this.handleStopButton}
              pause={this.pause}
              unpause={this.unpause}
              showSettings={this.showSettings}
              showSessionLog={this.showSessionLog}
            />
            <Sound
              url={gongSound}
              playStatus={sessionSoundStatus}
              onFinishedPlaying={this.stopSessionEndingSound}
            />
            <Sound
              url={bongSound}
              playStatus={breakSoundStatus}
              onFinishedPlaying={this.stopBreakEndingSound}
            />
          </div>
        )}
        {currentPage === 'settings' && (
          <Settings
          sessionLength={sessionLength}
          shortBreakLength={shortBreakLength}
          longBreakLength={longBreakLength}
          applySettings={this.handleSettingsApply}
          cancelSettings={this.handleCancel}
        />
        )}
        {currentPage === 'sessionLog' && (
          <SessionLog returnToTimer={this.handleReturnFromSessionLog} />
        )}
      </div>
    );
  }
}

const showNotification = isBreak => {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      if (isBreak) {
        const notification = new Notification('Break time is over!');
      } else {
        const notification = new Notification(
          "Session expired! It's break time!"
        );
      }
    } else {
      console.log('Permission to show notifications denied :(');
    }
  }
};

export default Pomodoro;
