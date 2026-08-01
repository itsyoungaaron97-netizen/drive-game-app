import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";

import { auth } from "../services/firebase";

import {
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  getFriends,
  acceptFriendRequest,
  declineFriendRequest,
} from "../services/friends";

import {
  Friend,
  FriendRequest,
  UserProfile,
} from "../types";



export default function FriendsScreen() {


  const [friends, setFriends] =
    useState<Friend[]>([]);


  const [requests, setRequests] =
    useState<FriendRequest[]>([]);


  const [results, setResults] =
    useState<UserProfile[]>([]);


  const [search, setSearch] =
    useState("");




  async function loadFriends() {


    const uid =
      auth.currentUser?.uid;


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







  async function searchUsersNow() {


    const users =
      await searchUsers(search);


    setResults(users);

  }






  async function addFriend(
    user: UserProfile
  ) {


    const current =
      auth.currentUser;


    if (!current) return;



    try {


      await sendFriendRequest(

        current.uid,

        user.uid,

        current.displayName || "Driver",

        user.displayName

      );


      Alert.alert(
        "Sent",
        "Friend request sent"
      );


    } catch(e:any) {


      Alert.alert(
        "Error",
        e.message
      );


    }

  }







  async function accept(
    request: FriendRequest
  ) {


    await acceptFriendRequest(
      request
    );


    loadFriends();

  }







  async function decline(
    id:string
  ) {


    await declineFriendRequest(
      id
    );


    loadFriends();

  }







  return (


    <View style={styles.container}>


      <Text style={styles.title}>
        Friends
      </Text>




      <TextInput

        style={styles.input}

        placeholder="Search name or email"

        value={search}

        onChangeText={setSearch}

      />



      <TouchableOpacity

        style={styles.searchButton}

        onPress={searchUsersNow}

      >

        <Text>
          Search
        </Text>

      </TouchableOpacity>





      <FlatList

        data={results}

        keyExtractor={
          item => item.uid
        }

        renderItem={({item}) => (


          <View style={styles.card}>


            <Text style={styles.name}>
              {item.displayName}
            </Text>


            <Text>
              {item.email}
            </Text>



            <TouchableOpacity

              style={styles.button}

              onPress={() =>
                addFriend(item)
              }

            >

              <Text>
                Send Friend Request
              </Text>

            </TouchableOpacity>



          </View>


        )}

      />






      <Text style={styles.section}>
        Requests
      </Text>




      <FlatList

        data={requests}

        keyExtractor={
          item => item.id
        }


        renderItem={({item}) => (


          <View style={styles.card}>


            <Text style={styles.name}>
              {item.fromDisplayName}
            </Text>



            <TouchableOpacity

              style={styles.button}

              onPress={() =>
                accept(item)
              }

            >

              <Text>
                Accept
              </Text>

            </TouchableOpacity>




            <TouchableOpacity

              style={styles.button}

              onPress={() =>
                decline(item.id)
              }

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

        keyExtractor={
          item => item.uid
        }


        renderItem={({item}) => (


          <View style={styles.card}>


            <Text style={styles.name}>
              {item.displayName}
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
    backgroundColor:"#111",
  },



  title:{
    fontSize:28,
    fontWeight:"bold",
    color:"white",
    marginBottom:15,
  },



  input:{
    backgroundColor:"white",
    padding:12,
    borderRadius:10,
  },



  searchButton:{
    backgroundColor:"#4caf50",
    padding:12,
    marginVertical:10,
    borderRadius:10,
    alignItems:"center",
  },



  section:{
    color:"white",
    fontSize:20,
    fontWeight:"bold",
    marginVertical:10,
  },



  card:{
    backgroundColor:"#eee",
    padding:15,
    borderRadius:10,
    marginVertical:5,
  },



  name:{
    fontSize:18,
    fontWeight:"bold",
  },



  button:{
    backgroundColor:"#ddd",
    padding:10,
    borderRadius:8,
    marginTop:8,
  },


});