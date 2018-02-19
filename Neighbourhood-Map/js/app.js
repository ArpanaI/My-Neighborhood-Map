//Location data for each place to be shown on the map within Karnataka, India
var placesModel = [{
        placeName: 'Bangalore',
        location: {
            lat: 12.9716,
            lng: 77.5946
        },
        display: true,
        selectLocation: false,
        placeId: '4f8684e6e4b062989927e28e'
    },
    {
        placeName: 'Mysore',
        location: {
            lat: 12.2958,
            lng: 76.6394
        },
        display: true,
        selectLocation: false,
        placeId: '5055bf28e4b0e59cc8995cbd'
    },
    {
        placeName: 'Belgaum',
        location: {
            lat: 15.8497,
            lng: 74.4977
        },
        display: true,
        selectLocation: false,
        placeId: '50f932bce4b02deb1840dbcc'
    },
    {
        placeName: 'Hampi',
        location: {
            lat: 15.3350,
            lng: 76.4600
        },
        display: true,
        selectLocation: false,
        placeId: '4e4b513f1838fe3c81868459'
    },
    {
        placeName: 'Coorg',
        location: {
            lat: 12.3375,
            lng: 75.8069
        },
        display: true,
        selectLocation: false,
        placeId: '51c18f74498e2febbf14ec46'
    },
    {
        placeName: 'Badami',
        location: {
            lat: 15.9186,
            lng: 75.6761
        },
        display: true,
        selectLocation: false,
        placeId: '4e4c805b62e1e5f46718ff47'
    },
    {
        placeName: 'Murdeshwar',
        location: {
            lat: 14.0940,
            lng: 74.4899
        },
        display: true,
        selectLocation: false,
        placeId: '59735800a92d9809bbd65924'
    },
    {
        placeName: 'Shivamogga',
        location: {
            lat: 13.9299,
            lng: 75.5681
        },
        display: true,
        selectLocation: false,
        placeId: '4d96a43fa2c6548180b0c553'
    },
];


var mapModel = function()

{

    var self = this;

    self.showError = ko.observable('');
    self.mapArray = [];

    for (var i = 0; i < placesModel.length; i++) {
        var placeLoc = new google.maps.Marker({
            position: {
                lat: placesModel[i].location.lat,
                lng: placesModel[i].location.lng
            },
            map: map,
            placeName: placesModel[i].placeName,
            display: ko.observable(placesModel[i].display),
            selectLocation: ko.observable(placesModel[i].selectLocation),
            placeid: placesModel[i].placeId, // venue id used for foursquare
            animation: google.maps.Animation.DROP
        });

        self.mapArray.push(placeLoc);
    }

    //This function will let markers on the locations bounce for 600 milliseconds
    self.bounceMarker = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 600);
    };

    //Foursquare API info is passed to the marker
    self.foursquareApiInfo = function(marker) {
        $.ajax({
            url: "https://api.foursquare.com/v2/venues/" + marker.placeid + '?client_id=4J1NRJ2V53MOG3A5TDTXW3LWBVD4F5XWE3L2Q1CE4E5TBJWS&client_secret=HT4REPOMFLQMNNILUAXZDV0BTVQFZ2JPCKIAENA04F4MB51F&v=20180217',
            dataType: "json",
            success: function(data) {
                // Data is stored in the report to show the likes and ratings on the markers
                var report = data.response.venue;

                marker.likes = report.hasOwnProperty('likes') ? report.likes.summary : '';
                marker.rating = report.hasOwnProperty('rating') ? report.rating : '';
            },

            //Display a message if Foursquare does not work for the user
            error: function(e) {
                self.showError("OOPS looks like Foursquare data is not available for now. Try again later.");
            }
        });
    };

    
    var addInfoToMarker = function(marker) {

        //Add foursquare API items to each of the location marker
        self.foursquareApiInfo(marker);

        //Add the event listener to the marker
        marker.addListener('click', function() {
            
        self.Selected(marker);
        });
    };

    //Iterate through mapArray and add the api information to each marker  
    for (var j = 0; j < self.mapArray.length; j++) {
        addInfoToMarker(self.mapArray[j]);
    }

    //Create a observable for the input search field
    self.searchText = ko.observable('');


    self.filterList = function() {
        var currentText = self.searchText();
        infowindow.close();

        //Iterate through the map array and check if the data is available
        if (currentText.length === 0) {
            self.setAllShow(true);
        } else {
            for (var k = 0; k < self.mapArray.length; k++) {
                
                if (self.mapArray[k].placeName.toLowerCase().indexOf(currentText.toLowerCase()) > -1) {
                    self.mapArray[k].display(true);
                    self.mapArray[k].setVisible(true);
                } else {
                    self.mapArray[k].display(false);
                    self.mapArray[k].setVisible(false);
                }
            }
        }
        infowindow.close();
    };

    // Function to display all the markers for the given locations
    self.setAllShow = function(marker) {
        for (var i = 0; i < self.mapArray.length; i++) {
            self.mapArray[i].display(marker);
            self.mapArray[i].setVisible(marker);
        }
    };
    // Unselect all the markers 
    self.setUnselected = function() {
        for (var i = 0; i < self.mapArray.length; i++) {
            self.mapArray[i].selectLocation(false);
        }
    };

    self.currentLoc = self.mapArray[0];

    // Set the markers to selected and display the likes and ratings for the places

    self.Selected = function(location) {
        self.setUnselected();
        location.selectLocation(true);

        self.currentLoc = location;

        NoOfLikes = function() {
            if (self.currentLoc.likes === '' || self.currentLoc.likes === undefined) {
                return "Likes not available for this location";
            } else {
                return "Location has " + self.currentLoc.likes;
            }
        };
        
        Ratings = function() {
            if (self.currentLoc.rating === '' || self.currentLoc.rating === undefined) {
                return "Ratings not  available for this location";
            } else {
                return "Location is rated " + self.currentLoc.rating;
            }
        };

        var InfoWindow = "<h5>" + self.currentLoc.placeName + "</h5>" + "<div>" + NoOfLikes() + "</div>" + "<div>" + Ratings() + "</div>";

        infowindow.setContent(InfoWindow);

        infowindow.open(map, location);
        self.bounceMarker(location);
    };
};