const fs = require('fs');
const path = require('path');

// actionConfig.jsonを読み込み
const actionConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src/domain/config/actionConfig.json'), 'utf8')
);

/**
 * 計算グラフ生成器（JavaScript版）
 */
class ComputationGraphGenerator {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.buildComputationGraph();
  }

  buildComputationGraph() {
    // 入力ノード（内部状態）を追加
    this.addNode({
      id: 'bonding',
      label: 'bonding\\n(bonding level)',
      type: 'input'
    });

    this.addNode({
      id: 'playfulness', 
      label: 'playfulness\\n(play desire)',
      type: 'input'
    });

    this.addNode({
      id: 'fear',
      label: 'fear\\n(fear level)',
      type: 'input'
    });

    // 外部状態ノードを追加
    this.addNode({
      id: 'userPresence',
      label: 'userPresence\\n(user is present)',
      type: 'external'
    });

    this.addNode({
      id: 'toyPresence',
      label: 'toyPresence\\n(toy exists)',
      type: 'external'
    });

    this.addNode({
      id: 'isPlaying',
      label: 'isPlaying\\n(playing state)',
      type: 'external'
    });

    this.addNode({
      id: 'toyNear',
      label: 'toyNear\\n(toy < 100px)',
      type: 'external'
    });

    // 共通バイアスノードを追加
    this.addNode({
      id: 'bias',
      label: 'bias',
      type: 'input'
    });

    // 外部状態→内部状態の影響を追加
    this.buildExternalInfluenceNodes();

    // 感情計算ノードを追加
    this.buildEmotionNodes();

    // アクション確率ノードを追加
    this.buildActionNodes();
  }

  buildExternalInfluenceNodes() {
    const externalInfluenceConfigs = actionConfig.externalStateInfluence;

    // 外部状態から内部状態への影響エッジを追加
    for (const [internalStateName, config] of Object.entries(externalInfluenceConfigs)) {
      if (config.inputs && config.weights) {
        for (let i = 0; i < config.inputs.length; i++) {
          const input = config.inputs[i];
          const weight = config.weights[i] || 0;
          if (weight !== 0) {
            const weightLabel = weight.toString();
            this.addEdge(input, internalStateName, weightLabel);
          }
        }
      }
    }
  }

  buildEmotionNodes() {
    const emotionConfigs = actionConfig.emotionCalculation;

    for (const [emotionName, config] of Object.entries(emotionConfigs)) {
      this.addNode({
        id: emotionName,
        label: emotionName,
        type: 'emotion',
        inputs: config.inputs,
        weights: config.weights
      });

      // 入力からのエッジを追加（重み付き）
      if (config.inputs && config.weights) {
        for (let i = 0; i < config.inputs.length; i++) {
          const input = config.inputs[i];
          const weight = config.weights[i] || 0;
          const weightLabel = weight === 1 ? '' : weight.toString();
          this.addEdge(input, emotionName, weightLabel);
        }
      }
      
      // バイアス項がある場合は共通バイアスノードからエッジを追加
      const biasIndex = config.inputs ? config.inputs.length : 0;
      if (config.weights && biasIndex < config.weights.length) {
        const bias = config.weights[biasIndex] || 0;
        // 入力なし（biasのみ）の場合は0でも表示、通常のbiasは0で非表示
        const isInputOnlyBias = !config.inputs || config.inputs.length === 0;
        if (isInputOnlyBias || bias !== 0) {
          this.addEdge('bias', emotionName, bias.toString());
        }
      }
    }
  }

  buildActionNodes() {
    const actionConfigs = actionConfig.stepOneActions;

    for (const [actionName, config] of Object.entries(actionConfigs)) {
      this.addNode({
        id: actionName,
        label: `${actionName}\\n${config.name}`,
        type: 'action',
        inputs: config.inputs
      });

      // 感情からのエッジを追加（重み付き）
      if (config.inputs && config.weights) {
        for (let i = 0; i < config.inputs.length; i++) {
          const input = config.inputs[i];
          const weight = config.weights[i] || 0;
          const weightLabel = weight === 1 ? '' : weight.toString();
          this.addEdge(input, actionName, weightLabel);
        }
      }
      
      // バイアス項がある場合は共通バイアスノードからエッジを追加
      const biasIndex = config.inputs ? config.inputs.length : 0;
      if (config.weights && biasIndex < config.weights.length) {
        const bias = config.weights[biasIndex] || 0;
        // 入力なし（biasのみ）の場合は0でも表示、通常のbiasは0で非表示
        const isInputOnlyBias = !config.inputs || config.inputs.length === 0;
        if (isInputOnlyBias || bias !== 0) {
          this.addEdge('bias', actionName, bias.toString());
        }
      }
    }

    // 最終的な確率計算ノードを追加
    this.addNode({
      id: 'actionSelection',
      label: `Action Selection\\nsoftmax(temp=${actionConfig.probabilityCalculation.temperature})`,
      type: 'output'
    });

    // 全アクションから最終選択へのエッジ
    for (const actionName of Object.keys(actionConfigs)) {
      this.addEdge(actionName, 'actionSelection');
    }
  }

  formatCalculationLabel(inputs, weights) {
    if (!weights || weights.length === 0) {
      return '= 0';
    }

    if (!inputs || inputs.length === 0) {
      // バイアスのみの場合
      const bias = weights[0] || 0;
      return `= ${bias}`;
    }

    const terms = [];
    
    // 各入力項を追加
    for (let i = 0; i < inputs.length; i++) {
      const weight = weights[i] || 0;
      if (weight !== 0) {
        const term = weight === 1 ? inputs[i] : `${weight}×${inputs[i]}`;
        terms.push(term);
      }
    }
    
    // バイアス項を追加
    const biasIndex = inputs.length;
    if (biasIndex < weights.length) {
      const bias = weights[biasIndex] || 0;
      if (bias !== 0) {
        terms.push(bias > 0 ? `+${bias}` : bias.toString());
      }
    }
    
    return terms.length > 0 ? `= ${terms.join(' ')}` : '= 0';
  }

  addNode(node) {
    this.nodes.set(node.id, node);
  }

  addEdge(from, to, label) {
    this.edges.push({ from, to, label });
  }

  generateMermaidDiagram() {
    let mermaid = 'graph TD\n';

    // ノード定義
    for (const [id, node] of this.nodes) {
      const shape = this.getNodeShape(node.type);
      mermaid += `  ${id}${shape.open}"${node.label}"${shape.close}\n`;
    }

    mermaid += '\n';

    // エッジ定義
    for (const edge of this.edges) {
      const label = edge.label ? `|"${edge.label}"| ` : '';
      mermaid += `  ${edge.from} --> ${label}${edge.to}\n`;
    }

    mermaid += '\n';

    // スタイル定義
    mermaid += this.generateStyles();

    return mermaid;
  }

  getNodeShape(type) {
    switch (type) {
      case 'input':
        return { open: '[', close: ']' };
      case 'external':
        return { open: '>', close: ']' };
      case 'emotion':
        return { open: '(', close: ')' };
      case 'action':
        return { open: '{', close: '}' };
      case 'output':
        return { open: '[[', close: ']]' };
      default:
        return { open: '[', close: ']' };
    }
  }

  generateStyles() {
    return `  classDef inputStyle fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
  classDef externalStyle fill:#fff8e1,stroke:#ff8f00,stroke-width:2px
  classDef emotionStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
  classDef actionStyle fill:#fff3e0,stroke:#f57c00,stroke-width:2px
  classDef outputStyle fill:#e8f5e8,stroke:#388e3c,stroke-width:2px

  class bonding,playfulness,fear,bias inputStyle
  class userPresence,toyPresence,isPlaying,toyNear externalStyle
  class valence,arousal,safety,social,discomfort emotionStyle
  class showBelly,playWithToy,sit,runAway actionStyle
  class actionSelection outputStyle`;
  }

  getGraphStats() {
    const layerCounts = {};
    
    for (const node of this.nodes.values()) {
      layerCounts[node.type] = (layerCounts[node.type] || 0) + 1;
    }

    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.length,
      layerCounts
    };
  }
}

