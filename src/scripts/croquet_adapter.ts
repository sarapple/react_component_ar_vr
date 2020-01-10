import * as Croquet from '@croquet/croquet';
import bind from 'bind-decorator';
import { AvNodeTransform, AvVector } from '@aardvarkxr/aardvark-shared';

import { CROQUET_EVENTS, INITIAL_MODEL_STATE } from '../constants';
import { gameNameSpace, GameEvents, gameTickRate, TicTacToeEvents, modelSettings, ownershipLease } from '../settings';
import { Pawn, TicTacToeModelState, MovableNodeState } from '../types';

type CroquetUpdateHandler = (namespace: string, name: string, data: any) => void;
type CroquetSessionSettings = {
    onCroquetUpdate: CroquetUpdateHandler, 
    sessionId: string
};

// NOTE: reference croquet sdk for better examples of object / view models and subscriptions
// this subscribe all and respond with all from a single model method was used while exploring
// croquet interactions with aardvark but more modular approaches would be better / are supported by croquet.
class CroquetAdapterModel extends Croquet.Model {
    private state: TicTacToeModelState = INITIAL_MODEL_STATE;

    init() {
        // received a state update from CroquetAdapterView and update state and forward the changes to all clients
        this.subscribe(gameNameSpace, GameEvents.state_update, this.onEvent);
        this.subscribe(this.sessionId, "view-exit", this.viewExit);
        this.future(gameTickRate).tick();
    }

    viewExit(viewId: string) {
        const updatedPawns = this.state.pawns.map((existingPawn: Pawn) => {
            if (existingPawn.nodeState.properties.control.owner == viewId) {
                return {
                    ...existingPawn,
                    nodeState: this.forceExpireControl(existingPawn.nodeState, viewId),
                };
            }

            return existingPawn;
        });

        this.updatePartialStateAndPublish({
            board: this.forceExpireControl(this.state.board, viewId),
            pawns: updatedPawns,
        });
    }

    forceExpireControl(node: MovableNodeState, owner: string) {
        const needsExpiration = node.properties.control.owner == owner;
        const updatedNode = !needsExpiration 
            ? node 
            : {
                ...node,
                properties: {
                    ...node.properties,
                    control: {
                        ...node.properties.control,
                        owner: null,
                        expiration: 0,
                    }
                }
            };

        return updatedNode;
    }

    public getState(): TicTacToeModelState {
        return this.state;
    }

    /**
     * Takes an event, with type and data properties, and updates server state.
     * @param event event received from CroquetAdapterView
     */
    onEvent(event: { type: any, data: any}) {
        const { type, data } = event;
        console.log("[MODEL] Received an event from MyView with", event);
        switch (type) {
            case TicTacToeEvents.reset:
                this.resetBoard();
                break;

            case TicTacToeEvents.board_moved:
                this.boardMoved(data);
                break;

            case TicTacToeEvents.spawn_pawn:
                this.spawnPawn(data);
                break;

            case TicTacToeEvents.pawn_moved:
                this.pawnMoved(data);
                break;
            case TicTacToeEvents.board_ownership_request:
                this.boardOwnershipRequest(data);
                break;

            case TicTacToeEvents.pawn_ownership_request:
                this.pawnOwnershipRequest(data);
                break;

            default:
                break;
        }
    }

    /**
     * Updates server state data, and dispatches the state to all listening clients.
     * @param partialState The part of the state object you want to update, keyed by specific properties
     */
    updatePartialStateAndPublish(partialState: any) {
        this.state = {
            ...this.state,
            ...partialState,
        }

        this.publish(gameNameSpace, GameEvents.state_has_updated, this.state);
    }

    spawnPawn(pawn: Pawn) {
        const newPawn = {
            type: pawn.type,
            guid: pawn.guid,
            nodeState: pawn.nodeState,
        }
        this.updatePartialStateAndPublish({
            pawns: [...this.state.pawns, pawn]
        });
    }

    pawnMoved({ newPose, guid, fromView }: {newPose: AvNodeTransform, guid: string, fromView: string}) {
        const updatedPawns = this.state.pawns.map((existingPawn: Pawn) => {
            if (existingPawn.guid == guid && existingPawn.nodeState.properties.control.owner == fromView) {
                const updatedNodeState = {
                    ...existingPawn.nodeState,
                    pose: {
                        ...existingPawn.nodeState.pose,
                        ...newPose,
                    },
                    properties: {
                        control: {
                            ...existingPawn.nodeState.properties.control,
                            owner: fromView,
                            expiration: this.now() + ownershipLease,
                        },
                    }
                };

                return {
                    ...existingPawn,
                    nodeState: updatedNodeState,
                };
            }

            return existingPawn;
        });

        this.updatePartialStateAndPublish({
            pawns: updatedPawns,
        });
    }

    
    pawnOwnershipRequest({guid, fromView}: {guid:string, fromView: string}){
        const updatedPawns = this.state.pawns.map((existingPawn: Pawn) => {
            if (existingPawn.guid == guid && existingPawn.nodeState.properties.control.owner == null) {
                const updatedNodeState = {
                    ...existingPawn.nodeState,
                    properties: {
                        control: {
                            ...existingPawn.nodeState.properties.control,
                            owner: fromView,
                            expiration: this.now() + ownershipLease,
                        },
                    }
                };

                return {
                    ...existingPawn,
                    nodeState: updatedNodeState,
                };
            }

            return existingPawn;
        });

        this.updatePartialStateAndPublish({
            pawns: updatedPawns,
        });
    }

