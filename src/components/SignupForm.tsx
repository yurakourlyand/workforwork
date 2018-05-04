import * as React from 'react';
import {Component, CSSProperties} from 'react';
import {connect} from 'react-redux';
import {
    Card, Colors,
    Elevation,
    FormGroup,
    Intent,
    Button, TextArea, ButtonGroup, Spinner,
} from '@blueprintjs/core';
import {GuestScreen} from './Main';
import {signUp} from '../state/reducers/UserReducer';
import {Address} from "../state/TypeDefs";

const StateToProps = (state) => {
    let {
        signingUp,
        signUpError,
        isLoggedIn,
    } = state.UserReducer;
    return {
        signingUp,
        signUpError,
        isLoggedIn,
    };
};

const Actions = {
    signUp,
};

interface Props {
    changeScreen: (screen: GuestScreen) => void,
    signUp: typeof  signUp,
    isLoggedIn: boolean,
    signingUp: boolean,
    signUpError: string,
}


interface State {
    user: any,
}


class SignupForm extends Component<Props, State> {
    state = {
        user: {
            userName: '',
            password: '',
            email: '',
            fullName: '',
            summary: '',
            profileImagePath: '',
            address: {},
        }
    };

    updateUserForm = (props: any) => {
        this.setState({
            user: {
                ...this.state.user,
                ...props,
            }
        });
    };
    render() {

        let drawErrors = false;
        console.log("props:", this.props);


        console.log(this.state.user);
        return  (
            <Card elevation={Elevation.FOUR} style={{width: 500, marginTop: 20}}>
                <h1>Sign up</h1>

                <p style={{color: Colors.RED4}}>{this.props.signUpError}</p>

                <FormGroup
                    label="User Name"
                >
                    <input
                        className={"pt-input pt-fill"}
                        placeholder="User Name"
                        value={this.state.user.userName}
                        type="text"
                        onChange={event => this.updateUserForm({'userName': event.target.value})}
                    />
                </FormGroup>

                <FormGroup
                    label="Password"
                >
                    <input
                        className={"pt-input pt-fill"}
                        placeholder="Password"
                        value={this.state.user.password}
                        type="password"
                        onChange={event => this.updateUserForm({'password': event.target.value})}
                    />
                </FormGroup>

                <FormGroup
                    label="Email"
                >
                    <input
                        className={"pt-input pt-fill"}
                        placeholder="Email"
                        value={this.state.user.email}
                        type="email"
                        onChange={event => this.updateUserForm({'email': event.target.value})}
                    />
                </FormGroup>

                <FormGroup
                    label="Full Name"
                >
                    <input
                        className={"pt-input pt-fill"}
                        placeholder="Full Name"
                        value={this.state.user.fullName}
                        type="text"
                        onChange={event => this.updateUserForm({'fullName': event.target.value})}
                    />
                </FormGroup>

                <FormGroup
                    label="Summary"
                >
                    <TextArea
                        className={"pt-input pt-fill"}
                        placeholder="Summary"
                        value={this.state.user.summary}
                        onChange={event => this.updateUserForm({'summary': event.target.value})}
                        fill
                    />
                </FormGroup>

                <FormGroup
                    label="Avatar Image Url"
                >
                    <input
                        className={"pt-input pt-fill"}
                        placeholder="Avatar Image Url"
                        value={this.state.user.profileImagePath}
                        type="text"
                        onChange={event => this.updateUserForm({'profileImagePath': event.target.value})}
                    />

                </FormGroup>

                <FormGroup
                    label="Area"
                >
                    <div className="pt-select pt-fill">
                        <select  onChange={event => this.updateUserForm({'address': {generalArea: event.target.value}})} className="pt-default pt-fill" name="" id="">
                            <option selected value="Hamerkaz">Hamerkaz</option>
                            <option value="Hasharon">Hasharon</option>
                            <option value="Hazafon">Hazafon</option>
                            <option value="Hadarom">Hadarom</option>
                            <option value="Jerusalem">Jerusalem</option>
                        </select>
                    </div>
                </FormGroup>

                {  !this.props.signingUp
                    ? <ButtonGroup fill>
                        <Button text={"Back"} icon={"arrow-left"} onClick={() => {this.props.changeScreen(GuestScreen.LOGIN)}}/>
                        <Button intent={Intent.SUCCESS} text={"Sign Up"} icon={"tick"} onClick={() => {
                            this.props.signUp(this.state.user);
                            if (this.props.isLoggedIn) {
                                this.props.changeScreen(GuestScreen.LOGIN);
                            }
                        }}/>
                    </ButtonGroup>
                    : <Spinner/>

                }

            </Card>
        )
    };
}

const styles = {
    card: {
        margin: 100,
    },
    errorText: {
        color: Colors.RED1
    },
} as CSSProperties;

export default connect(StateToProps, Actions)(SignupForm);