import {Conversation, GetStateFunction, Message, User, UserTag} from '../TypeDefs';
import axios from 'axios';
import * as _ from 'lodash';
import {type} from "os";

// Login Actions

interface LoginAttempt {
    type: 'user_reducer/login_attempt',
}

interface LoginSuccess {
    type: 'user_reducer/login_success',
    user: User,
}

interface LoginError {
    type: 'user_reducer/login_error',
    error: string,
}

interface UserIsAlreadyLoggedIn {
    type: 'user_reducer/user_already_logged_in',
    user: User,
}

// Load matching results

interface LoadUserMatchesAttempt {
    type: 'user_reducer/load_user_matches_attempt',
}

interface LoadUserMatchesSuccess {
    type: 'user_reducer/load_user_matches_success',
    users: Array<User>,
}

interface LoadUserMatchesError {
    type: 'user_reducer/load_user_matches_error',
    error: string,
}

interface LoadGlobalTagsAttempt {
    type: 'user_reducer/load_global_tags_attempt',
}

interface LoadGlobalTagsSuccess {
    type: 'user_reducer/load_global_tags_success',
    tags: Array<UserTag>,
}

interface LoadGlobalTagsError {
    type: 'user_reducer/load_global_tags_error',
    error: string,
}

interface UserWasUpdated {
    type: 'user_reducer/user_updated',
    user: User
}

interface FetchConversationsAttempt {
    type: 'user_reducer/fetch_conversations_attempt',
}

interface FetchConversationsSuccess {
    type: 'user_reducer/fetch_conversations_success',
    conversations: Conversation[],
}

interface FetchConversationsError {
    type: 'user_reducer/fetch_conversations_error',
    error: string,
}

interface GotConversationUser {
    type: 'user_reducer/got_conversation_user',
    user: User,
}

interface AddMessageToConversationAttempt {
    type: 'user_reducer/add_message_to_conversation_attempt',
}

interface AddMessageToConversationSuccess {
    type: 'user_reducer/add_message_to_conversation_success',
    newConversations?: Conversation[],
}

interface AddMessageToConversationError {
    type: 'user_reducer/add_message_to_conversation_error',
    error: string,
}

interface SignUpAttempt {
    type: 'user_reducer/sign_up_attempt',
}

interface SignUpSuccess {
    type: 'user_reducer/sign_up_success',
    user: User,
}

interface SignUpError {
    type: 'user_reducer/sign_up_error',
    error: string,
}

interface SetSelectedConversation {
    type: 'user_reducer/set_selected_conversation',
    conversation: Conversation,
    user: User,
}

interface Logout {
    type: 'user_reducer/logout',
}

interface FetchUserTagsAttempt {
    type: 'user_reducer/fetch_user_tags_attempt',
    tag: UserTag,
}

interface FetchUserTagsSuccess {
    type: 'user_reducer/fetch_user_tags_success',
    tag: UserTag,
    user
}


type Action =
    LoadUserMatchesAttempt
    | LoadUserMatchesSuccess
    | LoadUserMatchesError
    | LoginAttempt
    | LoginSuccess
    | LoginError
    | UserIsAlreadyLoggedIn
    | UserWasUpdated
    | FetchConversationsAttempt
    | FetchConversationsSuccess
    | FetchConversationsError
    | GotConversationUser
    | AddMessageToConversationAttempt
    | AddMessageToConversationSuccess
    | AddMessageToConversationError
    | SetSelectedConversation
    | Logout
    | SignUpAttempt
    | SignUpSuccess
    | SignUpError
    | LoadGlobalTagsAttempt
    | LoadGlobalTagsSuccess
    | LoadGlobalTagsError
    | FetchUserTagsAttempt
    | FetchUserTagsSuccess
    ;

type Dispatch = (action: Action) => void

export let login = (user: string, pass: string) => {

    return (dispatch: Dispatch, getState: GetStateFunction) => {
        dispatch({
            type: "user_reducer/login_attempt",
        });
        axios.post('/user/login', {
            username: user.trim(),
            password: pass.trim(),
        })
            .then(res => {
                let user: User = res.data;
                dispatch({
                    type: "user_reducer/login_success",
                    user
                });
                fetchConversations()(dispatch, getState);
            })
            .catch(err => {
                dispatch({
                    type: "user_reducer/login_error",
                    error: "User name or Password incorrect",
                })
            });

    }
};

