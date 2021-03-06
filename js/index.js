const loggedInElements = document.querySelectorAll(".logged-in");
const loggedOutElements = document.querySelectorAll(".logged-out");
var map;
var markers = [];
var userMarker;
var userD;
var login = false;
var coordinates = {
  lat: 0,
  lng: 0,
};
var properties = {
  center: coordinates,
  zoom: 3,
  maxZoom: 9,
  minZoom: 3,
  styles: [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#242f3e"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#746855"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#242f3e"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#263c3f"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#6b9a76"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#38414e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#212a37"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9ca5b3"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#746855"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#1f2835"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#f3d19c"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#2f3948"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#17263c"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#515c6d"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#17263c"
        }
      ]
    }
  ]
};
$("#btnStart").click(function () {
  movePosition();
});
$("#btnStop").click(function () {
  stopPosition();
});

function mapStart() {
  map = new google.maps.Map(document.getElementById("map"), properties);
}

function movePosition() {
  if (navigator.geolocation) {
    var icon = {
      url: "./IMG/userMarker.png",
      scaledSize: new google.maps.Size(30, 30),
    };

    navigator.geolocation.getCurrentPosition((position) => {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      userMarker = new google.maps.Marker({
        position: { lat: pos.lat, lng: pos.lng },
        icon: icon,
        map: map,
        clickable: false,
      });

      db.collection("Users")
        .doc(userD.uid)
        .update({
          coordinates: { latitude: pos.lat, longitude: pos.lng },
          active: true
        });
    }, (error) => {
      Swal.fire("No location provided", error, "error");

    });
  } else {
    Swal.fire("No location provided", "", "info");
  }
}

function stopPosition(){
  db.collection("Users")
        .doc(userD.uid)
        .update({
          coordinates: { latitude: 0, longitude: 0 },
          active: false
        });
        if(userMarker)
        {
          userMarker.setMap(null);
        }
        

  clearOverlays();
}

function showElements(user) {
  if (user) {
    mapStart();
    loggedInElements.forEach((item) => {
      item.style.display = "block";
    });
    loggedOutElements.forEach((item) => {
      item.style.display = "none";
    });
  } else {
    loggedInElements.forEach((item) => {
      item.style.display = "none";
    });
    loggedOutElements.forEach((item) => {
      item.style.display = "block";
    });
  }
}

function loadPeople(data) {
  markers = [];
  let friends = [];

  db.collection("Users")
    .doc(userD.uid)
    .get()
    .then((doc) => {
        if (doc.data().friends === undefined) {
          db.collection("Users").doc(doc.id).update({
            friends: [],
          });
        } else {
          friends = doc.data().friends;
        }
        data.forEach((document) => {
          if (document.data().active) {
          if (document.id != userD.uid) {
            var icon = {
              url: "./IMG/noFriendMarker.png",
              scaledSize: new google.maps.Size(50, 50),
            };
            var contentString = `<h4>${document.data().name}</h4> 
          <button class="btn btn-outline-warning btn-block" onclick="addFriend('${
            document.id
          }')">Add friend</button>`;

            friends.forEach((friend) => {
              if (friend == document.id) {
                icon = {
                  url: "./IMG/friendMarker.png",
                  scaledSize: new google.maps.Size(50, 50),
                };
                contentString = `<h4>${document.data().name}</h4> 
                      <button class="btn btn-outline-danger btn-block" onclick="removeFriend('${
                        document.id
                      }')">Remove friend</button>`;
              }
            });

            var infowindow = new google.maps.InfoWindow({
              content: contentString,
            });

            var marker = new google.maps.Marker({
              position: {
                lat: document.data().coordinates.latitude,
                lng: document.data().coordinates.longitude,
              },
              icon: icon,
              map: map,
            });

            markers.push(marker);
            marker.addListener("click", function () {
              infowindow.open(map, marker);
            });
          }
        }
        });
      
    });
}

function addFriend(uid) {
  db.collection("Users")
    .doc(userD.uid)
    .update({
      friends: firebase.firestore.FieldValue.arrayUnion(uid),
    });
  clearOverlays();
}

function removeFriend(uid) {

  Swal.fire({
    title: 'Remove Friend?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.value) {
      db.collection("Users")
      .doc(userD.uid)
      .update({
        friends: firebase.firestore.FieldValue.arrayRemove(uid),
      });
    clearOverlays();
    }
  }) 
}

function reportUser(uid)
{
  Swal.fire({
    title: 'Report User?',
    html: "<input type+'text' placeholder='Reason' id='txtReasonReport'>",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.value) {

      db.collection("Reports")
      .doc()
      .set({
        userUID: uid,
        reason: document.getElementById("txtReasonReport").value
      });
      Swal.fire('User reported','','success');
    }

  }) 
}

function clearOverlays() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers.length = 0;
}

