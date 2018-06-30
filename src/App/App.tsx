import * as React from 'react';
import './App.scss';
import KerasJS from 'keras-js';
import * as ndarray from 'ndarray'
import * as ops from 'ndarray-ops'
import Dropzone from 'react-dropzone';
import Card from 'react-md/lib/Cards/Card';
import CardTitle from 'react-md/lib/Cards/CardTitle';
import CardText from 'react-md/lib/Cards/CardText';
import Toolbar from 'react-md/lib/Toolbars/Toolbar';
import TextField from 'react-md/lib/TextFields/TextField';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';

interface AppState {
  loaded: boolean;
  result: '3D' | 'Not 3D' | 'Loading' | 'Waiting';
  percentage: string;
}

const dim = 128;

class App extends React.Component<{}, AppState> {
  model: any;
  img: HTMLImageElement;

  constructor(props: {}) {
    super(props);
    this.state = {loaded: false, result: 'Waiting', percentage: '0'};
  }

  componentDidMount() {
    this.model = new KerasJS.Model({
      filepath: 'model.bin'
    });

    this.model.ready().then(() => {
      this.setState((prevState: AppState) => { return {...prevState, loaded: true} }, () => {
        this.img = document.getElementById('img') as HTMLImageElement;
        this.img.crossOrigin = "Anonymous";
        this.img.onload = this.onImage.bind(this);
      });
    });
  }

  onURL(url: string) {
    this.img.src = url;
  }

  onDrop(files: FileList) {
    if (files.length > 0) {
      // This has to be here because of FileReader's synchronous nature (I guess).
      this.setState((prevState: AppState) => { return {...prevState, result: 'Loading'} });

      const reader = new FileReader();

      reader.onload = e => {
        this.img.src = e.target.result;
      };

      reader.readAsDataURL(files[0]);
    }
  }

  onImage() {
    this.setState((prevState: AppState) => { return {...prevState, result: 'Loading'} });

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(this.img,0,0, dim, dim);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dataTensor = ndarray(new Float32Array(imageData.data).map(val => val / 255.0), [imageData.width, imageData.height, 4]);
    const dataProcessedTensor = ndarray(new Float32Array(imageData.width * imageData.height * 3), [imageData.width, imageData.height, 3]);

    ops.assign(dataProcessedTensor.pick(null, null, 0), dataTensor.pick(null, null, 2));
    ops.assign(dataProcessedTensor.pick(null, null, 1), dataTensor.pick(null, null, 1));
    ops.assign(dataProcessedTensor.pick(null, null, 2), dataTensor.pick(null, null, 0));

    const inputData = {
      input: dataProcessedTensor.data
    };

    this.model.predict(inputData).then(output => {
      const outputData = output.output;

      if (outputData[0] > outputData[1]) {
        this.setState((prevState: AppState) => { return {...prevState, result: 'Not 3D', percentage: (outputData[0] * 100).toFixed(3)} });
      }

      else {
        this.setState((prevState: AppState) => { return {...prevState, result: '3D', percentage: (outputData[1] * 100).toFixed(3)} });
      }
    });
  }

  render() {
    const hidden = {display: 'none'};
    return (
      <div>
        <Toolbar colored title="3D or Not?" />
        {this.state.loaded && <div className="container">
          <Card>
            <CardTitle title="Input" />
            <CardText>
              <TextField id="url" label="URL" onChange={this.onURL.bind(this)} />
              <br />
              <Dropzone onDrop={this.onDrop.bind(this)}>
                <p>Drop an image here or click to select</p>
              </Dropzone>
            </CardText>
          </Card>
          <Card>
            <CardTitle title="Output" />
            <CardText>
              <canvas id="canvas" width={dim} height={dim} style={hidden}></canvas>
              <img id="img" width="200px" />
              {this.state.result === 'Waiting' && <p>Waiting for image.</p>}
              {this.state.result !== 'Waiting' && <div>
                {this.state.result === 'Loading' && <CircularProgress id="loading1"/>}
                {this.state.result !== 'Loading' && <div>
                  <p>{this.state.result}</p>
                  <p>{this.state.percentage}%</p>
                </div>}
              </div>}
            </CardText>
          </Card>
        </div>
        }
        {!this.state.loaded && <div className="container">
          <Card>
            <CardTitle title="Loading..." />
            <CardText>
              <CircularProgress id="loading"/>
            </CardText>
          </Card>
        </div>
        }
      </div>
    );
  }
}

export default App;
