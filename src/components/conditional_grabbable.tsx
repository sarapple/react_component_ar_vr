import * as React from 'react';

import { AvTransform, AvGrabbable, AvSphereHandle } from '@aardvarkxr/aardvark-react';
import { AvNodeTransform } from '@aardvarkxr/aardvark-shared';
import { NodePose, ExpiringControl } from '../types';
import bind from 'bind-decorator';

interface ConditionalGrabbableProps {
	children: React.ReactNode,
	pose: NodePose,
	modelUri: string,
	control: ExpiringControl
	localUser: string | null,
	onTransformUpdated: (parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform, shouldTransmitPose: boolean, shouldTransmitOwnership: boolean) => void
}

export class ConditionalGrabbable extends React.Component<ConditionalGrabbableProps, {}>
{
	private m_lastOwner: string | null = null;
	public render() {
		const shouldRenderBasicTransform =
			this.props.localUser != null
			&& this.props.control.owner != null 
			&& this.props.control.owner != this.props.localUser;

		if (shouldRenderBasicTransform) {
			const transformProps = {
				translateX: this.props.pose.position.x,
				translateY: this.props.pose.position.y,
				translateZ: this.props.pose.position.z,
				rotation: this.props.pose.rotation,
				scaleX: this.props.pose.scale.x,
				scaleY: this.props.pose.scale.y,
				scaleZ: this.props.pose.scale.z
			}

			return (
				<AvTransform {...transformProps}>
					{this.props.children}
				</AvTransform>
			)
		}

		const shouldTransmitPose = 
			this.props.localUser != null
			&& this.props.control.owner == this.props.localUser;
		
		/*
		protect against first render transmiting another transform updated event
		on first render of this AvGrabbable after ownership was released
		*/
		const shouldTransmitOwnership =
			this.props.control.owner == null
			&& this.props.localUser != null
			&& this.m_lastOwner == null

		this.m_lastOwner = this.props.control.owner;

		console.log(`[REACT] rendering a grabbable with owner that was set to ${this.props.control.owner} and had an owner of ${this.m_lastOwner}`);

		return (
			<AvGrabbable
				onTransformUpdated={(parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform) => this.props.onTransformUpdated(parentFromNode, universeFromNode, shouldTransmitPose, shouldTransmitOwnership)}
				preserveDropTransform={true}>
				{/*initialTransform={this.props.pose}>*/}
				<AvSphereHandle radius={ 0.3 } />
				{this.props.children}
			</AvGrabbable>
		);
	}
}
