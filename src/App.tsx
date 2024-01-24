import { useEffect, useState } from 'react';
import { Canvas } from 'reaflow';

type Nodes = { id: string; text: string }[];
type Edges = { id: string; from: string; to: string }[];

function App() {
  const [nodes, setNodes] = useState<Nodes>([]);
  const [edges, setEdges] = useState<Edges>([]);

  useEffect(() => {
    fetch('http://localhost:8090/api/env')
      .then(res => res.json())
      .then(res => {
        const envs: Array<string> = res.envs;

        let _nodes: Nodes = [];
        let _edges: Edges = [];

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
    <div>
      <Canvas
        //maxWidth={800}
        //maxHeight={600}
        direction='RIGHT'
        disabled
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
}

export default App;
