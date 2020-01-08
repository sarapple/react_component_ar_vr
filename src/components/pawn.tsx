import * as React from 'react';

import { Pawn } from '../types';
import { modelSettings } from '../settings';
import { AvNodeTransform, AvGrabEvent } from '@aardvarkxr/aardvark-shared';
import { ConditionalGrabbable } from './conditional_grabbable';
import { AvModel, GrabResponse } from '@aardvarkxr/aardvark-react';

interface PawnProps {
    pawn: Pawn,
    modelUri: string,
    onTransformUpdated: (parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform, guild: string) => void,
    onGrabRequest: (event: AvGrabEvent, guid: string) => Promise<GrabResponse>,
    localUser: string | null,
}

export class PawnPiece extends React.Component<PawnProps, {}> {
    public render() {
        const { type, guid, nodeState } = this.props.pawn;
        const modelPath = type == 'o'
            ? modelSettings.o.path
            : modelSettings.x.path;
        return (
            <ConditionalGrabbable
                pose={nodeState.pose}
                localUser={this.props.localUser}
                control={nodeState.properties.control}
                modelUri={this.props.modelUri}
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
                <AvModel uri={modelPath} />
            </ConditionalGrabbable>
        );
    }
}