    boardMoved({ newPose, fromView }: { newPose: any, fromView: string }) {
        if (this.state.board.properties.control.owner == fromView) {
            this.updatePartialStateAndPublish({
                board: {
                    ...this.state.board,
                    pose: newPose,
                    properties: {
                        ...this.state.board.properties,
                        control: {
                            ...this.state.board.properties.control,
                            owner: fromView,
                            expiration: this.now() + ownershipLease,
                        }
                    }
                }
            });
        }
    }

    boardOwnershipRequest({fromView}: {fromView: string}){
        if(this.state.board.properties.control.owner == null){
            this.updatePartialStateAndPublish({
                board:{
                    ...this.state.board,
                    properties: {
                        ...this.state.board.properties,
                        control: {
                            ...this.state.board.properties,
                            owner: fromView,
                            expiration: this.now() + ownershipLease,
                        }
                    }
                }
            });
        }
    }

    resetBoard() {
        this.updatePartialStateAndPublish({ pawns: [] });
    }

    expireControl(node: MovableNodeState, currentTime: number): MovableNodeState {
        const needsExpiration = 
            node.properties.control.owner != null
            && node.properties.control.expiration < currentTime;

        const updatedNode = !needsExpiration 
            ? node 
            : {
                ...node,
                properties: {
                    ...node.properties,
                    control: {
                        ...node.properties.control,
                        owner: null,
                        expiration: 0,
                    }
                }
            };

        return updatedNode;
    }

    expireObjectOwners({ currentTime }: {currentTime: number}): TicTacToeModelState {
        return {
            ...this.state,
            board: this.expireControl(this.state.board, currentTime),
        };
    }

    // any periodic state
    tick() {
        const stateWithOwnershipExpired = this.expireObjectOwners({ currentTime: this.now() });
        this.updatePartialStateAndPublish(stateWithOwnershipExpired);
        this.future(gameTickRate).tick();
    }
}

class CroquetAdapterView extends Croquet.View {
    private m_Model: any;
    constructor(model: Croquet.Model) {
        super(model);
        this.m_Model = model;
        this.subscribe(this.viewId, "synced", this.handleSynced);
    }

    private messageReact(namespace: string, name: string, data: any) {
        const event = new CustomEvent(CROQUET_EVENTS.MESSAGE_TO_REACT_EVENT_NAME,
            {
                detail: {
                    namespace,
                    name,
                    data
                }   
            });
        
        window.dispatchEvent(event)
    }

    @bind handleSynced() {
        this.subscribe(gameNameSpace, {event: GameEvents.state_has_updated, handling: "oncePerFrame"}, this.handleUpdate);
        window.addEventListener(CROQUET_EVENTS.MESSAGE_TO_CROQUET_EVENT_NAME, (event: any) => {
            // add view id for ownership checks
            const dataInjectedWithViewId = {
                ...event.detail.data,
                data: {
                    ...event.detail.data.data,
                    fromView: this.viewId,
                },
            };
            // received event from react, forwarding to model
            this.publish(gameNameSpace, GameEvents.state_update, dataInjectedWithViewId)
        });

        this.handleUpdate(
            {
                ...this.m_Model.getState(),
                synced: true,
            });
    }

    @bind handleUpdate(state: any) {
        this.messageReact(gameNameSpace, GameEvents.state_has_updated, state);
    }
}

export default {
    init: ({ onCroquetUpdate, sessionId }: CroquetSessionSettings): Promise<any> => {
        CroquetAdapterModel.register();
        window.addEventListener(CROQUET_EVENTS.MESSAGE_TO_REACT_EVENT_NAME, (event: any) => {
            onCroquetUpdate(event.detail.namespace, event.detail.name, event.detail.data);
        });
        return Croquet.startSession(sessionId, CroquetAdapterModel, CroquetAdapterView);
    },
    emit: (namespace: string, name: string, data: any) => {
        const event = new CustomEvent(CROQUET_EVENTS.MESSAGE_TO_CROQUET_EVENT_NAME,
            {
                detail: {
                    namespace,
                    name,
                    data
                }
            });
		window.dispatchEvent(event);
    }
}
