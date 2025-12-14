import React from "react";
import LoginImage from "../../assets/App-Logo-Full.png";

const LoginLogo: React.FC = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <div>
          <img className="h-24 w-auto" src={LoginImage} alt="Login Icon" />
        </div>
        {/* <div>
          <p
            style={{ fontSize: "36px", color: "#293343" }}
            className="font-medium"
          >
            Medistry
            <span
              style={{ color: "rgb(30 192 190 / 94%)", fontWeight: "300" }}
            ></span>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginLogo;
