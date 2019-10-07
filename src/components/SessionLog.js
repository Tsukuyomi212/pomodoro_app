import React, { Component } from 'react';
import { db } from '../firebase';
import {
  SessionBox,
  SessionList,
  ReturnButton,
  RedText
} from '../uiComponents';
import firebase from 'firebase';

class SessionLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logs: []
    };
  }

  componentDidMount = () => {
    const { user } = this.props;
    if (user) {
      // User is signed in.
      db.collection('sessions')
        .where('userId', '==', user.uid)
        .get()
        .then(snapshot => {
          const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            userId: doc.data().userId,
            date: doc.data().date,
            totalSessionCount: doc.data().totalSessionCount,
            totalTime: parseInt(doc.data().totalTime)
          }));
          this.setState({ logs: logs });
        });
    } else {
      this.setState({ logs: [] });
    }
  };

  render() {
    const { logs } = this.state;
    console.log(this.state.totalTime);
    return (
      <SessionBox>
        <ReturnButton onClick={this.props.returnToTimer}>Return</ReturnButton>
        <SessionList>
          {logs.map(log => (
            <li key={log.id}>
              {log.date}
              {'  '}
              <RedText>||</RedText>
              {'  '}
              Total sessions: {'  '}
              {log.totalSessionCount}
              {'  '}
              <RedText>||</RedText>
              {'  '}
              Total time:{'  '}
              {log.totalTime}
            </li>
          ))}
        </SessionList>
      </SessionBox>
    );
  }
}

export default SessionLog;
