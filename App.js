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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { WeatherDescKo } from "./WeatherDescKo";

const SCREEN_WIDTH = Dimensions.get("window").width;

const myApiKey = GOOGLE_GEOLOCATION_API_KEY;
const whatherApiKey = WHETHER_API_KEY;

const WeahterDesc = ({ day }) => {
  const rs = WeatherDescKo.find((item) => {
    const id = day.weather[0].id;
    return Object.keys(item)[0] == id;
  });

  const descRs = rs ? Object.values(rs)[0] : "해당하는 날씨 정보가 없습니다.";

  const iconName = rs ? (
    Object.values(rs)[1]
  ) : (
    <MaterialCommunityIcons name="image-filter-none" size={40} color="black" />
  );

  return (
    <>
      <Text style={styles.desc}>{descRs}</Text>
      <Text style={styles.weatherIcon}>
        <MaterialCommunityIcons name={iconName} size={40} color="black" />
      </Text>
    </>
  );
};

const WeekDay = ({ dt }) => {
  const [day, setDay] = useState(null);

  useEffect(() => {
    const date = new Date(dt * 1000);

    /*
      const options = {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      */

    const weekDay = date.toLocaleDateString("kr", { day: "numeric" });

    setDay(weekDay);
  }, []);

  return <Text style={styles.weekDayText}>{day}th</Text>;
};

const useRegDate = () => {
  const [currentDate, setCurrentDate] = useState(null);

  useEffect(() => {
    const date = new Date();

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let date2 = date.getDate();
    let day = date.getDay();

    let hours = date.getHours();
    let miuntes = date.getMinutes();

    const ampm = hours > 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0시인 경우에는 12시를 의미!
    // 0, true, null은 동격 취급!!

    const hoursString = hours < 10 ? `0${hours}` : hours;
    const miuntesString = miuntes < 10 ? `0${miuntes}` : miuntes;

    let formattedDate = `${year}, ${hoursString}:${miuntesString}${ampm}`;

    const dayOfTheWeek = ["일", "월", "화", "수", "목", "금", "토"];

    formattedDate = `${year}, ${month}월 ${date2}일 ${hoursString}:${miuntesString}${ampm}, ${dayOfTheWeek[day]}`;

    // console.log(formattedDate);
    setCurrentDate(formattedDate);
  }, []);

  return currentDate;
};

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // 허가여부
  const [permitted, setPermitted] = useState(true);

  const [city, setCity] = useState(null);
  const [dailyWeather, setDailyWeather] = useState([]);
  const currentDate = useRegDate();

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

    const dataRs = data.results[6];
    const addressComponents = dataRs.address_components[0];
    const cityAddress = addressComponents.short_name;

    const weatherApiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&units=metric&lang=kr&appid=${whatherApiKey}`;
    const respToWeather = await fetch(weatherApiUrl);
    const jsonForWeather = await respToWeather.json();

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
        <Text style={styles.regDate}>{currentDate}</Text>
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
              <View style={styles.forcastCon}>
                <View style={styles.forcastTextBox}>
                  <Text style={styles.forcastTitle}>Week Forcast</Text>
                  <WeekDay dt={day.dt} />
                </View>
                <View style={styles.infoBox}></View>
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
    fontSize: 30,
    fontWeight: "bold",
  },
  weatherIcon: {
    marginTop: 10,
  },
  tempCon: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  temp: {
    fontSize: 200,
  },
  forcastCon: {
    flex: 0.6,
    alignItems: "center",
  },
  forcastTextBox: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
  },
  forcastTitle: {
    fontSize: 25,
    fontWeight: "bold",
  },
  weekDayText: {
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
    height: "100%",
    textAlign: "right",
    paddingTop: 10,
    paddingRight: 10,
  },
  infoBox: {
    flex: 0.6,
    backgroundColor: "black",
    width: "80%",
    borderRadius: 10,
    marginTop: 10,
  },
});

export default App;
