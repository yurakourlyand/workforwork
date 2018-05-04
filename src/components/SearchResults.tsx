import * as React from 'react';
import {connect} from 'react-redux';
import {CSSProperties} from 'react';
import {FullState} from '../state';
import {User, UserTag} from '../state/TypeDefs';
import {
    Card, Elevation, Navbar,
    NavbarHeading, NavbarGroup, Button,
    Alignment, Icon, Tag, Collapse, FormGroup
}
    from '@blueprintjs/core';
import * as _ from 'lodash';
import {CurrentScreen} from './Main';
import {
    sendMessage,
} from '../state/reducers/UserReducer';

const Actions = {
    sendMessage
};

const mapStateToProps = (state: FullState) => {
    let {
        matchingResults,
        isLoadingResults,
        loadingResultsError,
        user,
    } = state.UserReducer;

    return {
        matchingResults,
        isLoadingResults,
        loadingResultsError,
        user
    }
};

interface Props {
    matchingResults: User[],
    isLoadingResults: boolean,
    loadingResultsError: string,
    user: User,
    changeScreen: (screen: CurrentScreen) => void,
    sendMessage: typeof sendMessage,
}

interface State {
    filteredResults: User[],
    collapsedUserIds: number[],
    filter: string,
    selectedArea: string
}

class SearchResults extends React.Component<Props, State> {

    state = {
        collapsedUserIds: [],
        filteredResults: [],
        filter: '',
        selectedArea: '',
    };

    componentWillMount() {
        this.filterResults(this.props.matchingResults, this.state.filter, this.state.selectedArea);
    }


    isTagRequired = (tag: UserTag, userTags: UserTag[]) => {
        return _.some(userTags, {id: tag.id});
    };

    includesTag = (filter: string, tags: UserTag[]) => {
        for (let tagIndex in tags) {
            let tag: UserTag = tags[tagIndex];
            if (tag.name && tag.name.toLowerCase().includes(filter)
                || tag.hebrewName.includes(filter)) return true;
        }
        return false;
    };

    filterResults = (users: User[], filter: string, selectedArea?: string | null) => {
        let f = filter.toLowerCase();
        let filteredResults: User[] = users.filter(u => {
            if (u.address && !u.address.generalArea.includes(selectedArea)) return null;
            return !filter
                || u.userName.toLowerCase().includes(f)
                || (u.fullName && u.fullName.toLowerCase().includes(f))
                || this.includesTag(f, u.tags)

        });
        this.setState({filteredResults, filter, selectedArea});
    };


    componentWillReceiveProps(newProps: Props) {
        // TODO: Optimize!!!
        let results = newProps.matchingResults;
        this.filterResults(results, this.state.filter, this.state.selectedArea);
    }


