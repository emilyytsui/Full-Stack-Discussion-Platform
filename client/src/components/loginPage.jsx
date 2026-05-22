import { useState } from "react";

export default function LoginPage({ onLogin, serverError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const nextErrors = {};

    const validEmail = emailRegex.test(trimmedEmail);

    // const user = users.find(
    //   (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase(),
    // );

    if (trimmedEmail.length === 0) {
      nextErrors.email = "Email is required.";
    } else if (!validEmail) {
      nextErrors.email = "Email format is invalid.";
    }
    // else if (!user) {
    //   nextErrors.email = "Unregistered email.";
    // }

    if (trimmedPassword.length === 0) {
      nextErrors.password = "Password is required.";
    }

    // else if (user.password !== trimmedPassword) {
    //   nextErrors.password = "Incorrect password.";
    // }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onLogin(trimmedEmail, trimmedPassword);
  };

  return (
    <div className="registerUserPage">
      <form className="formPage" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="formError">{serverError || ""}</div>

        <div className="formField">
          <label htmlFor="email">
            Email<span className="requiredMark">*</span>
          </label>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="formError">{errors.email || ""}</div>
        </div>

        <div className="formField">
          <label htmlFor="password">
            Password<span className="requiredMark">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="formError">{errors.password || ""}</div>
        </div>

        <button type="submit" className="primaryButton">
          Login
        </button>
      </form>
    </div>
  );
}
