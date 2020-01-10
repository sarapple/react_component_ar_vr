import * as React from 'react';

import bind from 'bind-decorator';
import { AvTransform, AvModel, AvGrabButton, GrabResponse, AvOrigin, AvGrabbable, AvSphereHandle } from '@aardvarkxr/aardvark-react';
import { AvNodeTransform, Av, AvGrabEvent } from '@aardvarkxr/aardvark-shared';

import CroquetAdapter from "../scripts/croquet_adapter";
import { ConditionalGrabbable } from './conditional_grabbable';
import { TicTacToeViewState } from '../types';
import { modelSettings, gameSessionId, gameNameSpace, GameEvents, sceneScale, TicTacToeEvents } from '../settings';
import { pawnGenerator } from '../scripts/tic_tac_toe_utils';
import { PawnPiece } from './pawn';
import { INITIAL_VIEW_STATE } from '../constants';

export class TicTacToe extends React.Component<{}, TicTacToeViewState>
{
	constructor( props: any )
	{
		super( props );
		this.state = INITIAL_VIEW_STATE;
	}

	componentDidMount() {
		const croquetSetupCallback = CroquetAdapter.init({
			onCroquetUpdate: (_namespace: string, _name: string, data: any) => {
				console.log("[REACT] got new state of", data);
				const updatedState = {
					...this.state,
					...data,
				};
				this.setState(updatedState);
			},
			sessionId: gameSessionId,
		});

		croquetSetupCallback.then((value: { view: { viewId: string }}) => {
			this.setState({
				...this.state,
				localUser: value.view.viewId,
			});
		});
	}

	@bind public onDestroy() {
		Av().closeBrowser();
	}

	@bind public onReset() {
		CroquetAdapter.emit(gameNameSpace, GameEvents.state_update, { type: TicTacToeEvents.reset, data: {} });
		const updatedState: TicTacToeViewState = {
			...this.state,
			board: {
				...this.state.board,
				properties: {
					...this.state.board.properties,
				}
			}
		};
		this.setState(updatedState);
	}

	@bind public onSpawnPawn(type: 'x' | 'o') {
		const pawn = pawnGenerator({
			type,
			nodeState: {
				pose: {
					position: {x: 0, y: 5, z: 0},
					rotation: {x: 0, y: 0, z:0, w:1},
					scale: {x: 1, y: 1, z: 1}
				},
				properties: {
					control: {
						owner: null,
						expiration: 0,
					}
				},
			},
		});
		CroquetAdapter.emit(gameNameSpace, GameEvents.state_update, { type: TicTacToeEvents.spawn_pawn, data: pawn });
	}

	// example of a world relative transform
	@bind public onAardvarkTranformUpdated(_parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform) {
		CroquetAdapter.emit(gameNameSpace, GameEvents.state_update, {
			type: TicTacToeEvents.board_moved,
			data: { newPose: universeFromNode},
		});
	}

	@bind public onGrabRequest(event: AvGrabEvent): Promise<GrabResponse> {
		CroquetAdapter.emit(gameNameSpace, GameEvents.state_update, {
			type: TicTacToeEvents.board_ownership_request,
			data: {}
		})

		var grabPromise = new Promise<GrabResponse>((resolve,_reject) => {
			let response: GrabResponse = {allowed: true};
			resolve(response);
		});
			
		return grabPromise; 
	}

	@bind public onGrabRequestPawn(_event: AvGrabEvent, guid: string): Promise<GrabResponse> {
		CroquetAdapter.emit(gameNameSpace, GameEvents.state_update, {
			type: TicTacToeEvents.pawn_ownership_request,
			data: {guid}
		})

		var grabPromise = new Promise<GrabResponse>((resolve,_reject) => {
			let response: GrabResponse = {allowed: true};
			resolve(response);
		});
			
		return grabPromise; 
	}

	@bind public onGrabREquestLoading(_event: AvGrabEvent): Promise<GrabResponse> {
		return new Promise<GrabResponse>((resolve, _reject) => {
			resolve({allowed: false});
		});
	}