export const logout = () => {

    return (dispatch: Dispatch, getState: GetStateFunction) => {
        axios.get('/user/logout')
            .then(ok => dispatch({type: 'user_reducer/logout'}))
            .catch(err => console.error(err))
    }
};


export const signUp = (user: User | any) => {

    return (dispatch: Dispatch, getState: GetStateFunction) => {
        dispatch({
            type: 'user_reducer/sign_up_attempt',
        });

        axios.post('user/signup', user)
            .then(res => {
                dispatch({
                    type: 'user_reducer/sign_up_success',
                    user: res.data,
                })
            })
            .catch(err => {
                console.log(err);
                dispatch({
                    type: 'user_reducer/sign_up_error',
                    error: err.response.data,
                })
            });
    }
};

export let isUserLoggedIn = () => {

    return (dispatch: Dispatch, getState: GetStateFunction) => {
        axios.get('user/isLoggedIn')
            .then(res => {
                let user: User = res.data;
                dispatch({
                    type: 'user_reducer/login_success',
                    user
                })
            })
            .catch();
    }
};

export const fetchMatchingUsers = () => {

    return (dispatch: Dispatch, getState: GetStateFunction) => {
        dispatch({
            type: "user_reducer/load_user_matches_attempt"
        });

        axios.get('user/findUserMatches/')
            .then(response => {
                let users: User[] = response.data;
                console.log(response.data);
                dispatch({
                    type: "user_reducer/load_user_matches_success",
                    users
                })
            })
            .catch(response => {
                let error: string = response.status === 404
                    ? 'user not found'
                    : 'error while loading matching users';
                dispatch({
                    type: 'user_reducer/load_user_matches_error',
                    error,
                });
            })
    }
};


export const addReceivedMessage = (msgOrCon) => {

    return (dispatch: Dispatch, getState: GetStateFunction) => {
        let newConversations: Conversation[] = getState().UserReducer.conversations;
        let madeNewConv: boolean = true;
        if (msgOrCon.authorId) {
            newConversations.forEach( (part, index, theArray) => {
                if (newConversations[index].id === msgOrCon.convId) {
                    part.messages.push(msgOrCon);
                    newConversations[index] = part;
                    madeNewConv = false;
                    return;
                }
            });
        }
        if (madeNewConv) {
            console.log("made new conversation");
            newConversations.push(msgOrCon);
                let otherUserId = msgOrCon.userAId ===  getState().UserReducer.user.id ? msgOrCon.userBId : msgOrCon.userAId;
                axios.get('/user/' + otherUserId)
                    .then(res => {
                        let user: User = res.data;
                        dispatch({
                            type: 'user_reducer/got_conversation_user',
                            user,
                        })
                    })
                    .catch(err => {
                        console.error(err);
                    })
        }
        dispatch({
            type: "user_reducer/add_message_to_conversation_success",
            newConversations
        });
    }
};


export const fetchGlobalTags = () => {

    return (dispatch: Dispatch, getState: GetStateFunction) => {
        dispatch({
            type: "user_reducer/load_global_tags_attempt"
        });
        axios.get('/user/tags')
            .then(response => {
                let tags: UserTag[] = response.data;
                dispatch({
                    type: "user_reducer/load_global_tags_success",
                    tags
                })
            })
            .catch(response => {
                let error: string = response.status === 404
                    ? 'tags not found'
                    : 'error while loading tags';
                dispatch({
                    type: 'user_reducer/load_global_tags_error',
                    error,
                });
            })
    }
};


export const removeTag = (tag: UserTag, isMyTag: boolean) => {

    return (dispatch: Dispatch, getState: GetStateFunction) => {
        dispatch({
            type: "user_reducer/fetch_user_tags_attempt",
            tag
        });
        axios
            .put('/user/removeTag/' + tag.id + '/' + isMyTag)
            .then(res => {
                let user: User = res.data;
                dispatch({
                    type: "user_reducer/fetch_user_tags_success",
                    tag,
                    user
                });
                fetchMatchingUsers()(dispatch, getState);
            })
    };
};


