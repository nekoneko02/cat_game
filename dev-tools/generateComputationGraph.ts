#!/usr/bin/env node
import { ComputationGraphGenerator } from './ComputationGraphGenerator';

/**
 * 計算グラフ生成のCLIツール
 */
function main() {
  console.log('🐱 Cat Game Computation Graph Generator\n');
  
  const generator = new ComputationGraphGenerator();
  
  // 統計情報を表示
  const stats = generator.getGraphStats();
  console.log('📊 Graph Statistics:');
  console.log(`  - Total nodes: ${stats.nodeCount}`);
  console.log(`  - Total edges: ${stats.edgeCount}`);
  console.log('  - Layer breakdown:');
  
  for (const [layer, count] of Object.entries(stats.layerCounts)) {
    console.log(`    • ${layer}: ${count} nodes`);
  }
  console.log('');

  // Mermaid図を生成
  console.log('🎯 Generated Mermaid Diagram:');
  console.log('```mermaid');
  console.log(generator.generateMermaidDiagram());
  console.log('```');
  console.log('');

  // 使用方法を表示
  console.log('💡 Usage:');
  console.log('  1. Copy the Mermaid code above');
  console.log('  2. Paste it into:');
  console.log('     • GitHub README.md');
  console.log('     • https://mermaid.live/');
  console.log('     • VS Code with Mermaid extension');
  console.log('');

  console.log('🔧 Development:');
  console.log('  • Modify actionConfig.json to update the graph');
  console.log('  • Run this script again to regenerate');
}

if (require.main === module) {
  main();
}

export { main as generateComputationGraph };