    render() {
        let userRequiredTags = this.props.user.requiredTags;
        let userTags = this.props.user.tags;

        return (
            <div style={styles.container}>
                <Navbar style={styles.navbar}>
                    <NavbarGroup align={Alignment.LEFT}>
                        <NavbarHeading>Match Results</NavbarHeading>
                    </NavbarGroup>
                    <NavbarGroup align={Alignment.RIGHT}>

                        <div style={{marginRight: 10}} className="pt-select pt-fill">
                            <select onChange={event =>{
                                this.filterResults(this.props.matchingResults, this.state.filter,event.target.value)
                            }} className="pt-default pt-fill" name="" id="">
                                <option selected value="">All Areas</option>
                                <option value="Hamerkaz">Hamerkaz</option>
                                <option value="Hasharon">Hasharon</option>
                                <option value="Hazafon">Hazafon</option>
                                <option value="Hadarom">Hadarom</option>
                                <option value="Jerusalem">Jerusalem</option>
                            </select>
                        </div>

                        <div className="pt-input-group">
                            <Icon icon={"search"}/>
                            <input
                                type="text"
                                className="pt-input pt-round"
                                placeholder="Filter Results"
                                value={this.state.filter}
                                onChange={e => this.filterResults(this.props.matchingResults, e.target.value, this.state.selectedArea)}
                            />
                        </div>
                    </NavbarGroup>

                </Navbar>

                <Card
                    style={styles.card}
                    elevation={Elevation.FOUR}
                >
                    {_.map(this.state.filteredResults, (user: User) => {

                        let collapsed: boolean = _.includes(this.state.collapsedUserIds, user.id);
                        return (
                            <Card
                                onClick={() => {
                                    if (!collapsed) this.setState({
                                        collapsedUserIds: [...this.state.collapsedUserIds, user.id]
                                    });
                                    else {
                                        this.setState({
                                            collapsedUserIds:
                                                _.filter(this.state.collapsedUserIds, val => val !== user.id)
                                        })
                                    }
                                }}
                                interactive
                                elevation={Elevation.TWO}
                                key={user.id}
                                style={styles.singleResult}
                            >
                                <div style={styles.cardContainer}>

                                    <div style={styles.cardHeaderContainer}>
                                        <div>
                                            <div style={styles.avatarUsernameBox}>
                                                <img className="pt-elevation-2"
                                                     style={styles.smallAvatar}
                                                     src={(user.profileImagePath) ? user.profileImagePath : '/img/default_avatar.jpg'}
                                                />
                                                <h4>{user.fullName}</h4>
                                            </div>
                                            <Button text={"Send a Message"} style={{marginTop: 10}} onClick={() => {
                                                this.props.sendMessage(user, null);
                                                this.props.changeScreen(CurrentScreen.CONVERSATIONS);
                                            }}/>
                                        </div>
                                        {
                                            user.address &&  <h4>{user.address.generalArea}</h4>
                                        }

                                        <div style={styles.headerAndTagsContainer}>
                                            <div style={styles.tagsHeaderBox}>
                                                <h4>Skills</h4>
                                            </div>
                                            <div style={styles.tagsContainer}>
                                                {_.map(user.tags, (tag: UserTag) => {

                                                    let className: string =
                                                        (this.isTagRequired(tag, userRequiredTags)) ? "pt-intent-success" : "pt-intent-default";
                                                    return (
                                                        <Tag key={tag.id} className={className}
                                                             style={styles.tag}>{tag.name}</Tag>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <Collapse isOpen={collapsed}>
                                        <Card style={styles.collapsedInfo}>
                                            <div style={styles.collapsedHalfBox}>
                                                <h4>{user.userName}</h4>
                                                <p>age: {user.age}</p>
                                                <p>{user.summary}</p>
                                            </div>
                                            <div style={styles.collapsedHalfRightBox}>
                                                <h4>Looking for</h4>
                                                <div style={styles.collapsedHalfTagsBox}>
                                                    {
                                                        _.map(user.requiredTags, (tag: UserTag) => {
                                                            let className: string =
                                                                (this.isTagRequired(tag, userTags)) ? "pt-intent-primary" : "pt-intent-default";
                                                            return <Tag style={styles.tag} className={className}
                                                                        key={tag.id}>
                                                                {tag.name}
                                                            </Tag>
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </Card>
                                    </Collapse>
                                </div>
                            </Card>
                        )
                    })}
                </Card>
            </div>
        )
    }
}

const styles = {
    container: {
        flex: 3,
        marginTop: 15,
        marginBottom: 15,
        marginRight: 15,
        justifyContent: 'stretch',
        alignItems: 'stretch',
    },

    card: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 15,
    },
    navbar: {
        marginBottom: 15,
    },

    singleResult: {},

    cardContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
    },

    cardHeaderContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    collapsedInfo: {
        display: 'flex',
        marginTop: 20,
    },

    tagsHeaderBox: {
        padding: 5,
        textAlign: 'right',
    },

    headerAndTagsContainer: {
        display: 'flex',
        flexDirection: 'column',
    },

    collapsedHalfBox: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        paddingTop: 10,
        paddingBottom: 10,
    },

    collapsedHalfRightBox: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'flex-end',
    },

    collapsedHalfTagsBox: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
    },

    smallAvatar: {
        width: 50,
        height: 50,
        borderRadius: 200,
        marginRight: 20,
    },
    avatarUsernameBox: {
        display: 'flex',
        alignItems: 'center',
    },
    tag: {
        marginTop: 5,
        marginLeft: 5,
    },
    tagsContainer: {
        textAlign: 'right',
        maxWidth: 300,

    },


} as CSSProperties;

export default connect(mapStateToProps, Actions)(SearchResults);