// メイン実行
function main() {
  const generator = new ComputationGraphGenerator();
  
  // 統計情報を準備
  const stats = generator.getGraphStats();
  
  // Markdown形式で出力内容を準備
  let output = '# Cat Game Computation Graph\n\n';
  
  output += '## Graph Statistics\n\n';
  output += `- Total nodes: ${stats.nodeCount}\n`;
  output += `- Total edges: ${stats.edgeCount}\n`;
  output += '- Layer breakdown:\n';
  
  for (const [layer, count] of Object.entries(stats.layerCounts)) {
    output += `  - ${layer}: ${count} nodes\n`;
  }
  output += '\n';

  // Mermaid図を追加
  output += '## Computation Flow Diagram\n\n';
  output += '```mermaid\n';
  output += generator.generateMermaidDiagram();
  output += '\n```\n\n';

  // 使用方法を追加
  output += '## Usage\n\n';
  output += '1. Copy the Mermaid code above\n';
  output += '2. Paste it into:\n';
  output += '   - GitHub README.md\n';
  output += '   - https://mermaid.live/\n';
  output += '   - VS Code with Mermaid extension\n\n';

  output += '## Development\n\n';
  output += '- Modify actionConfig.json to update the graph\n';
  output += '- Run `node generate-graph.js` to regenerate\n';

  // ファイルに出力
  const fs = require('fs');
  fs.writeFileSync('calucurate-graph.md', output, 'utf8');
  
  console.log('Computation graph generated successfully -> calucurate-graph.md');
}

main();