function loadFriends(snapshot) {
  let friends = [];
  if (snapshot.data().friends === undefined) {
    db.collection("Users").doc(userD.uid).update({
      friends: [],
    });
  } else {
    friends = snapshot.data().friends;
  }
  let friendsHtml = document.getElementById("friendsList");
  let tabsHtml = document.getElementById("friendsTabs");

  let html = "";
  let htmlTabs = "";
  if (friends.length == 0) {
    html = `<h2 class="col-12 text-light">No friends added :(</h2>`;
  } else {
    friends.forEach((friendUID) => {
      db.collection("Users")
        .doc(friendUID)
        .get()
        .then((doc) => {
          html += `<div class="col-12 col-md-4" id="divChat${friendUID}" style="display: block;">
            <div class="jumbotron p-0">
              <div class="dropdown d-flex justify-content-end pr-1">
                <a href="#" data-toggle="dropdown" class="mr-1" ><i class="fa fa-cog"></i></a>
                <a href="#" onclick="closeChat('${friendUID}'); return false;"><i class="fa fa-times"></i></a>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <a class="dropdown-item" onclick="removeFriend('${friendUID}')">Remove friend <i class="fa fa-trash"></i></a>
                  <a class="dropdown-item" onclick="reportUser('${friendUID}')" >Report user  <i class="fa fa-exclamation-triangle"></i></a>
                </div>
              </div>
              <h4 class="text-dark">${doc.data().name}</h4>
              <div class="jumbotron m-0 pt-0 pb-2 scrollable">
                <div class="row" id="chat${friendUID}">

                </div>
              </div>
              <div class="input-group mb-3">
                <textarea class="form-control" id="txtMessage${friendUID}" rows="2" required></textarea>
                <div class="input-group-append">
                  <button class="btn btn-outline-primary" type="button" onclick="sendMessage('${friendUID}')">Send</button>
                </div>
              </div>
            </div>
          </div>`;
          friendsHtml.innerHTML = html;

          htmlTabs += `<div class="col-6 col-md-4 col-lg-3 m-0 p-1" id="tab${friendUID}" style="display: none;">
          <div class="jumbotron p-2 text-center m-0">
            <p><i class="fa fa-user"></i> ${doc.data().name}</p>
            <button type="button" class="btn btn-secondary btn-sm btn-block" onclick="openChatFromTab('${friendUID}')">Chat <i class="fa fa-commenting"></i></button>
          </div>
        </div>`;
        tabsHtml.innerHTML = htmlTabs;

        });
    });
  }
  friendsHtml.innerHTML = html;
  tabsHtml.innerHTML = htmlTabs;
  setTimeout(function(){
    loadMessages();
  },1000)
}

async function loadMessages()
{
  if (login){
    var notification = new Notification('Nuevo mensaje');
  } else {
    login = true;
  }
  
  let friends = [];

  await db.collection("Users")
  .doc(userD.uid)
  .get().then((doc) => {

    if(doc.data().friends === undefined)
    {
      db.collection("Users").doc(userD.uid).update({
        friends: [],
      });
    }
    else{
      friends = doc.data().friends;
    }
  })

  await db.collection("Messages").orderBy("time", "asc").get().then((messages) => {

    friends.forEach(friend => {
      let chat = messages.docs.filter(function (el) {

        return (el.data().from == friend || el.data().from  == userD.uid) && (el.data().to == friend || el.data().to == userD.uid)
      });


      let chatHtml = document.getElementById(`chat${friend}`);
      let html = "";

      chat.forEach(message => {
        if(message.data().from == friend)
        {
            html += `<div class="col-12 text-left">
            <p class="mb-0"><span  class="messageFriend pl-2 pr-2">${message.data().message}</span></p>
            <small>${(message.data().time.toDate()).toLocaleString()}</small>
         </div>`
        }
        else if(message.data().from == userD.uid){
          html += `<div class="col-12 text-right">
          <p style="margin-bottom: 0"><span class="messageUser pl-2 pr-2">${message.data().message}</span></p>
          <small>${(message.data().time.toDate()).toLocaleString()}</small>
      </div>`
        }     
      });

      chatHtml.innerHTML = html;
	  $(".scrollable").scrollTop($(".scrollable")[0].scrollHeight);

    });
  });
}

function showFindButton(status)
{
  if(status)
  {
    $("#btnStart").css('display', 'none');
    $("#btnStop").css('display', 'block');
  }
  else{
    $("#btnStart").css('display', 'block');
    $("#btnStop").css('display', 'none');
  }

}

function showAccountModal()
{
  db.collection("Users")
  .doc(userD.uid)
  .get()
  .then((doc) => {

    let modalBody = document.getElementById('modalBodyAcoount');
    let html = `<div><h4>${doc.data().name}</h4>
    <p><b>Status: </b> ${(doc.data().active) ? 'Visible' : 'Not Visible'}</p></div>`;

    modalBody.innerHTML = html;
  
    $('#modalAccount').modal('show')
  });
}

function sendMessage(friendUID)
{
  let text = document.getElementById(`txtMessage${friendUID}`).value;

  db.collection("Messages")
  .doc()
  .set({
    to: friendUID,
    from: userD.uid,
    message: text,
    time: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById(`txtMessage${friendUID}`).value = "";

}

function activateNotifications() {
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(function(result) {
      if (result === 'granted') {
        alert('Notificaciones activadas');
      }
    });
  }
};
activateNotifications();

function openChatFromTab(friendUid)
{
  $(`#divChat${friendUid}`).show();
  $(`#tab${friendUid}`).hide();
  window.scrollTo(0,document.body.scrollHeight);

}

function closeChat(friendUid)
{
  $(`#divChat${friendUid}`).hide();
  $(`#tab${friendUid}`).show();
}