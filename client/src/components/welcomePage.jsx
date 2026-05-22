// import characters from "../assets/characters.jpg";

export default function WelcomePage({ setPageView }) {
  return (
    <div className="welcomePage">
      <div className="logo">
        <img id="logoImage" src="/Reddit_Logo.png" />
        <p id="logoText">phreddit</p>
      </div>
      <h2>The most real place on the internet</h2>

      {/* <div className="characterImg">
        <img src={characters} />
      </div> */}

      <div className="welcomePageButtons">
        <button
          className="registerButton"
          onClick={() => setPageView("register user page view")}>
          Register as a new user
        </button>
        <button
          className="loginButton"
          onClick={() => setPageView("login page view")}>
          Login as an existing user
        </button>
        <button
          className="guestButton"
          onClick={() => setPageView("home page view")}>
          Continue as a guest user
        </button>
      </div>
    </div>
  );
}