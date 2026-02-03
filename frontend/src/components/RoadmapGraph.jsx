import React, { useCallback, useEffect, useState } from 'react';
import { handleDownloadImage } from '../utils/downloadImage'; // Ensure this path is correct
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  applyNodeChanges, 
  applyEdgeChanges,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css'; 
import dagre from 'dagre';
import Modal from './Modal';
import '../Modal.css';
import CustomNode from './CustomNode';

const nodeWidth = 172;
const nodeHeight = 90;

const nodeTypes = {
  custom: CustomNode,
};

const getLayoutedElements = (nodes, edges) => {

  const expansionFactor = Math.floor(nodes.length / 5)
  const baseRankSep = 150;
  const baseNodeSep = 100;

  const dagreGraph = new dagre.graphlib.Graph({ multigraph: true });
  dagreGraph.setGraph({ 
      rankdir: 'LR', 
      ranksep: baseRankSep + (expansionFactor * 30),
      nodesep: baseNodeSep + (expansionFactor * 10)
    });

  nodes.forEach((node) => {
    dagreGraph.setNode(String(node.id), { width: nodeWidth, height: nodeHeight });
  });

  const validNodeIds = new Set(nodes.map((n) => String(n.id)));
  const validEdges = [];

  edges.forEach((edge) => {
    const source = String(edge.source);
    const target = String(edge.target);

    if (validNodeIds.has(source) && validNodeIds.has(target)) {
      dagreGraph.setEdge(source, target, {}); 
      validEdges.push({
        ...edge,
        source: source,
        target: target
      });
    } else {
      console.warn(`👻 Ghost Edge removed: ${source} -> ${target}`);
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeId = String(node.id);
    const nodeWithPosition = dagreGraph.node(nodeId);

    if (!nodeWithPosition) {
      return { ...node, position: { x: 0, y: 0 } };
    }

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    node.targetPosition = 'left';
    node.sourcePosition = 'right';

    return node;
  });

  return { nodes: layoutedNodes, edges: validEdges };
};


const RoadmapGraph = ({ data, concept }) => {

  const [ nodes, setNodes ] = useState([])
  const [ edges, setEdges ] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [edgeTooltip, setEdgeTooltip] = useState(null); 

  const handleExpandNode = useCallback(async (nodeId, nodeLabel, nodeType) => {
    console.log(`Expanding ${nodeLabel} (${nodeType})...`);

    try {
      const response = await fetch('http://localhost:8000/expand', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          concept: concept || data?.nodes[0]?.label,
          parent_node: nodeLabel,
          parent_id: nodeId,
          context_type: nodeType
        })
      })

      const newSubgraph = await response.json();

      if (!newSubgraph.nodes || newSubgraph.nodes.length === 0) return;

      const newFlowNodes = newSubgraph.nodes.map(n => ({
        id: String(n.id),
        type: 'custom',
        data: { 
          label: n.label, 
          type: n.type, 
          tag: n.tag,
          details: n.details,
          onExpand: handleExpandNode
        },
        position: { x: 0, y: 0 }
      }));

      const newFlowEdges = newSubgraph.edges.map(e => ({
        id: `${e.source}-${e.target}`,
        source: String(e.source),
        target: String(e.target),
        data: { label: e.label },
        animated: true,
        style: { stroke: '#555' },
        interactionWidth: 20,
      }))

      setNodes((nds) => {
        const allNodes = [...nds, ...newFlowNodes];
        return allNodes; 
      });

      setEdges((eds) => {
        const allEdges = [...eds, ...newFlowEdges];
        
        setNodes(prevNodes => {
           const { nodes: reLayoutedNodes } = getLayoutedElements([...prevNodes], allEdges);
           return reLayoutedNodes;
        });
        
        return allEdges; 
      });

    } catch (error) {
      console.error("Expansion failed:", error);
    }
  }, [concept, data, edges, nodes, setNodes, setEdges]);


  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode({
        label: node.data.label,
        details: node.data.details,
        type: node.data.type,
        tag: node.data.tag
    });
  }, [data])

  const handleCloseModal = () => {
    setSelectedNode(null)
  }

  const onEdgeMouseEnter = (event, edge) => {
    if (edge.data && edge.data.label) {
      setEdgeTooltip({
        x: event.clientX,
        y: event.clientY,
        label: edge.data.label
      })
    }
  }
  
  const onEdgeMouseLeave = () => {
    setEdgeTooltip(null);
  }

  useEffect(() => {
    if(!data) {
      setNodes([])
      setEdges([])
      return;
    }

    const initialNodes = data.nodes.map((n) => ({
          id: String(n.id),
          type: 'custom',
          data: { 
            label: n.label,
            type: n.type,
            tag: n.tag,
            details: n.details,
            onExpand: handleExpandNode,
            isMain: true
          },
          position: { x: 0, y: 0 },
    }));

    const initialEdges = data.edges.map((e) => ({
      id: `${e.source}-${e.target}`,
      source: String(e.source),
      target: String(e.target),
      data: {
        label: e.label
      },
      animated: true,
      style: { stroke: '#555'}, 
      interactionWidth: 20,
      labelStyle: { fill: '#555555', fontWeight: 700, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
    }));

    const layout = getLayoutedElements(initialNodes, initialEdges)

    setNodes(layout.nodes);
    setEdges(layout.edges);

  }, [data])

  return (
    <>
    <div style={{ width: '100%', height: '100%', border: '1px solid #e0e0e0', borderRadius: '8px', position: 'relative' }}>
      {selectedNode && (
          <Modal handleCloseModal={handleCloseModal}>
              <div className="modal-header">
                  <h3 className="modal-title">{selectedNode.label}</h3>
                  <button onClick={handleCloseModal} className="modal-close-btn">&times;</button>
              </div>
              <div style={{ lineHeight: '1.6', color: '#555' }}>
                  {selectedNode.details}
              </div>
          </Modal>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}

        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        nodeTypes={nodeTypes}
        fitView
        
        panOnScroll={true}
        selectionOnDrag={true}
        panOnDrag={true}
        zoomOnScroll={true}
        minZoom={0.1}

        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#aaa" gap={20} size={1} />
        <Controls />
        <MiniMap nodeColor="#e2e2e2" maskColor="rgba(240, 240, 240, 0.6)" />

        {/* 👇 Button inside Panel for perfect positioning */}
        <Panel position="bottom-right">
          <button 
            onClick={() => handleDownloadImage(nodes)} // 👈 PASSING NODES HERE
            style={{
              padding: '8px 16px',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            📷 Export PNG
          </button>
        </Panel>

      </ReactFlow>

      {edgeTooltip && (
        <div style={{
          position: 'fixed',
          top: edgeTooltip.y - 45,
          left: edgeTooltip.x,
          transform: 'translateX(-50%)',
          zIndex: 100,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
           <div style={{
             backgroundColor: 'white',
             color: '#333',
             padding: '6px 12px',
             borderRadius: '6px',
             fontSize: '12px',
             fontWeight: '500',
             boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
             whiteSpace: 'nowrap'
           }}>
             {edgeTooltip.label}
           </div>
           <div style={{
              width: 0, 
              height: 0, 
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white',
              marginTop: '-1px'
           }}></div>
        </div>
      )}
    </div>

    </>
  );
};

export default RoadmapGraph;