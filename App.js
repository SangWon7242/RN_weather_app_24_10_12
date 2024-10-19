import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Dimensions } from "react-native";
import * as Location from "expo-location";
import { GOOGLE_GEOLOCATION_API_KEY, WHETHER_API_KEY } from "@env";
import React, { useState, useEffect } from "react";
import Fontisto from "@expo/vector-icons/Fontisto";
import { weatherDescKo } from "./WeatherDescKo";

const SCREEN_WIDTH = Dimensions.get("window").width;

const myApiKey = GOOGLE_GEOLOCATION_API_KEY;
const whatherApiKey = WHETHER_API_KEY;

const WeahterDesc = ({ day }) => {
  const rs = weatherDescKo.find((item) => {
    const id = day.weather[0].id;
    return Object.keys(item)[0] == id;
  });

  const descRs = rs ? Object.values(rs)[0] : "해당하는 날씨 정보가 없습니다.";

  return <Text style={styles.desc}>{descRs}</Text>;
};

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // 허가여부
  const [permitted, setPermitted] = useState(true);

  const [city, setCity] = useState(null);
  const [dailyWeather, setDailyWeather] = useState([]);

  const locationData = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();

    if (!granted) {
      setPermitted(false);
      setErrorMsg("위치에 대한 권한 부여가 거부되었습니다.");

      return;
    }

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    /*
    const address = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    
    */

    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${myApiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    const dataRs = data.results[7];
    const addressComponents = dataRs.address_components[0];
    const cityAddress = addressComponents.short_name;

    const weatherApiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&units=metric&lang=kr&appid=${whatherApiKey}`;
    const respToWeather = await fetch(weatherApiUrl);
    const jsonForWeather = await respToWeather.json();
    console.log(jsonForWeather);
    console.log(jsonForWeather.daily);
    setDailyWeather(jsonForWeather.daily);

    setCity(cityAddress);
  };

  useEffect(() => {
    locationData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.cityCon}>
        <Text style={styles.city}>{city}</Text>
      </View>
      <View style={styles.regDateCon}>
        <Text style={styles.regDate}>10월 19일, 일, 13:18</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {dailyWeather.length === 0 ? (
          <View style={styles.weatherInner}>
            <ActivityIndicator size="large" color="#00ff00" />
          </View>
        ) : (
          dailyWeather.map((day, index) => (
            <View key={index} style={styles.weatherInner}>
              <View style={styles.day}>
                <WeahterDesc day={day} />
                <Text style={styles.weatherIcon}>
                  <Fontisto name="rain" size={45} color="black" />
                </Text>
              </View>
              <View style={styles.tempCon}>
                <Text style={styles.temp}>
                  {parseFloat(day.temp.day).toFixed(0)}
                </Text>
                <Text
                  style={{
                    fontSize: 100,
                    position: "absolute",
                    top: 65,
                    right: 50,
                  }}
                >
                  º
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe01a",
  },
  cityCon: {
    flex: 0.3,
  },
  city: {
    flex: 1,
    marginTop: 50,
    paddingTop: 20,
    fontSize: 40,
    textAlign: "center",
    fontWeight: "bold",
  },
  regDateCon: {
    alignItems: "center",
  },
  regDate: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 15,
    backgroundColor: "black",
    color: "white",
    fontWeight: "bold",
    borderRadius: 20,
    overflow: "hidden",
  },
  weather: {},
  weatherInner: {
    flex: 3,
    width: SCREEN_WIDTH,
  },
  day: {
    flex: 0.15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  desc: {
    fontSize: 40,
    fontWeight: "bold",
  },
  weatherIcon: {
    marginTop: 20,
  },
  tempCon: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  temp: {
    fontSize: 200,
  },
});

export default App;
