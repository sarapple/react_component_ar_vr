export type NodePose = {
    position: { x: number, y: number, z: number },
    rotation: { x: number, y: number, z: number, w: number },
    scale: { x: number, y: number, z: number },
};

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
    shouldShowBoard: boolean,
    localUser: null | string,
}

export interface TicTacToeModelState {
    board: MovableNodeState,
	pawns: Pawn[],
}