export const addTag = (tag: UserTag, isMyTag: boolean) => {
    return (dispatch: Dispatch, getState: GetStateFunction) => {
        dispatch({
            type: "user_reducer/fetch_user_tags_attempt",
            tag
        });
        axios
            .put('/user/addTag/' + tag.id + '/' + isMyTag)
            .then(res => {
                let user: User = res.data;
                dispatch({
                    type: "user_reducer/fetch_user_tags_success",
                    tag,
                    user
                });
                fetchMatchingUsers()(dispatch, getState);
            })
    };
};

export const fetchConversations = (otherUser?: User) => {

    return (dispatch: Dispatch, getState: GetStateFunction) => {
        let user: User | null = getState().UserReducer.user;
        let userId: number = user ? user.id : 0;
        axios
            .get('/user/getConversations')
            .then(res => {
                let conversations: Conversation[] = res.data;
                dispatch({
                    type: 'user_reducer/fetch_conversations_success',
                    conversations,
                });
                _.forEach(conversations, (c) => {
                    if (otherUser) {
                        if (c.userAId === otherUser.id || c.userBId === otherUser.id) {
                            dispatch(setSelectedConversation(c, otherUser));
                        }
                    }

                    let otherUserId = c.userAId === userId ? c.userBId : c.userAId;
                    axios.get('/user/' + otherUserId)
                        .then(res => {
                            let user: User = res.data;
                            dispatch({
                                type: 'user_reducer/got_conversation_user',
                                user,
                            })
                        })
                        .catch(err => {
                            console.error(err);
                        })
                })
            })
            .catch(err => {
                console.error(err);
                dispatch({
                    type: 'user_reducer/fetch_conversations_error',
                    error: err.message,
                });
            })
    }
};


export const sendMessage = (user: User, message: string) => {
    return (dispatch: Dispatch, getState: GetStateFunction) => {
        dispatch({
            type: 'user_reducer/add_message_to_conversation_attempt',
        });
        axios.post('/user/sendMessage/' + user.id, {message})
            .then(res => {
                dispatch({
                    type: 'user_reducer/add_message_to_conversation_success'
                });
                if (!message) {
                    dispatch(setSelectedConversation(res.data, user));

                } else {
                    getState().UserReducer.conversations.forEach(conv => {
                        if (conv.userAId === user.id || conv.userBId === user.id) {

                            dispatch(setSelectedConversation(conv, user));
                        }
                    })
                }
            })
            .catch(err => {
                dispatch({
                    type: 'user_reducer/add_message_to_conversation_error',
                    error: err.message,
                });
            })
    }
};

export const setSelectedConversation = (conversation: Conversation, user: User): Action => {
    return {
        type: 'user_reducer/set_selected_conversation',
        conversation,
        user
    }
};


export interface UserReducerState {

    // current user
    isLoggedIn: boolean,
    isLoggingIn: boolean,
    loginError: string,
    user: User | null,

    // search results
    isLoadingResults: boolean,
    loadingResultsError: string,
    matchingResults: Array<User>,


    // conversations
    conversations: Conversation[],
    selectedConversation: Conversation | null,
    selectedUser: User | null,
    isLoadingConversations: boolean,

    loadingConversationError: string,

    usersMap: { [n: number]: User },

    // send message
    sending: boolean,

    // signup
    signingUp: boolean,
    signUpError: string,

    // tags
    globalTags: Array<UserTag>,
    isLoadingTags: boolean,
    fetchingTagsList: { [n: number]: UserTag },

    randomKey: number,

}

const InitialState: UserReducerState = {

    // current user

    isLoggedIn: false,
    isLoggingIn: false,
    loginError: '',

    user: null,

    // search results
    isLoadingResults: true,
    loadingResultsError: '',
    matchingResults: [],

    // conversations
    conversations: [],
    selectedConversation: null,
    selectedUser: null,
    isLoadingConversations: false,
    loadingConversationError: '',
    randomKey: 1.111,
    usersMap: {},

    sending: false,

    // signup
    signingUp: false,
    signUpError: '',

    // tags
    globalTags: [],
    isLoadingTags: false,
    fetchingTagsList: {},
};


