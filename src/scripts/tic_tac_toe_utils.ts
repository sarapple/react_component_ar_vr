import uuid from 'uuid';

import { MovableNodeState, Pawn } from '../types';

export function pawnGenerator({ type, nodeState }: { type: 'x' | 'o', nodeState: MovableNodeState }): Pawn {
	const guid = uuid.v4();

	return {
		type,
		guid,
		nodeState,
	};
}
