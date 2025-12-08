import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="relative w-10 h-10 transform rotate-165">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-before8"></div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-after6"></div>

      <style>
        {`
          @keyframes before8 {
            0% {
              width: 0.5em;
              box-shadow: 1em -0.5em rgba(111, 202, 220, 0.75), -1em 0.5em rgba(111, 202, 220, 0.75);
            }

            35% {
              width: 2.5em;
              box-shadow: 0 -0.5em rgba(111, 202, 220, 0.75), 0 0.5em rgba(111, 202, 220, 0.75);
            }

            70% {
              width: 0.5em;
              box-shadow: -1em -0.5em rgba(111, 202, 220, 0.75), 1em 0.5em rgba(111, 202, 220, 0.75);
            }

            100% {
              box-shadow: 1em -0.5em rgba(111, 202, 220, 0.75), -1em 0.5em rgba(111, 202, 220, 0.75);
            }
          }

          @keyframes after6 {
            0% {
              height: 0.5em;
              box-shadow: 0.5em 1em rgba(111, 202, 220, 0.75), -0.5em -1em rgba(111, 202, 220, 0.75));
            }

            35% {
              height: 2.5em;
              box-shadow: 0.5em 0 rgba(111, 202, 220, 0.75), -0.5em 0 rgba(111, 202, 220, 0.75);
            }

            70% {
              height: 0.5em;
              box-shadow: 0.5em -1em rgba(111, 202, 220, 0.75), -0.5em 1em rgba(111, 202, 220, 0.75);
            }

            100% {
              box-shadow: 0.5em 1em rgba(111, 202, 220, 0.75), -0.5em -1em rgba(111, 202, 220, 0.75);
            }
          }

          .animate-before8 {
            animation: before8 2s infinite;
          }

          .animate-after6 {
            animation: after6 2s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Loader;