	// example of a parent relative transform
	@bind public onTranformUpdatedPawn(parentFromNode: AvNodeTransform, _universeFromNode: AvNodeTransform, guid: string) {
		CroquetAdapter.emit(gameNameSpace, GameEvents.state_update, {
			type: TicTacToeEvents.pawn_moved,
			data: { guid, newPose: parentFromNode },
		});
	}

	public render()
	{
		const { board, pawns, localUser } = this.state;
		const padding = 1.25;
		const boardColor = {r: .9, g: .6, b: .3}

		if(!this.state.synced) {
			return (
				<AvGrabbable preserveDropTransform={true} onGrabRequest={this.onGrabREquestLoading}>
					<AvTransform uniformScale={ sceneScale }>
						<AvModel uri={modelSettings.resetButton.path} />
						<AvSphereHandle radius={ modelSettings.resetButton.dimensions.x} />
						<AvTransform translateX={ modelSettings.resetButton.dimensions.x * padding}>
							<AvGrabButton 
								modelUri={ modelSettings.destroyButton.path } 
								onTrigger={ this.onDestroy } 
								radius={ modelSettings.resetButton.dimensions.x }/>
						</AvTransform>
					</AvTransform>
				</AvGrabbable>
			)
		}

		return (
			<ConditionalGrabbable
				pose={board.pose}
				control={board.properties.control}
				localUser={localUser}
				model={modelSettings.board}
				onTransformUpdated={ this.onAardvarkTranformUpdated }
				onGrabRequest={this.onGrabRequest}
			>
				<AvTransform uniformScale={ sceneScale }>
					{/* Game board itself */}
					<AvModel uri={ modelSettings.board.path } color={ boardColor } />
					{/*Player 1 controls*/}
					<AvTransform translateZ={ (modelSettings.board.dimensions.z / 2.0) * padding }>
						<AvTransform translateX={ -modelSettings.board.dimensions.x / 2.0 }>
							<AvGrabButton modelUri={modelSettings.destroyButton.path} onTrigger={ this.onDestroy } radius={ modelSettings.resetButton.dimensions.x }/>
							<AvTransform 
								translateX={ -modelSettings.destroyButton.dimensions.x * padding }>
								<AvGrabButton modelUri={modelSettings.resetButton.path} onTrigger={ this.onReset } radius={  modelSettings.resetButton.dimensions.x }/>
							</AvTransform>
						</AvTransform>
						<AvTransform translateX={ modelSettings.board.dimensions.x / 2.0 }>
							<AvGrabButton modelUri={modelSettings.x.path} onTrigger={ () => this.onSpawnPawn('x') } radius={ modelSettings.x.dimensions.x }/>
						</AvTransform>
					</AvTransform>
					{/*Player 2 controls*/}
					<AvTransform translateZ={ -((modelSettings.board.dimensions.z / 2.0) + 0.5) * padding } rotateY={180}>
						<AvTransform translateX={ -modelSettings.board.dimensions.x / 2.0 }>
							<AvGrabButton modelUri={modelSettings.destroyButton.path} onTrigger={ this.onDestroy } radius={ modelSettings.resetButton.dimensions.x }/>
							<AvTransform 
								translateX={ -modelSettings.destroyButton.dimensions.x * padding }>
								<AvGrabButton modelUri={modelSettings.resetButton.path} onTrigger={ this.onReset } radius={  modelSettings.resetButton.dimensions.x }/>
							</AvTransform>
						</AvTransform>
						<AvTransform translateX={ modelSettings.board.dimensions.x / 2.0 }>
							<AvGrabButton modelUri={modelSettings.o.path} onTrigger={ () => this.onSpawnPawn('o') } radius={ modelSettings.x.dimensions.x }/>
						</AvTransform>
					</AvTransform>
					{/* Spawned pawns */}
					{pawns.map((pawn) => {
						const model = pawn.type == 'o'
							? modelSettings.o
							: modelSettings.x

						return (
							<PawnPiece 
								key={ pawn.guid } 
								pawn={ pawn } 
								model={model} 
								onTransformUpdated={ this.onTranformUpdatedPawn } 
								onGrabRequest={this.onGrabRequestPawn}
								localUser={ this.state.localUser } />
						);
					})}
				</AvTransform>
			</ConditionalGrabbable>
		)
	}
}
