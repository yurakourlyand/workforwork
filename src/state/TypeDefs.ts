import {FullState} from "./index";


export interface Rating {
    id: number,
    rating: number,

    ratedUser: User,
    ratingUser: User,
}

export interface UserTag  {
    id: number,
    name: string,
    hebrewName: string,
}

export interface Address {
    user?: User,
    id?: number,
    generalArea?: string,
    address?: String,
}

export interface User {
    id: number,
    userName: string,
    email: string,
    fullName: string,
    age: number,
    summary: string,
    profileImagePath: string,
    address: Address,

    dateJoined: Date,
    lastTimeOnline: Date,
    conversations: Conversation[],
    ratings: Array<Rating>,
    tags: Array<UserTag>,
    requiredTags: Array<UserTag>,
}

export interface Message {
    convId: number,
    id: number,
    message: string,
    time: Date,
    authorId: number,
}

export interface Conversation {
    id: number,
    userAId: number,
    userBId: number,

    messages: Message[],
}

export type GetStateFunction = () => FullState;

