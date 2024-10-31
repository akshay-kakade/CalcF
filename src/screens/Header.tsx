const Header = () => {
  return (
    <header className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white p-1 rounded shadow-lg w-full">
      <h4 className="text-2xl font-bold">AI-Powered Calculator</h4>
      <p className="text-sm mt-2">
        CREATED BY 
        <a href="https://www.linkedin.com/in/akshay-kakade" className="underline ml-1 cursor-pointer hover:text-amber-500" target="_blank" rel="noopener noreferrer">
          Akshay Kakade
        </a> 
        & 
        <a href="https://www.linkedin.com/in/maverick-jones" className="underline ml-1 cursor-pointer hover:text-amber-500" target="_blank" rel="noopener noreferrer">
          Maverick Jones
        </a> 
        © 2024
      </p>
    </header>
  );
};

export default Header;
