import * as React from 'react';
import {connect} from 'react-redux';
import {FullState} from '../state';
import UserPublicProfile from './UserPublicProfile';
import LoginForm from './LoginForm';
import SearchResults from './SearchResults';
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import {addReceivedMessage, isUserLoggedIn} from '../state/reducers/UserReducer';
import ChatConversations from './ChatConversations';
import {Conversation, User} from '../state/TypeDefs';
import SignupForm from './SignupForm';
import SockJsClient from 'react-stomp'


const mapStateToProps = (state: FullState) => {

    let {isLoggedIn, user} = state.UserReducer;
    return {
        isLoggedIn,
        user

    }
};

const Actions = {
    isUserLoggedIn,
    addReceivedMessage,
};

interface Props {
    isLoggedIn: boolean,
    isUserLoggedIn: typeof isUserLoggedIn,
    user: User,
    addReceivedMessage: typeof addReceivedMessage,
}


export enum CurrentScreen {
    SEARCH_RESULTS,
    CONVERSATIONS,

}

export enum GuestScreen {
    LOGIN,
    SIGNUP,
}

interface State {
    currentScreen: CurrentScreen | any,
    guestScreen: GuestScreen,

}

class Main extends React.Component<Props> {

    state = {
        currentScreen: CurrentScreen.SEARCH_RESULTS,
        // currentScreen: JSON.parse(localStorage.getItem( 'currentScreen')) || CurrentScreen.SEARCH_RESULTS,
        guestScreen: GuestScreen.LOGIN,
    };

    componentWillMount() {
        this.props.isUserLoggedIn();

    }

    render() {
        return (
            <div style={styles.container} className="pt-dark">
                {this.props.isLoggedIn
                    ? <div style={styles.profileContainer}>
                        <SockJsClient url={'/ws'} topics={['/topic/user/' + this.props.user.id]}
                                      onMessage={(message) => {
                                          console.log(message);
                                          this.props.addReceivedMessage(message)
                                      }}
                                      onConnect={() => {
                                          console.log("Connected")
                                      }}
                                      onDisconnect={() => {
                                          console.log("Disconnected")
                                      }}
                        />
                        <UserPublicProfile
                            currentScreen={this.state.currentScreen}
                            changeScreen={(currentScreen: CurrentScreen) => this.setState({currentScreen})}
                            changeGuestScreen={(guestScreen : GuestScreen) => this.setState({guestScreen})}
                        />
                        {this.state.currentScreen === CurrentScreen.SEARCH_RESULTS
                            ? <SearchResults
                                changeScreen={(currentScreen: CurrentScreen) => this.setState({currentScreen})}
                            />
                            : <ChatConversations userId={this.props.user.id}/>
                        }
                    </div>
                    : (this.state.guestScreen === GuestScreen.LOGIN)
                        ? <LoginForm changeScreen={(screen: GuestScreen) => this.setState({guestScreen: screen})}/>
                        : <SignupForm changeScreen={(screen: GuestScreen) => {
                            this.setState({guestScreen: screen})
                        }}/>
                }
            </div>
        );
    }
}

const styles = {
    container: {


        display: 'flex',
        flex: 1,
        justifyContent: "center",
        alignItems: "stretch",
        minHeight: '100%',
    },
    profileContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: "stretch",
        alignItems: "stretch",
        flexDirection: 'row',
    },
} as React.CSSProperties;

export default connect(mapStateToProps, Actions)(Main);
