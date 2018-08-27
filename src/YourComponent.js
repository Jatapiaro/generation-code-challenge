import React, { Component } from 'react';
import axios from 'axios';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import Geocode from "react-geocode";
import { Button, ButtonGroup, Card, CardTitle, CardText } from 'reactstrap';

/*
* Use this component as a launching-pad to build your functionality.
*
*/
class YourComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      center: { lat: 19.432608, lng: -99.133290 },
      counter: 0,
      stores: [],
    }
  }

  componentWillMount() {
  
    if ( localStorage.getItem('stores') ) {



    } else {
      this.fetchStoresData();
    }

  }

  fetchStoresData() {

    axios.get('./store_directory.json')

      .then(response => {

        let stores = response.data;
        this.setState(() => {
          return {
            stores: stores
          }
        });
        let index = 0;
        this.fetchingFunction = setInterval(() => {

          if (index <= stores.length) {
            Geocode.fromAddress(stores[index].Address).then(
              response => {
                const { lat, lng } = response.results[0].geometry.location;
                this.setState((prevState) => {

                  let arr = (prevState.stores.length === 0)? stores : prevState.stores;
                  arr = stores;
                  let store = arr[index];
                  store['Position'] = { lat: lat, lng: lng };

                  return {
                    stores: arr
                  }

                })
                index++;
              },
              error => {
                console.error(error);
              }
            );
          }

          console.log(index);

        }, 10000);

      })
      .catch(function (error) {
        console.log(error);
      });    
  }
  
  render() {
    
    return (

      <div>

        <div style={{display: "flex", justifyContent: "space-around"}} className="row">

          <div className="col-sm-12 col-md-12 col-lg-3 col-xl-3">

            <div className="ButtonHeader">
              <Button className="FullButton" color="primary">Tiendas</Button>
              <Button className="FullButton" outline color="primary">Mis Favoritos</Button>
            </div>

            <div className="container" style={{overflow: "scroll", height: "650px"}}>
              {
                this.state.stores.map((store, index) => 
                  <Card key={index} body inverse color="info">
                    <CardTitle>{store.Name}</CardTitle>
                    <CardText>{store.Address}</CardText>
                    <Button color="secondary">Agregar a Favoritos</Button>
                  </Card>
                )
              }
            </div>
          </div>

          <div className="col-sm-12 col-md-12 col-lg-9 col-xl-9">

            <Map
              google={this.props.google}
              initialCenter={this.state.center}
              zoom={12}
              style={{width: "96%"}}
            >

              {
                this.state.stores.map((store, index) => {
                  return store.Position && (
                    <Marker key={index} onClick={this.onMarkerClick}
                      name={'Current location'}
                      position={store.Position}
                    />
                  )
                }
                )
              }

              <InfoWindow onClose={this.onInfoWindowClose}>
                <div>
                  <h1></h1>
                </div>
              </InfoWindow>

            </Map>

          </div>

        </div>

      </div>

    );
  }

  

}

export default GoogleApiWrapper({
  apiKey: ('AIzaSyCVH8e45o3d-5qmykzdhGKd1-3xYua5D2A')
})(YourComponent)
