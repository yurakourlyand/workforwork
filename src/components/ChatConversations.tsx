import * as React from 'react';
import {connect} from 'react-redux';
import {CSSProperties, Ref} from 'react';
import {FullState} from '../state';
import {Conversation, Message, User, UserTag} from '../state/TypeDefs';
import * as moment from 'moment';
import * as _ from 'lodash';
import SockJsClient from 'react-stomp'
import {
    Navbar, NavbarGroup, Alignment,
    NavbarHeading, Icon, Card,
    Elevation, Spinner, Intent,
    Colors, TextArea, Button
}
    from '@blueprintjs/core';
import {
    sendMessage,
    setSelectedConversation,
    addReceivedMessage,
} from '../state/reducers/UserReducer';


const Actions = {
    sendMessage,
    setSelectedConversation,
    addReceivedMessage
};

const mapStateToProps = (state: FullState) => {
    let {
        conversations,
        isLoadingConversations,
        loadingConversationError,
        usersMap,
        user,
        sending,
        selectedConversation,
        selectedUser,
        randomKey

    } = state.UserReducer;
    return {
        conversations,
        isLoadingConversations,
        loadingConversationError,
        usersMap,
        user,
        selectedConversation,
        sending,
        selectedUser,
        randomKey
    }
};

interface Props {
    randomKey: number;

    addReceivedMessage: typeof addReceivedMessage,
    conversations: Conversation[],
    usersMap: { [id: number]: User },
    isLoadingConversations: boolean,
    loadingConversationError: string,
    selectedConversation: Conversation,

    sendMessage: typeof sendMessage,
    setSelectedConversation: typeof setSelectedConversation,
    selectedUser: User | null,

    userId: number,
    user: User,
    sending: boolean,

}


interface State {
    filter: string,
    filteredConversations: Conversation[],
    message: string,
    conversations: Conversation[]

}

class ChatConversations extends React.Component<Props, State> {

    constructor(props) {
        super(props);
        this.state = {
            filter: '',
            filteredConversations: [],
            message: '',
            conversations: this.props.conversations
        };
    }


    endOfMessages = null;


    componentDidUpdate() {
        this.scrollToBottom();//todo FIX ME!
    }


    getUserFromConversation(c: Conversation) {
        let otherUserId: number =
            (c.userAId === this.props.userId)
                ? c.userBId
                : c.userAId;
        let otherUser: User | null = this.props.usersMap[otherUserId];
        return otherUser;
    }


    drawSingleConversation = (c: Conversation) => {
        let otherUser: User = this.getUserFromConversation(c);
        let isSelected: boolean =
            this.props.selectedConversation ?
                (this.props.selectedConversation.id === c.id) : false;
        let image: string = (otherUser && otherUser.profileImagePath) ? otherUser.profileImagePath : '/img/default_avatar.jpg';

        return (
            <Card
                key={c.id}
                style={isSelected ? styles.singleContactSelected : styles.singleContactRegular}
                interactive
                elevation={Elevation.ZERO}
                onClick={() => this.props.setSelectedConversation(c, otherUser)}
            >
                {otherUser
                    ? <div>
                        <div style={styles.avatarUsernameBox}>
                            <img className="pt-elevation-2" style={styles.smallAvatar} src={image}
                                 alt="profile image of user"/>
                            <div>{otherUser.fullName}</div>
                            <Icon icon={'arrow-right'}/>
                        </div>
                    </div>
                    : <div style={styles.centeredSpinner}>
                        <Spinner/>
                    </div>
                }
            </Card>
        )
    };

    scrollToBottom = () => {
        this.endOfMessages &&
        this.endOfMessages.scrollIntoView({behavior: "smooth"});
    };


