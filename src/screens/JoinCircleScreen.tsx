import React, { useState } from "react";
import { joinCircleWithCode } from "../utils/joinCircle";
import { getAuth } from "firebase/auth";

const JoinCircle = () => {
  const [code, setCode] = useState("");

  const handleJoin = async () => {
    const user = getAuth().currentUser;
    if (!user) {
      alert("User not logged in");
      return;
    }

    const result = await joinCircleWithCode(code.trim(), user.uid);
    if (result.success) {
      alert("You have joined the circle!");
      setCode("");
    } else {
      alert(result.message || "Failed to join circle");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Join a Circle</h2>
      <input
        type="text"
        placeholder="Enter invite code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
          width: "100%",
          marginBottom: "10px",
        }}
      />
      <button
        onClick={handleJoin}
        style={{ padding: "10px", width: "100%", fontSize: "16px" }}
      >
        Join Circle
      </button>
    </div>
  );
};

export default JoinCircle;
