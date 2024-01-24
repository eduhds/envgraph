import { useEffect, useState, useRef } from 'react';
import { Canvas, CanvasPosition, CanvasRef, EdgeData, NodeData } from 'reaflow';

function App() {
  const canvasRef = useRef<CanvasRef>(null);

  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);

  useEffect(() => {
    fetch('http://localhost:8090/api/env')
      .then(res => res.json())
      .then(res => {
        const envs: Array<string> = res.envs;

        let _nodes: NodeData[] = [];
        let _edges: EdgeData[] = [];

        for (const env of envs) {
          const segments = env
            .trim()
            .split('/')
            .filter(s => !!s);

          let key = segments.length;

          for (const seg of [...segments].reverse()) {
            const id = segments.slice(0, key).join('/');

            if (_nodes.find(n => n.id === id)) {
              break;
            }

            _nodes.push({ id, text: seg });

            if (key > 1) {
              const prev = segments.slice(0, key - 1).join('/');

              _edges.push({
                id: prev + '-' + id,
                from: prev,
                to: id
              });
            }

            key--;
          }
        }

        setNodes(_nodes);
        setEdges(_edges);
      });
  }, []);

  return (
    <div className='h-screen w-full'>
      <Canvas
        readonly
        ref={canvasRef}
        nodes={nodes}
        edges={edges}
        direction='RIGHT'
        defaultPosition={CanvasPosition.TOP}
      />

      <div className='join absolute top-5 left-5'>
        <button className='btn join-item' onClick={() => canvasRef.current?.zoomOut?.()}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-6 h-6'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6'
            />
          </svg>
        </button>
        <button className='btn join-item' onClick={() => canvasRef.current?.zoomIn?.()}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-6 h-6'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6'
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default App;
