import * as React from 'react';
import UserPublicProfile  from './components/UserPublicProfile';
import { Provider } from 'react-redux';
import Store from './state/index';
import './App.css';


import "@blueprintjs/core/lib/css/blueprint.css";
import LoginForm from "./components/LoginForm";
import Main from './components/Main';

class App extends React.Component {
  render() {
    return (
        <Provider store={Store}>
            <Main/>
        </Provider>
    );
  }
}


export default App;
