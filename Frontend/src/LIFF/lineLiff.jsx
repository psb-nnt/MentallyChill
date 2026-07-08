import React, { useEffect, useContext, useState } from "react";
import liff from "@line/liff";
import { ProfileContext } from "./ProfileContext";

const LineLiff = () => {
  const { profile, setProfile } = useContext(ProfileContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: import.meta.env.VITE_LIFF_ID })
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const userProfile = await liff.getProfile();
          const uid = liff.getDecodedIDToken().sub; // Get uid
          setProfile({ ...userProfile, uid });
          console.log("Profile:", userProfile, "UID:", uid);
        }
      } catch (err) {
        console.error("LIFF initialization failed", err);
        setError(err);
      }
    };

    initializeLiff();
  }, [setProfile]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>LINE LIFF Profile</h1>
      <p>UID: {profile.uid}</p>
      <p>Display Name: {profile.displayName}</p>
      <img src={profile.pictureUrl} alt="Profile" />
      <p>Status Message: {profile.statusMessage}</p>
    </div>
  );
};

export default LineLiff;
