import React from "react";

const AppLoader: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex gap-4 p-4 flex-wrap justify-center">
          <img
            className="w-20 h-20 animate-spin"
            src="https://www.svgrepo.com/show/70469/loading.svg"
            alt="Loading icon"
          />
        </div>
      </div>
    </div>
  );
};

export default AppLoader;
