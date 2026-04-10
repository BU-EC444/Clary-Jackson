const tf = require('@tensorflow/tfjs');

async function main() {
  await tf.setBackend('cpu');
  await tf.ready();
  console.log('TensorFlow.js version:', tf.version.tfjs);
  console.log('Current backend:', tf.getBackend());

  // Tiny synthetic dataset: y = 2x + 1
  const xs = tf.tensor2d([[0], [1], [2], [3], [4], [5]], [6, 1]);
  const ys = tf.tensor2d([[1], [3], [5], [7], [9], [11]], [6, 1]);

  const model = tf.sequential();
  model.add(tf.layers.dense({units: 8, activation: 'relu', inputShape: [1]}));
  model.add(tf.layers.dense({units: 1}));

  model.compile({
    optimizer: tf.train.adam(0.05),
    loss: 'meanSquaredError'
  });

  console.log('Starting training...');
  await model.fit(xs, ys, {
    epochs: 40,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}/40 - loss: ${logs.loss.toFixed(6)}`);
      }
    }
  });

  console.log('Training complete.');
  const testInput = tf.tensor2d([[6], [7], [10]], [3, 1]);
  const prediction = model.predict(testInput);
  const values = await prediction.data();
  console.log('Predictions for x=[6,7,10]:', Array.from(values).map(v => v.toFixed(3)));

  tf.dispose([xs, ys, testInput, prediction]);
}

main().catch((err) => {
  console.error('Run failed:', err);
  process.exit(1);
});
