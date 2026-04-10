## Machine Learning with TensorFlow.js 

<p align="center">
<img src="/docs/images/nn_vis.png" width="40%" />
</p>
<p align="center">
<i>A simple neural net comprising of two hidden layers.</i>
</p>

In this skill you will set up TensorFlow.js and run a complete machine learning example. The goal is to understand the basic workflow of training and using a neural network before applying it to IMU data in the quest.

You will use the Iris dataset, a standard classification problem where a model predicts the species of a flower from simple measurements. While the dataset is unrelated to motion, the learning pipeline is identical to what you will use later for activity classification.


  <p align="center">
data → training → model → prediction
</p>
</p>


## Description


Modern systems often learn patterns from data. In this skill you will:>

1. Install TensorFlow.js for Node.js</li>
2. Run an existing training example</li>
3. Observe the training process</li>
4. Generate predictions from a trained model</li>

<h2>Setup</h2>

<p>
Create a new working directory and install TensorFlow.js:
</p>

<pre>
mkdir tfjs-test
cd tfjs-test
npm init -y
npm install @tensorflow/tfjs-node
</pre>

<h2>Assignment</h2>

<p>
Clone and run the TensorFlow.js Iris example. A simple training example can be found here: https://github.com/tensorflow/tfjs-examples/tree/master/iris (Note: Use Python2.7 when setting up TensorFlow.js). You will also need to instal yarn. 
</p>

<!-- <pre>
git clone https://github.com/tensorflow/tfjs-examples.git
cd tfjs-examples/iris
npm install
node main.js
</pre>
!--> 


This example will: (1) Train a neural network, (2) Print training progress (loss), (3) Evaluate the model, (4) Output predictions. 
The loss should be observed to decrease over training epochs, and then be used for predictions. 

There is a related example that also loads a dataset from a CSV file, which may be relevant to your quest: https://github.com/tensorflow/tfjs-examples/tree/master/abalone-node


## Demonstration

<p>
Demonstrate the following:
</p>

1. TensorFlow.js runs correctly in Node.js
2. Training logs are visible in the console
3. The model produces predictions
   

<p>
 Note how data is loaded and converted to tensors. Also follow the model definition and training loop - you can also adjust settings in the model and see the impact on the resulting predictions. In the quest, you will replace the iris dataset with your own IMU-based activity dataset. The model can be deployed on rPi or ESP32. 
</p>


## Reference Material
- [Yarn version/syntax bugs - may be useful](https://github.com/yarnpkg/yarn/issues/8763)
- [TensorFlow.js Installation](https://www.tensorflow.org/js/tutorials/setup)
- [More TensorFlow.js Examples](https://github.com/tensorflow/tfjs-examples)
- [TensorFlow Lite for Microcontrollers](https://www.tensorflow.org/lite/microcontrollers)
- [TensorFlow Lite for esp-idf](https://github.com/espressif/tflite-micro-esp-examples)
- [Additional AI resources for ESP](https://github.com/espressif/esp-nn)
- [EloquentTinyML](https://github.com/eloquentarduino/EloquentTinyML)
