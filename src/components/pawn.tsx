import * as React from 'react';

import { Pawn } from '../types';
import { modelSettings } from '../settings';
import { AvNodeTransform } from '@aardvarkxr/aardvark-shared';
import { ConditionalGrabbable } from './conditional_grabbable';
import { AvModel } from '@aardvarkxr/aardvark-react';

export const PawnPiece = ({ pawn, onTransformUpdated, localUser }: {
    pawn: Pawn,
    onTransformUpdated: (parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform, guild: string) => void,
    localUser: string | null,
}) => {
    const { type, guid, nodeState } = pawn;
    const modelPath = type == 'o'
        ? modelSettings.o.path
        : modelSettings.x.path;
    return (
        <ConditionalGrabbable
            pose={nodeState.pose}
            shouldDestroy={false}
            localUser={localUser}
            control={nodeState.properties.control}
            radius={0.2}
            onTransformUpdated={
                (parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform) => onTransformUpdated(
                    parentFromNode,
                    universeFromNode,
                    guid,
                )
            }
        >
            <AvModel uri={modelPath} />
        </ConditionalGrabbable>
    );
}