export let UserReducer = (state: UserReducerState = InitialState, action: Action) => {
    switch (action.type) {
        case "user_reducer/load_user_matches_attempt":
            return {
                ...state,
                isLoadingResults: true,
                loadingResultsError: '',
            };
        case "user_reducer/load_user_matches_success":
            return {
                ...state,
                isLoadingResults: false,
                loadingResultsError: '',
                matchingResults: action.users,
            };
        case "user_reducer/load_user_matches_error":
            return {
                ...state,
                isLoadingResults: false,
                loadingResultsError: action.error,
            };
        case "user_reducer/login_attempt":
            return {
                ...state,
                isLoggingIn: true,
                loginError: '',
            };
        case "user_reducer/login_success":
            return {
                ...state,
                isLoggingIn: false,
                isLoggedIn: true,
                loginError: '',
                user: action.user,
            };
        case "user_reducer/login_error":
            return {
                ...state,
                isLoggingIn: false,
                loginError: action.error,
            };
        case "user_reducer/user_updated":
            return {
                ...state,
                user: action.user,
            };

        case "user_reducer/fetch_conversations_attempt":
            return {
                ...state,
                isLoadingConversations: true,
                loadingConversationError: '',
            };
        case "user_reducer/fetch_conversations_success":
            return {
                ...state,
                isLoadingConversations: false,
                loadingConversationError: '',
                conversations: action.conversations,
            };
        case "user_reducer/fetch_conversations_error":
            return {
                ...state,
                isLoadingConversations: false,
                loadingConversationError: action.error,
            };
        case 'user_reducer/got_conversation_user':
            return {
                ...state,
                usersMap: {
                    ...state.usersMap,
                    [action.user.id]: action.user,
                },
            };
        case 'user_reducer/add_message_to_conversation_attempt':
            return {
                ...state,
                sending: true,
            };

        case 'user_reducer/add_message_to_conversation_success':
            if (action.newConversations) {
                console.log("New Message/Conversation received");
                return {
                    ...state,
                    conversations: action.newConversations,
                    randomKey: Math.random()
                }
            }
            else {
                console.log("No message received");
                return {
                    ...state,
                    sending: false,
                };
            }

        case 'user_reducer/add_message_to_conversation_error':
            return {
                ...state,
                sending: false,
            };
        case 'user_reducer/set_selected_conversation':
            let user = (action.user) ? action.user : state.selectedUser;
            let conversation = action.conversation;
            return {
                ...state,
                selectedConversation: conversation,
                selectedUser: user,
            };

        case 'user_reducer/logout':
            return {
                ...state,
                isLoggedIn: false,
                user: null,

            };
        case 'user_reducer/sign_up_attempt':
            return {
                ...state,
                signingUp: true,
                error: '',
            };
        case 'user_reducer/sign_up_success':
            return {
                ...state,
                signingUp: false,
                error: '',
                user: action.user,
                isLoggedIn: true,
            };
        case 'user_reducer/sign_up_error':
            return {
                ...state,
                signingUp: false,
                signUpError: action.error,
            };
        case 'user_reducer/load_global_tags_attempt':
            return {
                ...state,
                isLoadingTags: true,
                error: '',
            };
        case 'user_reducer/load_global_tags_success':
            return {
                ...state,
                isLoadingTags: false,
                globalTags: action.tags,
                error: '',
            };
        case 'user_reducer/load_global_tags_error':
            return {
                ...state,
                isLoadingTags: false,
                error: action.error,
            };
        case 'user_reducer/fetch_user_tags_attempt':
            return {
                ...state,
                fetchingTagsList: {
                    ...state.fetchingTagsList,
                    [action.tag.id]: action.tag,
                }
            };
        case 'user_reducer/fetch_user_tags_success':
            return {
                ...state,
                user: action.user,
                fetchingTagsList: {
                    ...state.fetchingTagsList,
                    [action.tag.id]: null,
                }
            }
    }


    return state;
};
