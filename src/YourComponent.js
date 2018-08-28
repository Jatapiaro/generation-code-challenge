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
      activeMarker: {},
      center: { lat: 19.432608, lng: -99.133290 },
      defaultIcon: {
        url: 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|0091ff|40|_|%E2%80%A2', // url
        scaledSize: new this.props.google.maps.Size(20, 30), // scaled size
      },
      highlightedIcon: {
        url: 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|FFFF24|40|_|%E2%80%A2', // url
        scaledSize: new this.props.google.maps.Size(20, 30), // scaled size
      },
      selectedPlace: {},
      showFavourites: false,
      showingInfoWindow: false,
      stores: [],
    }
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.toggleShowFavourites = this.toggleShowFavourites.bind(this);
  }

  componentWillMount() {
  
    if ( localStorage.getItem('stores') ) {

      let stores = JSON.parse(localStorage.getItem('stores'));

      this.setState(() => {
        return {
          stores: stores
        }
      });

      //If we have some stores withouth a fetched position
      for( let i = 0; i < stores.length; i++ ) {
        let store = stores[i];
        if ( !store.Position ) {
          //We try to fetch the coordinates from the addres
          this.fillMissingPositions();
          break;
        } 
      }

    } else {
      //Load data from JSON
      this.fetchStoresData();
    }

  }

  /** 
   * @param index in the array of the store
  */
  centerOnMap(index) {
    this.setState((prevState) => {

      let arr = prevState.stores;
      let store = arr[index];

      return {
        center: store.Position,
      }

    });
  }

  fetchStoresData() {

    axios.get('./store_directory.json')

      .then(response => {

        let stores = response.data;
        for( let i = 0; i < stores.length; i++ ) {
          let store = stores[i];
          store['Position'] = undefined;
          store['Favourite'] = false;
        }
        this.setState((prevState) => {
          return {
            stores: stores
          }
        });
        localStorage.setItem('stores', JSON.stringify(stores));
        this.fillMissingPositions();

      })
      .catch(function (error) {
        console.log(error);
      });    
  }

  /**
   * In order to avoid QUERY_LIMITS
   * we set a timeout to look for coordinates
   * of a store with an undefined Position
   */
  fillMissingPositions() {

    if ( this.state.stores.length > 0 ) {

      for ( let i = 0; i < this.state.stores.length; i++ ) {
        let store = this.state.stores[i];
        if ( !store.Position ) {
          Geocode.fromAddress(store.Address).then(
            response => {
              const { lat, lng } = response.results[0].geometry.location;

              this.setState((prevState) => {

                let arr = prevState.stores;
                let store = arr[i];
                store.Position = { lat: lat, lng: lng };
                localStorage.setItem('stores', JSON.stringify(arr));
                return {
                  stores: arr
                }

              })
            },
            error => {
              console.error(error);
            }
          );
          break;

        }
      }

    }
    setTimeout(this.fillMissingPositions.bind(this), 500);
  }

  /**
   * 
   * @param {*} props The props of the marker 
   * @param {*} marker The marker that was clicked
   * @param {*} e 
   */
  onMarkerClick(props, marker, e) {
    this.setState((prevState) => {
      let arr = prevState.stores;
      let store = arr[props.index];
      if ( !prevState.showFavourites ) {
        store.Favourite = !store.Favourite;
      }
      localStorage.setItem('stores', JSON.stringify(arr));
      return {
        activeMarker: marker,
        showingInfoWindow: true,
        selectedPlace: props,
        stores: arr
      }
    });
  };

  /**
   * 
   * @param {*} index of the store to changed his favourite attribute
   */
  toggleFavouriteElement(index) {
    this.setState((prevState) => {
      
      let arr = prevState.stores;
      let store = arr[index];
      store.Favourite = !store.Favourite;
      localStorage.setItem('stores', JSON.stringify(arr));

      return {
        stores: arr,
      }

    });
  }

  /**
   * We toggle if the user want to see their favourites or all the stores
   */
  toggleShowFavourites() {
    this.setState((prevState) => {
      return {
        showFavourites: !prevState.showFavourites,
        showingInfoWindow: false
      }
    })
  }
  
  render() {
    
    return (

      <div>

        <div style={{display: "flex", justifyContent: "space-around"}} className="row">

          <div className="col-sm-12 col-md-12 col-lg-3 col-xl-3">

              {
                this.state.showFavourites &&
                <div className="ButtonHeader">
                  <Button onClick={this.toggleShowFavourites} className="FullButton" outline color="info">Stores</Button>
                  <Button className="FullButton" color="success">My Favourites</Button>
                </div>
              }
              {
                !this.state.showFavourites &&
                <div className="ButtonHeader">
                  <Button className="FullButton" color="info">Stores</Button>
                  <Button onClick={this.toggleShowFavourites} className="FullButton" outline color="success">My Favourites</Button>
                </div>
              }
            

            <div className="container" style={{overflow: "scroll", height: "870px", marginBottom: "10px" }}>
              {
                this.state.showFavourites &&
                this.state.stores.map((store, index) => 
                  {
                    if ( store.Favourite ) {
                      return (
                        <Card key={index} body inverse color="success">
                          <CardTitle>{store.Name}</CardTitle>
                          <CardText>{store.Address}</CardText>
                          <Button onClick={() => { this.toggleFavouriteElement(index) }} className="ActionButton" size="sm" color={(!store.Favourite) ? 'warning' : 'secondary'}>
                            {
                              (!store.Favourite) ? `Add To Favourites` : `Remove From Favourites`
                            }
                          </Button>
                          {
                            store.Position &&
                            <Button onClick={() => { this.centerOnMap(index) }} size="sm" color="danger">Center on Map</Button>
                          }
                        </Card>
                      );
                    }
                  }
                )
              }
              {
                !this.state.showFavourites && 
                this.state.stores.map((store, index) => 
                  <Card key={index} body inverse color={(!store.Favourite) ? 'info' : 'success'}>
                    <CardTitle>{store.Name}</CardTitle>
                    <CardText>{store.Address}</CardText>
                    <Button onClick={() => { this.toggleFavouriteElement(index) }} className="ActionButton" size="sm" color={(!store.Favourite) ? 'warning' : 'secondary'}>
                      {
                        (!store.Favourite) ? `Add To Favourites` : `Remove From Favourites`
                      }
                    </Button>
                    {
                      store.Position &&
                      <Button onClick={() => { this.centerOnMap(index) }} size="sm" color="danger">Center on Map</Button>
                    }
                  </Card>
                )
              }
            </div>
          </div>

          <div className="col-sm-12 col-md-12 col-lg-9 col-xl-9">

            <Map
              google={this.props.google}
              map={this.props.map}
              initialCenter={this.state.center}
              center={this.state.center}
              zoom={12}
              style={{ width: "96%", overflow: "hidden", marginTop: "35px" }}
            >

              {
                !this.state.showFavourites &&
                this.state.stores.map((store, index) => {
                  return store.Position && (
                    <Marker key={index} onClick={this.onMarkerClick}
                      name={store.Name}
                      favourite={store.Favourite}
                      position={store.Position}
                      address={store.Address}
                      index={index}
                      icon={(store.Position.lng == this.state.center.lng && store.Position.lat == this.state.center.lat) ? this.state.defaultIcon : this.state.highlightedIcon}
                    />
                  );
                })
              }

              {
                this.state.showFavourites &&
                this.state.stores.map((store, index) => {
                  if ( store.Favourite ) {
                    return (
                      <Marker key={index} onClick={this.onMarkerClick}
                        name={store.Name}
                        favourite={store.Favourite}
                        position={store.Position}
                        address={store.Address}
                        index={index}
                        icon={(store.Position.lng == this.state.center.lng && store.Position.lat == this.state.center.lat) ? this.state.defaultIcon : this.state.highlightedIcon}
                      />
                    );
                  }
                })
              }

              <InfoWindow
                marker={this.state.activeMarker}
                visible={this.state.showingInfoWindow}>
                <div>
                  <h4>{this.state.selectedPlace.name}</h4>
                  <p>{this.state.selectedPlace.address}</p>
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
