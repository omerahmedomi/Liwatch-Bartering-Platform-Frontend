import { jwtDecode } from "jwt-decode";

export const isTokenValid = () => {
  const token = localStorage.getItem("liwatch_token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; //convert to seconds
     const expirationDate = new Date(decoded.exp! * 1000);
     const currentDate = new Date(Date.now())
     console.log("Token expires at:", expirationDate);
     console.log("Current Date:", currentDate);
console.log(currentTime,decoded.exp);
    // expired if current time is greater than expiry time
    if (decoded.exp! < currentTime) {
      localStorage.removeItem("liwatch_token");
      return false;
    }
    return true;
  } catch (error) {
    console.log(error)
    return false;
  }
};