    drawSelectedConversation = () => {
        let c: Conversation = this.props.selectedConversation;
        let u: User = this.props.selectedUser;
        return (
            <Card style={styles.selectedConversation}>
                {c
                    ? <div>
                        <h4>Conversation with {u.fullName}</h4>
                        <div className="scrollingContainer" style={styles.messagesBox}>

                            {_.map(c.messages, (m: Message) => {
                                let isMyMessage = m.authorId === this.props.userId;

                                let image = isMyMessage ? this.props.user.profileImagePath : u.profileImagePath;
                                if (!image) image = '/img/default_avatar.jpg';
                                return (
                                    <Card key={m.id} style={styles.singleMessage} elevation={Elevation.TWO}>
                                        <img style={styles.smallAvatar} src={image} alt=""/>
                                        <div style={{flex: 1}}>
                                            <div style={styles.messageTitle}>
                                                {isMyMessage
                                                    ? <div>Me: </div>
                                                    : <div>{u.fullName}</div>
                                                }
                                                {moment(m.time).format('DD/MM/YY  h:mm a')}
                                            </div>
                                            <div style={styles.messageBody}>
                                                {m.message}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })
                            }
                            <div style={{float: "left", clear: "both"}}
                                 ref={(el) => {
                                     this.endOfMessages = el;
                                 }}>
                            </div>
                        </div>
                        <div style={styles.messageInputAndButton}>
                        <TextArea
                            autoFocus
                            large
                            fill
                            rows={50}
                            draggable={false}
                            value={this.state.message}
                            onChange={e => this.setState({message: e.target.value})}
                        />
                            {this.props.sending
                                ? <Spinner/>
                                : <Button
                                    icon={"envelope"}
                                    onClick={() => {
                                        this.props.sendMessage(u, this.state.message);
                                        this.setState({message: ''});
                                    }}
                                />
                            }
                        </div>
                    </div>
                    : <h5>Select someone</h5>
                }
            </Card>
        )
    };


    drawConversations = () => {
        return (
            <Card
                style={styles.contactsList}
                elevation={Elevation.FOUR}
            >
                {(!this.props.conversations)
                    ? <Spinner intent={Intent.PRIMARY}/>
                    : _.map(this.props.conversations, (c => this.drawSingleConversation(c)))
                }
            </Card>
        )
    };

    render() {

        return (
            <div style={styles.container}>
                <Navbar style={styles.navbar}>
                    <NavbarGroup align={Alignment.LEFT}>
                        <NavbarHeading>My Messages</NavbarHeading>
                    </NavbarGroup>
                    <NavbarGroup align={Alignment.RIGHT}>
                        <div className="pt-input-group">
                            <Icon icon={"search"}/>
                            <input
                                disabled={true}
                                type="text"
                                className="pt-input pt-round"
                                placeholder="Filter will be available in the future"
                            />
                        </div>
                    </NavbarGroup>
                </Navbar>
                <div style={styles.conversationsContainer}>
                    {this.drawConversations()}
                    {this.drawSelectedConversation()}
                </div>
            </div>
        );
    }

}


const styles = {
    container: {
        flex: 3,
        marginTop: 15,
        marginBottom: 15,
        marginRight: 15,
    },

    conversationsContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'stretch',
    },


    navbar: {
        marginBottom: 15,
    },

    selectedConversation: {
        flex: 3,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    messagesBox: {
        overflow: 'auto',
        maxHeight: '70vh',
    },

    messageInputAndButton: {
        padding: 10,
        display: 'flex',
        alignItems: 'stretch',
    },

    contactsList: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 5,
        marginRight: 5,
    },

    centeredSpinner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },

    smallAvatar: {
        width: 30,
        height: 30,
        borderRadius: 200,
        marginRight: 10,
    },

    avatarUsernameBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },

    singleContactSelected: {
        padding: 5,
        margin: 0,
        backgroundColor: Colors.DARK_GRAY2,
        color: Colors.GRAY1,
    },
    singleContactRegular: {
        padding: 5,
        margin: 0,
        color: Colors.GRAY1,

        backgroundColor: Colors.DARK_GRAY4,
    },
    singleMessage: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        margin: 15,
    },
    messageBody: {
        padding: 10,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',

    },
    messageTitle: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 13,
        color: Colors.GRAY5,
    },

} as CSSProperties;


export default connect(mapStateToProps, Actions)(ChatConversations);
