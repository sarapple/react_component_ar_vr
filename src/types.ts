import { AvVector } from '@aardvarkxr/aardvark-shared';

export type NodePose = {
    position: { x: number, y: number, z: number },
    rotation: { x: number, y: number, z: number, w: number },
    scale: { x: number, y: number, z: number },
};

export type ModelInfo = {
    path: string,
    dimensions: AvVector,
}

export type ExpiringControl = {
    owner: null | string,
    expiration: number,
}

export type MovableNodeState = {
    pose: NodePose,
    properties: {
        control: ExpiringControl,
    }
}

export type Pawn = {
    type: 'x' | 'o',
    guid: string,
    nodeState: MovableNodeState,
}

export interface TicTacToeViewState extends TicTacToeModelState {
    localUser: null | string,
    synced: boolean,
}

export interface TicTacToeModelState {
    board: MovableNodeState,
	pawns: Pawn[],
}
