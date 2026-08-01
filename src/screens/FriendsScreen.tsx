import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

import { auth } from "../services/firebase";

import {
  getFriendRequests,
  getFriends,
  acceptFriendRequest,
  declineFriendRequest,
} from "../services/friends";

import {
  Friend,
  FriendRequest,
} from "../types";


export default function FriendsScreen() {

  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);


  async function loadFriends() {

    const uid = auth.currentUser?.uid;

    if (!uid) return;


    const friendList =
      await getFriends(uid);


    const requestList =
      await getFriendRequests(uid);


    setFriends(friendList);
    setRequests(requestList);
  }



  useEffect(() => {

    loadFriends();

  }, []);




  async function accept(
    request: FriendRequest
  ) {

    await acceptFriendRequest(request);

    loadFriends();

  }



  async function decline(
    id: string
  ) {

    await declineFriendRequest(id);

    loadFriends();

  }



  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        Friends
      </Text>


      <Text style={styles.section}>
        Requests
      </Text>


      <FlatList

        data={requests}

        keyExtractor={(item) => item.id}

        renderItem={({item}) => (

          <View style={styles.card}>

            <Text style={styles.name}>
              {item.fromDisplayName}
            </Text>


            <TouchableOpacity
              style={styles.button}
              onPress={() => accept(item)}
            >
              <Text>
                Accept
              </Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={styles.button}
              onPress={() => decline(item.id)}
            >
              <Text>
                Decline
              </Text>
            </TouchableOpacity>


          </View>

        )}

      />



      <Text style={styles.section}>
        My Friends
      </Text>



      <FlatList

        data={friends}

        keyExtractor={(item) => item.uid}

        renderItem={({item}) => (

          <View style={styles.card}>

            <Text style={styles.name}>
              {item.displayName}
            </Text>


            <Text>
              Level {item.level || 1}
            </Text>

          </View>

        )}

      />


    </View>

  );

}



const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:20,
  },


  title:{
    fontSize:28,
    fontWeight:"bold",
    marginBottom:20,
  },


  section:{
    fontSize:20,
    fontWeight:"bold",
    marginVertical:10,
  },


  card:{
    padding:15,
    marginVertical:5,
    borderRadius:10,
    backgroundColor:"#eee",
  },


  name:{
    fontSize:18,
    fontWeight:"bold",
  },


  button:{
    marginTop:8,
    padding:8,
    backgroundColor:"#ddd",
    borderRadius:8,
  },

});