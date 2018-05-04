import * as React from 'react';
import {connect} from 'react-redux';
import {FullState} from "../state";
import {UserTag, User} from "../state/TypeDefs";
import {
    fetchMatchingUsers,
    removeTag,
    logout,
    fetchGlobalTags,
    addTag,
    fetchConversations
} from '../state/reducers/UserReducer';
import * as _ from 'lodash';
import axios from 'axios';

import {
    Popover, Tag, Card,
    Elevation, Intent, Button,
    ButtonGroup, Spinner, Classes, Overlay, Icon
}
    from '@blueprintjs/core';
import {CSSProperties} from 'react';
import {CurrentScreen, GuestScreen} from './Main';


const Actions = {
    fetchMatchingUsers,
    removeTag,
    logout,
    fetchGlobalTags,
    addTag,
    fetchConversations
};

const mapStateToProps = (fullState: FullState) => {

    let {
        user,
        matchingResults,
        isLoadingResults,
        loadingResultsError,
        globalTags,
        fetchingTagsList,
    } = fullState.UserReducer;

    return {
        user,
        matchingResults,
        isLoadingResults,
        loadingResultsError,
        globalTags,
        fetchingTagsList
    }
};

interface Props {
    isLoadingUser: boolean,
    loadingUserError: string,
    user: User | null,
    fetchMatchingUsers: typeof fetchMatchingUsers,
    removeTag: typeof removeTag,
    matchingResults: User[],
    logout: typeof logout,
    isLoadingResults: boolean,
    globalTags: UserTag[],
    loadingResultsError: string,
    currentScreen: CurrentScreen,
    changeScreen: (CurrentScreen) => void,
    guestScreen: GuestScreen,
    changeGuestScreen: (GuestScreen) => void,
    addTag: typeof addTag,
    fetchingTagsList: {},
    fetchGlobalTags: typeof fetchGlobalTags,
    fetchConversations: typeof fetchConversations,
}

interface State {
    filteredResults: UserTag[],
    filter: string,
    isMyTags: boolean,
    userProfileImage: string,
}

export class UserPublicProfile extends React.Component<Props, State> {

    state = {
        filteredResults: [],
        filter: '',
        isMyTags: true,
        userProfileImage: this.props.user.profileImagePath

    };

    componentWillMount() {
        this.props.fetchMatchingUsers();
        this.props.fetchGlobalTags();
        this.props.fetchConversations();
    }

    componentWillReceiveProps(newProps: Props) {
        // TODO: Optimize!!!
        this.filterResults(newProps.globalTags, this.state.filter, this.state.isMyTags);
    }


    filterResults = (tags: UserTag[], filter: string, isMySkills: boolean) => {
        let f = filter.toLowerCase();
        let myTags: UserTag[] = isMySkills ? this.props.user.tags : this.props.user.requiredTags;
        let filteredResults: UserTag[] = tags.filter(t => {
            if (_.some(myTags, t)) return null;
            else if (!filter) return t;
            else if (t.name.toLowerCase().includes(f) || t.hebrewName.includes(f)) {
                return t;
            } else return null;
        });
        this.setState({filteredResults, filter});
    };


    addTagsButton = (isMyTags: boolean) => {
        return (
            <Popover content={
                <Card className="pt-minimal" style={{alignItems: 'center'}}>
                    <h3>Add your skills</h3>
                    <div style={{marginBottom: 10}} className="pt-input-group">
                        <Icon icon={"search"}/>
                        <input
                            type="text"
                            className="pt-input pt-round"
                            placeholder="Filter Results"
                            value={this.state.filter}
                            onChange={e => {
                                this.filterResults(this.props.globalTags, e.target.value, isMyTags)
                            }}
                        />

                    </div>
                    <ButtonGroup style={styles.tagSelection} vertical={true} className="pt-button-group pt-align-left">
                        {
                            _.map(this.state.filteredResults, (tag: UserTag) => {
                                return ( !_.some(this.props.fetchingTagsList.valueOf(),tag)?
                                    <Button style={{marginRight: 10}}
                                            intent={isMyTags === true ? Intent.PRIMARY : Intent.SUCCESS}
                                            icon="plus"
                                            onClick={() => {
                                                this.props.addTag(tag, isMyTags);
                                                this.filterResults(this.props.globalTags, this.state.filter, isMyTags);
                                            }}
                                            className="pt-button" key={tag.id}> {tag.name}</Button>
                                        : <div style={styles.centeredSpinner}>
                                            <Spinner/>
                                        </div>
                                )
                            })
                        }
                    </ButtonGroup>
                </Card>
            }>
                <button type="button" onClick={() => {
                    this.setState({isMyTags: isMyTags});
                    this.filterResults(this.props.globalTags, this.state.filter, isMyTags);
                }}
                        className={isMyTags ? "pt-button pt-small pt-intent-primary" : "pt-button pt-small pt-intent-success"}>
                    Add tag
                    <span className="pt-icon-standard pt- pt-icon-add pt-align-right"/>
                </button>
            </Popover>
        )
    };

