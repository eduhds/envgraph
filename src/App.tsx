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
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['envs'],
    queryFn: () =>
      fetch(`${import.meta.env.DEV ? 'http://localhost:8090' : ''}/api/env`).then(res => res.json())
  });

  const { isLoading: isLoadingEnvContent, data: dataEnv } = useQuery({
    queryKey: ['env-content'],
    enabled: !!selectedNodeId,
    queryFn: () =>
      fetch(
        `${import.meta.env.DEV ? 'http://localhost:8090' : ''}/api/env?path=${selectedNodeId}`
      ).then(res => res.json())
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
              if (props.id.match(/\.(.{0,})env(.{0,})/g)) {
                setSelectedNodeId(props.id);
                // @ts-ignore
                document.getElementById('modal-env')?.showModal?.();
              }
            }}
          />
        )}
      />

      <div className='join absolute top-5 left-5'>
        <button
          className='btn join-item'
          onClick={() => canvasRef.current?.zoomOut?.()}
          disabled={isLoading}>
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
        <button
          className='btn join-item'
          onClick={() => canvasRef.current?.zoomIn?.()}
          disabled={isLoading}>
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
          <h3 className='font-bold text-lg'>{selectedNodeId.split('/').pop()}</h3>

          <div className='w-full flex justify-center overflow-x-auto mt-4'>
            {isLoadingEnvContent ? (
              <span className='loading loading-bars loading-md'></span>
            ) : (
              <pre className='w-full'>{dataEnv?.content || ''}</pre>
            )}
          </div>

          <div className='modal-action'>
            <button
              className='btn btn-square'
              disabled={!dataEnv?.content}
              onClick={() => {
                navigator.clipboard.writeText(dataEnv?.content).then(
                  () => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  },
                  err => console.log(err)
                );
              }}>
              {copied ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-6 h-6'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='m4.5 12.75 6 6 9-13.5' />
                </svg>
              ) : (
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
                    d='M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75'
                  />
                </svg>
              )}
            </button>

            <a
              download={selectedNodeId.split('/').join('_') + '.txt'}
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(dataEnv?.content)}`}
              className='btn btn-square'>
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
                  d='M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3'
                />
              </svg>
            </a>

            <form method='dialog'>
              <button className='btn' onClick={() => setSelectedNodeId('')}>
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>

      {isLoading && (
        <progress className='progress progress-primary w-full absolute top-0 rounded-none'></progress>
      )}

      {error && (
        <div className='toast toast-end'>
          <div className='alert alert-error'>
            <span>{error.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
