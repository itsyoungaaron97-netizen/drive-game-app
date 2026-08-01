import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";


import {
  registerWithEmail,
  loginWithEmail,
} from "../services/firebase";


import {
  colors,
  spacing,
} from "../constants/theme";




export default function AuthScreen() {


  const [isLogin,setIsLogin] =
    useState(true);


  const [email,setEmail] =
    useState("");


  const [password,setPassword] =
    useState("");


  const [displayName,setDisplayName] =
    useState("");


  const [nationality,setNationality] =
    useState("");


  const [country,setCountry] =
    useState("");


  const [state,setState] =
    useState("");


  const [city,setCity] =
    useState("");


  const [loading,setLoading] =
    useState(false);






  const handleSubmit = async()=>{


    if(
      !email.trim() ||
      !password.trim()
    ){

      Alert.alert(
        "Error",
        "Email and password are required"
      );

      return;

    }





    if(!isLogin){


      if(!displayName.trim()){

        Alert.alert(
          "Error",
          "Display name is required"
        );

        return;

      }



      if(
        !nationality.trim() ||
        !country.trim() ||
        !city.trim()
      ){

        Alert.alert(
          "Error",
          "Nationality, country and city are required"
        );

        return;

      }


    }






    setLoading(true);



    try {



      if(isLogin){


        await loginWithEmail(
          email.trim(),
          password
        );


      }else{


        await registerWithEmail(

          email.trim(),

          password,

          displayName.trim(),

          {

            nationality:
              nationality.trim(),

            country:
              country.trim(),

            state:
              state.trim(),

            city:
              city.trim(),

          }

        );


      }





    }catch(e:any){


      Alert.alert(

        "Auth Error",

        e.message ||
        "Something went wrong"

      );


    }finally{


      setLoading(false);


    }


  };







return (

<KeyboardAvoidingView

style={styles.container}

behavior={
Platform.OS==="ios"
?
"padding"
:
undefined
}

>


<View style={styles.inner}>


<Text style={styles.logo}>
DRIVE
</Text>


<Text style={styles.subtitle}>
Real roads. Real ranks.
</Text>





{!isLogin && (

<>


<TextInput

style={styles.input}

placeholder="Display name"

placeholderTextColor={colors.textSecondary}

value={displayName}

onChangeText={setDisplayName}

/>



<TextInput

style={styles.input}

placeholder="Nationality"

placeholderTextColor={colors.textSecondary}

value={nationality}

onChangeText={setNationality}

/>



<TextInput

style={styles.input}

placeholder="Country"

placeholderTextColor={colors.textSecondary}

value={country}

onChangeText={setCountry}

/>



<TextInput

style={styles.input}

placeholder="State / Region"

placeholderTextColor={colors.textSecondary}

value={state}

onChangeText={setState}

/>



<TextInput

style={styles.input}

placeholder="City"

placeholderTextColor={colors.textSecondary}

value={city}

onChangeText={setCity}

/>



</>

)}





<TextInput

style={styles.input}

placeholder="Email"

placeholderTextColor={colors.textSecondary}

value={email}

onChangeText={setEmail}

keyboardType="email-address"

autoCapitalize="none"

/>





<TextInput

style={styles.input}

placeholder="Password"

placeholderTextColor={colors.textSecondary}

value={password}

onChangeText={setPassword}

secureTextEntry

/>







<TouchableOpacity

style={styles.button}

onPress={handleSubmit}

disabled={loading}

>


{

loading

?

<ActivityIndicator color="#000"/>

:

<Text style={styles.buttonText}>

{
isLogin
?
"Log In"
:
"Create Account"
}

</Text>

}


</TouchableOpacity>





<TouchableOpacity

onPress={()=>setIsLogin(!isLogin)}

>


<Text style={styles.switchText}>

{

isLogin

?

"No account? Sign up"

:

"Already have an account? Log in"

}

</Text>


</TouchableOpacity>





</View>


</KeyboardAvoidingView>

);


}






const styles = StyleSheet.create({


container:{

flex:1,

backgroundColor:colors.background,

},



inner:{

flex:1,

justifyContent:"center",

padding:spacing.lg,

},



logo:{

fontSize:48,

fontWeight:"900",

color:colors.primary,

textAlign:"center",

},



subtitle:{

color:colors.textSecondary,

textAlign:"center",

marginBottom:spacing.xl,

},



input:{

backgroundColor:colors.surface,

borderRadius:12,

padding:spacing.md,

color:colors.text,

marginBottom:spacing.md,

},



button:{

backgroundColor:colors.primary,

padding:spacing.md,

borderRadius:12,

alignItems:"center",

},



buttonText:{

color:"#000",

fontWeight:"700",

},



switchText:{

color:colors.textSecondary,

textAlign:"center",

marginTop:spacing.lg,

},


});