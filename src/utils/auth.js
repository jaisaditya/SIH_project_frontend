// frontend/src/utils/auth.js
export function getCurrentIdentity() {
  // We store user profile as "user" and doctor profile as "doctor" in your app
  try {
    const doctorToken = localStorage.getItem("doctorToken");
    const userToken = localStorage.getItem("userToken");

    console.log("getCurrentIdentity: doctorToken=", !!doctorToken, " userToken=", !!userToken);

    if (doctorToken) {
      const doc = JSON.parse(localStorage.getItem("doctor") || "null");
      console.log("getCurrentIdentity: doctor profile:", doc);
      if (doc && doc._id) return { _id: doc._id, role: "doctor" };
    }

    if (userToken) {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      console.log("getCurrentIdentity: user profile:", user);
      if (user && user._id) return { _id: user._id, role: "patient" };
    }
  } catch (err) {
    console.error("getCurrentIdentity error:", err);
  }

  return null;
}
