import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";

import {
  colors,
  spacing,
} from "../constants/theme";



interface Post {

  id:string;

  username:string;

  text:string;

}



export default function CommunityScreen() {


  const [text,setText] =
    useState("");



  const [posts,setPosts] =
    useState<Post[]>([]);





  const createPost = () => {


    if(!text.trim()){

      return;

    }



    const newPost:Post = {

      id:
        Date.now().toString(),

      username:
        "You",

      text:
        text.trim(),

    };



    setPosts(

      [
        newPost,

        ...posts,

      ]

    );


    setText("");

  };







  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        Community
      </Text>



      <View style={styles.box}>


        <TextInput

          value={text}

          onChangeText={setText}

          placeholder="Share something..."

          placeholderTextColor={colors.textSecondary}

          style={styles.input}

          multiline

        />



        <TouchableOpacity

          style={styles.button}

          onPress={createPost}

        >

          <Text style={styles.buttonText}>
            Post
          </Text>


        </TouchableOpacity>


      </View>






      <FlatList

        data={posts}

        keyExtractor={(item)=>item.id}


        renderItem={({item})=>(


          <View style={styles.post}>


            <Text style={styles.username}>
              {item.username}
            </Text>



            <Text style={styles.message}>
              {item.text}
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

  backgroundColor:colors.background,

  padding:spacing.md,

},



title:{

  color:colors.primary,

  fontSize:28,

  fontWeight:"900",

  marginBottom:spacing.md,

},



box:{

  backgroundColor:colors.surface,

  borderRadius:16,

  padding:spacing.md,

},



input:{

  color:colors.text,

  minHeight:80,

  textAlignVertical:"top",

},



button:{

  backgroundColor:colors.primary,

  padding:12,

  borderRadius:10,

  alignItems:"center",

  marginTop:10,

},



buttonText:{

  color:"#000",

  fontWeight:"900",

},



post:{

  backgroundColor:colors.surface,

  padding:spacing.md,

  borderRadius:16,

  marginTop:spacing.md,

},



username:{

  color:colors.primary,

  fontWeight:"900",

},



message:{

  color:colors.text,

  marginTop:6,

},


});