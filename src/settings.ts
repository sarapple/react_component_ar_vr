export const modelSettings = {
    board: {
        path: "models/board.glb",
        dimensions: {x: 6.0, y: 0.2, z: 6.0},
    },
    resetButton: {
        path: "models/reset.glb",
        dimensions: {x: 2.0, y: 2.0, z: 0.8},
    },
    destroyButton: {
        path: "models/destroy.glb",
        dimensions: {x: 2.0, y: 2.0, z: 2.0}
    },
    x: {
        path: "models/x.glb",
        dimensions: {x: 2.0, y: 2.0, z: 2.0}
    },
    o: {
        path: "models/o.glb",
        dimensions: {x: 2.0, y: 2.0, z: 2.0}
    }
}
export const sceneScale = 0.1;
export const gameSessionId = "TIC_TAC_TOE_SESSION_10101010";
export const gameNameSpace = "TIC_TAC_TOE";
export const gameTickRate = 1000;
export const ownershipLease = 500;

export const enum GameEvents {
    state_update = "state_update",
    state_has_updated = "state_has_updated",
}

export const enum TicTacToeEvents {
    board_ownership_request = "board_ownership_request",
    pawn_ownership_request = "pawn_ownership_request",
    spawn_pawn = "spawn_pawn",
    pawn_moved = "pawn_moved",
    reset = "reset",
    board_moved = "board_moved",
    destroy = "destroy",
}
