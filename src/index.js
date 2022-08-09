import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css'
import 'antd/dist/antd.min.css';
import store from './Components/Redux/store';
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

store.subscribe(() => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )
})