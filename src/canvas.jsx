import React, { useEffect, useMemo, useCallback } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import DirectedGraph from './DirectedGraph';
import UndirectedGraph from './UndirectedGraph';

const useStyles = makeStyles((theme) => ({
  graph: {
    width: '100%',
  },
}));

const getSize = (node) => {
  switch (node.type) {
    case 'organization':
      return 60;
    case 'department':
      return 50;
    default:
      return null;
  }
};

const buildData = (data) => {
  let { nodes, edges } = data;
  nodes = nodes.map((n) => ({
    id: n.id,
    label: n.label || n.id,
    shape: 'circularImage',
    size: getSize(n),
    group: n.type || 'employee',
    image: '', // const image = "data:image/svg+xml;charset=utf-8,"+ encodeURIComponent(svg);
  }));
  return { nodes, edges };
};

const independence = (data) => {
  let { nodesOG, edgesOG } = data;
  let { nodes, edges } = data;
  let nodes2 = [];
  let edges2 = [];
  let nodes3 = [];
  let edges3 = [];
  for (let i = 0; i < nodes.length; i++) {
    nodes2.push({ id: nodes[i].id, label: nodes[i].label });
    nodes3.push({ id: nodes[i].id, label: nodes[i].label });
  }
  for (let i = 0; i < edges.length; i++) {
    edges2.push({ from: edges[i].from, to: edges[i].to });
    edges3.push({ from: edges[i].from, to: edges[i].to });
  }

  const deleteNode = (arr, id) => {
    let res = [];
    for (let i = 0; i < arr.length; i++)
      if (arr[i].id != id) res.push({ id: arr[i].id, label: arr[i].label });
    return res;
  };

  const deleteEdge = (arr, id1, id2) => {
    let res = [];
    for (let i = 0; i < arr.length; i++)
      if (arr[i].from != id1 || arr[i].to != id2)
        res.push({ from: arr[i].from, to: arr[i].to });
    return res;
  };
  let passed = false;
  let k = 0;
  do {
    let CI = [];
    do {
      let degree = {};
      for (let i = 0; i < nodes3.length; i++) degree[nodes3[i].id] = 0;
      for (let i = 0; i < edges3.length; i++) {
        if (degree[edges3[i].from]) degree[edges3[i].from]++;
        else degree[edges3[i].from] = 1;
        if (degree[edges3[i].to]) degree[edges3[i].to]++;
        else degree[edges3[i].to] = 1;
      }
      let min = { node: -1, val: Infinity };
      for (const [key, value] of Object.entries(degree)) {
        if (min.val > value) {
          min.node = key;
          min.val = value;
        }
      }
      CI.push(min.node);

      nodes3 = deleteNode(nodes3, min.node);

      for (let i = 0; i < edges3.length; i++) {
        //console.log(i, edges3[i].from, min.node, edges3[i].from == min.node);
        if (edges3[i].from == min.node) {
          //nodes = deleteNode(nodes, edges[i].to);
          edges3 = deleteEdge(edges3, edges3[i].from, edges3[i].to);
          i--;
        } else if (edges3[i].to == min.node) {
          //nodes = deleteNode(nodes, edges[i].from);
          edges3 = deleteEdge(edges3, edges3[i].from, edges3[i].to);
          i--;
        }
      }
      /*
      if (k < 5) {
        passed = true;
      } else break;
      k++;
      console.log(min.node, nodes3);*/
    } while (nodes3.length > 0);
    for (let i = 0; i < CI.length; i++) nodes2 = deleteNode(nodes2, CI[i]);
    break;
  } while (nodes2.length > 0);
};

let clustered = false;
// let data = { nodes: [], edges: [] };
export default function SimpleMenu() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [strength, setStrength] = React.useState(() => Math.random() * 60 - 30);

  const graphData = {
    nodes: [
      { id: 1, label: '1' },
      { id: 2, label: '2' },
      { id: 3, label: '3' },
      { id: 4, label: '4' },
      { id: 5, label: '5' },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 1, to: 5 },
      { from: 2, to: 3 },
      { from: 2, to: 5 },
      { from: 3, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
    ],
  };
  let data = useMemo(() => buildData(graphData));
  console.log('ASSSSDFASDFASDF');
  let res = independence(graphData);
  // useEffect(() => {
  //   data = buildData(graphData);
  // }, []);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        Open Menu
      </Button>
      <Button
        className="showcase-button"
        onClick={() => setStrength(Math.random() * 60 - 30)}
      >
        {' '}
        REWEIGHT{' '}
      </Button>

      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>

      <UndirectedGraph
        className={classes.graph}
        data={data}
        animation
        height={500}
        getNetwork={(network) => {
          // animation
          // network.once("beforeDrawing", function() {
          //   console.log("before drawing");
          //   network.focus(2, {
          //     scale: 12
          //   });
          // });
          // network.once("afterDrawing", function() {
          //   console.log("after drawing");
          //   network.fit({
          //     animation: {
          //       duration: 2000,
          //       easingFunction: "easeOutQuint"
          //     }
          //   });
          // });

          if (!clustered) {
            const clusterOptions = {
              // processProperties: (clusterOptions, childNodes) => {
              //   clusterOptions.label = "[" + childNodes.length + "]";
              //   return clusterOptions;
              // },
              clusterNodeProperties: {
                // borderWidth: 3,
                color: 'orange',
                shape: 'box',
                // font: { size: 30 }
              },
            };
            clustered = true;

            network.clusterOutliers(clusterOptions);
            network.on('selectNode', function (params) {
              if (params.nodes.length == 1) {
                if (network.isCluster(params.nodes[0]) === true) {
                  network.openCluster(params.nodes[0]);
                }
              }
            });
          }
          //  if you want access to vis.js network api you can set the state in a parent component using this property
        }}
      />
    </div>
  );
}

/*

Patrick Brockmann @PBrockmann Jul 09 09:26
For the record, I did it with this:
var allParentsNode = [];
function findAllParents(nodesArray) {
         if (nodesArray.length == 0) {
                                    return 1;
         }
         var parentsArray = network.getConnectedNodes(nodesArray[0], 'from');
         //console.log('node ', nodesArray[0], 'has ', parentsArray);
          nodesArray = nodesArray.concat(parentsArray).unique();
         //console.log('---> ', nodesArray);
         allParentsNode = allParentsNode.concat(nodesArray[0]).unique();
         nodesArray.splice(0, 1);
         return findAllParents(nodesArray);
}
var parentsArray = network.getConnectedNodes(node, 'from');
findAllParents(parentsArray);
*/
