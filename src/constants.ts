import { TicTacToeModelState, TicTacToeViewState } from './types';

export const enum CROQUET_EVENTS {
    MESSAGE_TO_CROQUET_EVENT_NAME = "FROM_REACT",
    MESSAGE_TO_REACT_EVENT_NAME = "FROM_CROQUET"
}

export const INITIAL_MODEL_STATE: TicTacToeModelState = {
    board: { 
        pose: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0, w: 1},
            scale: { x: 1, y: 1, z: 1},
        },
        properties: {
            control: {
                owner: null,
                expiration: 0
            }
        }
    },
    pawns: [],
}

export const INITIAL_VIEW_STATE: TicTacToeViewState = {
    ...INITIAL_MODEL_STATE,
    localUser: null,
    synced: false,
}