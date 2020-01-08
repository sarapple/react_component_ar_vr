import * as React from 'react';

import { Pawn } from '../types';
import { modelSettings } from '../settings';
import { AvNodeTransform } from '@aardvarkxr/aardvark-shared';
import { ConditionalGrabbable } from './conditional_grabbable';
import { AvModel } from '@aardvarkxr/aardvark-react';

interface PawnProps {
    pawn: Pawn,
    modelUri: string,
    onTransformUpdated: (parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform, shouldTransmitPose: boolean, shouldTransmitOwnership: boolean, guild: string) => void,
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
                    (parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform, shouldTransmitPose: boolean, shouldTransmitOwnership: boolean) => this.props.onTransformUpdated(
                        parentFromNode,
                        universeFromNode,
                        shouldTransmitPose,
                        shouldTransmitOwnership,
                        guid,
                    )
                }
            >
                <AvModel uri={modelPath} />
            </ConditionalGrabbable>
        );
    }
}
