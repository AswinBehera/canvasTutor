
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <circle r="5" fill="red" className="nodrag nopan">
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path={edgePath}
        />
      </circle>
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${((sourceX + targetX) / 2)}px, ${((sourceY + targetY) / 2)}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {data.label as React.ReactNode}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
