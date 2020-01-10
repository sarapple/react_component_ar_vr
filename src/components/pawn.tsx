import * as React from 'react';

import { Pawn, ModelInfo } from '../types';
import { modelSettings } from '../settings';
import { AvNodeTransform, AvGrabEvent } from '@aardvarkxr/aardvark-shared';
import { ConditionalGrabbable } from './conditional_grabbable';
import { AvModel, GrabResponse } from '@aardvarkxr/aardvark-react';

interface PawnProps {
    pawn: Pawn,
    model: ModelInfo,
    onTransformUpdated: (parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform, guild: string) => void,
    onGrabRequest: (event: AvGrabEvent, guid: string) => Promise<GrabResponse>,
    localUser: string | null,
}

export class PawnPiece extends React.Component<PawnProps, {}> {
    public render() {
        const { type, guid, nodeState } = this.props.pawn;
        return (
            <ConditionalGrabbable
                pose={nodeState.pose}
                localUser={this.props.localUser}
                control={nodeState.properties.control}
                model={this.props.model}
                onTransformUpdated={
                    (parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform) => this.props.onTransformUpdated(
                        parentFromNode,
                        universeFromNode,
                        guid,
                    )
                }

                onGrabRequest={
                    (event: AvGrabEvent) => this.props.onGrabRequest(
                        event,
                        guid
                    )
                }
            >
                <AvModel uri={this.props.model.path} />
            </ConditionalGrabbable>
        );
    }
}
