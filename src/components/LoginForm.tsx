import * as React from 'react';
import {Component, CSSProperties} from 'react';
import {connect} from 'react-redux';
import {login} from '../state/reducers/UserReducer';
import {
    Card, Colors,
    Elevation, FormGroup,
    Intent, Label, Button, Spinner
}
    from '@blueprintjs/core';
import {GuestScreen} from './Main';

const StateToProps = (state) => {
    let {loginError,isLoggingIn}  = state.UserReducer;
    return {
        loginError,
        isLoggingIn
    };
};

const Actions = {
    login,
};

interface Props {
    loginError: string,
    login: typeof login
    changeScreen: (screen: GuestScreen) => void,
    isLoggingIn: boolean,

}

interface State {
    userName: string,
    password: string,

    userTriedToLogin: boolean,
}

class LoginForm extends Component<Props, State> {
    state = {
        userName: '',
        password: '',
        userTriedToLogin: false,
    };

    handleLogin = () => {

        this.setState({userTriedToLogin: true});
        let {userName, password} = this.state;
        console.log('logging in', {userName, password});
        if(!userName || !password) return;
        this.props.login(userName, password);
    };


    handleKeyPress = (event) => {
        if(event.key == 'Enter'){
            this.handleLogin();
        }
    };

    render() {
        let drawErrors = this.state.userTriedToLogin;
        return (
            <Card
                style={styles.card}
                elevation={Elevation.FOUR}
            >
                <h2>Login form</h2>
                <FormGroup
                    label="User Name:"
                >
                    <input
                        className={"pt-input " +
                        ((drawErrors && !this.state.userName) ? 'pt-intent-danger': '')}
                        placeholder="Username"
                        id="userNameField"
                        value={this.state.userName}
                        type="text"
                        onChange={event => this.setState({userName: event.target.value})}
                    />
                </FormGroup>

                <FormGroup
                    label="Password:"
                >
                        <input
                            className={"pt-input " +
                            ((drawErrors && !this.state.password) ? 'pt-intent-danger': '')}
                            placeholder="Password"
                            id="passwordField"
                            value={this.state.password}
                            type="password"
                            onChange={event => this.setState({password: event.target.value})}
                            onKeyPress={this.handleKeyPress}
                        />
                </FormGroup>
                {this.props.loginError && <Label  style={styles.errorText} className="pt-intent-danger" text={this.props.loginError} /> }


                {this.props.isLoggingIn ?
                    <div style={styles.centeredSpinner}>
                        <Spinner/>
                    </div>
                    :
                    <div className="pt-fill">
                    <Button className="pt-fill" intent={Intent.PRIMARY} onClick={this.handleLogin} text="Login" icon="log-in"/>
                </div>

                }

                <div style={{marginTop: 15}} className="pt-fill">
                    <Button className="pt-fill" onClick={() => this.props.changeScreen(GuestScreen.SIGNUP)} text="Sign Up" icon="arrow-up"/>
                </div>

            </Card>
        );
    };
}

const styles = {
    card: {
        margin: 100,
    },
    centeredSpinner: {
        display: 'flex',
        maxHeight: '30px',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    errorText: {
        color: Colors.RED1
    },
} as CSSProperties;

export default connect(StateToProps, Actions)(LoginForm);