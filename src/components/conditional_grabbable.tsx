import * as React from 'react';

import { AvTransform, AvGrabbable, AvSphereHandle } from '@aardvarkxr/aardvark-react';
import { AvNodeTransform } from '@aardvarkxr/aardvark-shared';
import { NodePose, ExpiringControl } from '../types';

export const ConditionalGrabbable = ({
	children,
	pose,
	shouldDestroy,
	radius,
	control,
	localUser,
	onTransformUpdated
}: {
	children: React.ReactNode,
	pose: NodePose,
	radius: number,
	control: ExpiringControl
	localUser: string | null,
	shouldDestroy: boolean,
	onTransformUpdated: (parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform) => void
}) => {
	//if (shouldDestroy) {
	//	return null
	//}

	const shouldRenderBasicTransform =
		localUser != null
		&& control.owner != null 
		&& control.owner != localUser;

	if (shouldRenderBasicTransform) {
		const transformProps = {
			translateX: pose.position.x,
			translateY: pose.position.y,
			translateZ: pose.position.z,
			rotation: pose.rotation,
			scaleX: pose.scale.x,
			scaleY: pose.scale.y,
			scaleZ: pose.scale.z
		}

		return (
			<AvTransform {...transformProps}>
				{children}
			</AvTransform>
		)
	}

	return (
		<AvGrabbable
			onTransformUpdated={onTransformUpdated}
			preserveDropTransform={!shouldDestroy}
			initialTransform={pose}>
			<AvSphereHandle radius={radius} />
			{children}
		</AvGrabbable>
	);
}
