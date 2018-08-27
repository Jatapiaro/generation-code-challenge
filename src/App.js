import React, { Component } from 'react';
import './App.css';
import YourComponent from "./YourComponent";
import { Container, Row, Col } from 'reactstrap';

class App extends Component {
  render() {
    return (
      <div className="App">

        <YourComponent className="MyComponent" />

      </div>
    );
  }
}

export default App;
