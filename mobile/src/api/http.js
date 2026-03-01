import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const http = axios.create({
  baseURL: "http://192.168.0.76:3001/api", 
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
