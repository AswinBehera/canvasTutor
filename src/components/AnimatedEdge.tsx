
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

  const numDots = data?.traffic ? Math.min(20, Math.ceil(data.traffic / 50)) : 0;

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      {Array.from({ length: numDots }).map((_, i) => (
        <circle key={i} r="5" fill="red" className="nodrag nopan">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={edgePath}
            begin={`${i * (3 / numDots)}s`}
          />
        </circle>
      ))}
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
