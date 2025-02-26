import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.scss';
import 'react-md/dist/react-md.amber-blue.min.css';
import App from './App/App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
