import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import {UserReducer, UserReducerState} from "./reducers/UserReducer";


export interface FullState  {
    UserReducer: UserReducerState
}

let reducers  = {
    UserReducer: UserReducer,
};

export default createStore(
    combineReducers(reducers),
    applyMiddleware(thunk, logger),
);