    render() {
        let {isLoadingUser, user, loadingUserError} = this.props;
        let {userProfileImage} = this.state;
        if (loadingUserError) {
            return (
                <div>error:{loadingUserError}</div>
            );
        }
        if (isLoadingUser || !user) {
            return (
                <Spinner/>
            )
        }

        if (userProfileImage) {
            axios.get(userProfileImage).then().catch(err => this.setState({userProfileImage: '/img/default_avatar.jpg'}))
        }else {
            this.setState({userProfileImage: '/img/default_avatar.jpg'})
        }


        return (
            <Card style={styles.card} elevation={Elevation.FOUR}>
                <img src={userProfileImage} alt="user profile image" style={{width: 200, height: 200}}/>
                <div style={styles.userInfo}>
                    <h2>{user.fullName}</h2>
                    <ButtonGroup fill style={styles.navPanel}>
                        <Button
                            active={this.props.currentScreen === CurrentScreen.SEARCH_RESULTS}
                            text={"Results"}
                            intent={Intent.PRIMARY}
                            icon="search"
                            onClick={() => {
                                localStorage.setItem('currentScreen', JSON.stringify(CurrentScreen.SEARCH_RESULTS));
                                this.props.changeScreen(CurrentScreen.SEARCH_RESULTS)
                            }}
                        />
                        <Button
                            active={this.props.currentScreen === CurrentScreen.CONVERSATIONS}
                            text={"Conversations"}
                            intent={Intent.PRIMARY}
                            icon={'chat'}
                            onClick={() => {
                                localStorage.setItem('currentScreen', JSON.stringify(CurrentScreen.CONVERSATIONS));
                                this.props.changeScreen(CurrentScreen.CONVERSATIONS)
                            }}
                        />
                        <Button
                            icon={'log-out'}
                            intent={Intent.DANGER}
                            onClick={() =>{
                                this.props.logout();
                                this.props.changeGuestScreen(GuestScreen.LOGIN);
                            } }
                        />
                    </ButtonGroup>

                    <div><strong>User:</strong> {user.userName}</div>
                    {user.summary && <div><strong>About me:</strong> {user.summary}</div>}
                    <div><strong>Age:</strong> {user.age}</div>
                </div>

                <Card style={styles.addTagsAndTitleDiv}>
                    <div>My Skills</div>
                    {this.addTagsButton(true)}
                </Card>
                <Card
                    style={styles.skillsStyle}
                    elevation={Elevation.TWO}
                >
                    <div style={styles.tagPool}>

                        {user.tags &&
                        _.map(user.tags, (tag: UserTag) => {
                            return (
                                <Tag
                                    style={styles.tag}
                                    className="pt-large"
                                    onRemove={() => this.props.removeTag(tag, true)}
                                    intent={Intent.PRIMARY}
                                    key={tag.id}
                                    interactive
                                >
                                    {tag.name}
                                </Tag>
                            )
                        })
                        }

                    </div>
                </Card>
                <br/>
                <Card style={styles.addTagsAndTitleDiv}>
                    <div>Required Skills</div>
                    {this.addTagsButton(false)}
                </Card>
                <Card style={styles.skillsStyle} elevation={Elevation.TWO}>
                    <div style={styles.tagPool}>

                        {user.requiredTags &&
                        _.map(user.requiredTags, (tag: UserTag) => {
                            return (
                                <Tag
                                    style={styles.tag}
                                    className="pt-large"
                                    onRemove={() => this.props.removeTag(tag, false)}
                                    intent={Intent.SUCCESS}
                                    key={tag.id}
                                    interactive
                                >
                                    {tag.name}
                                </Tag>
                            )
                        })}
                    </div>
                </Card>
            </Card>
        );


    }
}


const styles = {
    card: {
        flex: 1,
        margin: 15,
    },
    addTagsButton: {

        borderRadius: 200,

    },
    tagSelection: {
        minWidth: '100%',
        maxHeight: '20vh',
        overflow: 'auto',
        overflowX: 'hidden',
    },
    addTagsAndTitleDiv: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        padding: 5,

    },
    userInfo: {
        margin: 10,
    },
    centeredSpinner: {
        display: 'flex',
        maxHeight: '30px',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    skillsStyle: {
        overflow: 'auto',
        maxHeight: '16vh',
        padding: 5,
        margin: 0,
    },
    tagPool: {},
    tag: {
        margin: 5,
    },
    navPanel: {
        marginTop: 10,
        marginBottom: 10,
    },
} as CSSProperties;

export default connect(mapStateToProps, Actions)(UserPublicProfile);
