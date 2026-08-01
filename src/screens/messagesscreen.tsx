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



interface Message {

  id:string;

  sender:string;

  text:string;

}



export default function MessagesScreen(){


  const [message,setMessage] =
    useState("");



  const [messages,setMessages] =
    useState<Message[]>([]);





  const sendMessage = () => {


    if(!message.trim()){

      return;

    }



    const newMessage:Message = {

      id:
        Date.now().toString(),

      sender:
        "You",

      text:
        message.trim(),

    };



    setMessages([

      newMessage,

      ...messages,

    ]);



    setMessage("");

  };







  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        Messages
      </Text>



      <FlatList

        data={messages}

        keyExtractor={(item)=>item.id}


        renderItem={({item})=>(

          <View style={styles.messageBox}>

            <Text style={styles.sender}>
              {item.sender}
            </Text>


            <Text style={styles.text}>
              {item.text}
            </Text>


          </View>

        )}

      />






      <View style={styles.inputBox}>


        <TextInput

          value={message}

          onChangeText={setMessage}

          placeholder="Message..."

          placeholderTextColor={colors.textSecondary}

          style={styles.input}

        />



        <TouchableOpacity

          style={styles.button}

          onPress={sendMessage}

        >

          <Text style={styles.buttonText}>
            Send
          </Text>


        </TouchableOpacity>


      </View>



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



messageBox:{

  backgroundColor:colors.surface,

  padding:spacing.md,

  borderRadius:16,

  marginBottom:spacing.sm,

},



sender:{

  color:colors.primary,

  fontWeight:"900",

},



text:{

  color:colors.text,

  marginTop:5,

},



inputBox:{

  flexDirection:"row",

  alignItems:"center",

  backgroundColor:colors.surface,

  borderRadius:16,

  padding:8,

},



input:{

  flex:1,

  color:colors.text,

  padding:10,

},



button:{

  backgroundColor:colors.primary,

  paddingHorizontal:15,

  paddingVertical:10,

  borderRadius:10,

},



buttonText:{

  color:"#000",

  fontWeight:"900",

},


});