Generation Take-Home Coding Challenge
=================================
In the following lines I explain some changes that had to be done in order to complete the challenge.
This is related about how the user stories were slightly changed.


### As a student, I want to see a map that has all the stores represented as markers/pins on the map.

Although you can see all the stores in a list, some of them does not have a corresponding marker.
First, in order to avoid the QUERY_LIMIT exception, each 500 ms, we tried to fetch the position using the address of the store.
But in some cases and for an unknown reason the geocode is unable to look for them. Although I test it on the google maps website, on the geocode documentation to find the address, and there was not any mistake, In the project sometimes finds it and sometimes not. Anyway, the stores appear with all the necessary data on the stores list.


### As a student, I want to be able to click on a store marker and add it to a list of 'My Favorite Stores'

I think that clicking on a store marker, and automatically add it on the favourite list is not intuitive.
Anyways, is done like that. But what I tried to do is that, when you click on a marker, the info window is show, 
then I put a button that says "Add to favourites", but for some reason the library I used, on the InfoWindow was not able to
handle click on buttons that you put inside of the InfoBox.

### As a student, I want to be able to click on a store in the 'My Favorite Stores and remove if from the list

The same problem with the button as above. In this case if you are watching only your favourites and click on a maker, the InfoWindow will appear,
but th marker is going to dissapear. So in order to avoid that, when you are watching your favourites when you click on a marker this will not be set as no favourite.


### My Idea

My idea with all the problems, is that, you check an store on the list, then, click on center of the map. And if that is the store you want, simply click on "Add to favourites"