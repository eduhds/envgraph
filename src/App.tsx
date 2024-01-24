import { useEffect, useState, useRef } from 'react';
import { Canvas, CanvasPosition, CanvasRef, EdgeData, Node, NodeData } from 'reaflow';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnvGraph />
    </QueryClientProvider>
  );
}

export default App;

function EnvGraph() {
  const canvasRef = useRef<CanvasRef>(null);

  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['envs'],
    queryFn: () =>
      fetch(`${import.meta.env.DEV ? 'http://localhost:8090' : ''}/api/env`).then(res => res.json())
  });

  useEffect(() => {
    if (data) {
      const envs: Array<string> = data.envs;

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
            _edges.push({ id: prev + '-' + id, from: prev, to: id });
          }

          key--;
        }
      }

      setNodes(_nodes);
      setEdges(_edges);
    }
  }, [data]);

  return (
    <div className='h-screen w-full'>
      <Canvas
        readonly
        ref={canvasRef}
        nodes={nodes}
        edges={edges}
        direction='RIGHT'
        defaultPosition={CanvasPosition.TOP}
        node={props => (
          <Node
            {...props}
            onClick={() => {
              if (props.id.includes('.env')) {
                setSelectedNodeId(props.id);
                // @ts-ignore
                document.getElementById('modal-env')?.showModal?.();
              }
            }}
          />
        )}
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

      <dialog id='modal-env' className='modal'>
        <div className='modal-box'>
          <h3 className='font-bold text-lg'>{selectedNodeId}</h3>
          <p className='py-4'>Press ESC key or click the button below to close</p>
          <div className='modal-action'>
            <form method='dialog'>
              <button className='btn'>Close</button>
            </form>
          </div>
        </div>
      </dialog>

      {isLoading && (
        <progress className='progress progress-primary w-full absolute top-0'></progress>
      )}
    </div>
  );
}
