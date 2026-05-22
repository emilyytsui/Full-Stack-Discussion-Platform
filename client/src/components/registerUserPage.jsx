import { useState } from "react";

export default function RegisterUserPage({ users, onCreateUser }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedDisplayName = displayName.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    const nextErrors = {};

    if (trimmedFirstName.length === 0) {
      nextErrors.firstName = "First name is required.";
    }

    if (trimmedLastName.length === 0) {
      nextErrors.lastName = "Last name is required.";
    }

    const validEmail = emailRegex.test(trimmedEmail);
    const emailID = validEmail ? trimmedEmail.split("@")[0] : "";

    if (trimmedEmail.length === 0) {
      nextErrors.email = "Email is required.";
    } else if (!validEmail) {
      nextErrors.email = "Email format is invalid.";
    } else if (
      users.some(
        (user) => user.email.toLowerCase() === trimmedEmail.toLowerCase(),
      )
    ) {
      nextErrors.email = "An account with the same email already exists.";
    }

    if (trimmedDisplayName.length === 0) {
      nextErrors.displayName = "Display name is required.";
    } else if (
      users.some(
        (user) =>
          user.displayName.toLowerCase() === trimmedDisplayName.toLowerCase(),
      )
    ) {
      nextErrors.displayName =
        "An account with the same display name already exists.";
    }

    if (trimmedPassword.length === 0) {
      nextErrors.password = "Password is required.";
    } else if (
      trimmedFirstName &&
      trimmedPassword.toLowerCase().includes(trimmedFirstName.toLowerCase())
    ) {
      nextErrors.password = "Password should not contain first name.";
    } else if (
      trimmedLastName &&
      trimmedPassword.toLowerCase().includes(trimmedLastName.toLowerCase())
    ) {
      nextErrors.password = "Password should not contain last name.";
    } else if (
      trimmedDisplayName &&
      trimmedPassword.toLowerCase().includes(trimmedDisplayName.toLowerCase())
    ) {
      nextErrors.password = "Password should not contain display name.";
    } else if (
      emailID &&
      trimmedPassword.toLowerCase().includes(emailID.toLowerCase())
    ) {
      nextErrors.password = "Password should not contain email id.";
    }

    if (trimmedConfirmPassword.length === 0) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (trimmedPassword !== trimmedConfirmPassword) {
      nextErrors.confirmPassword =
        "Password and confirm password do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onCreateUser(
      trimmedFirstName,
      trimmedLastName,
      trimmedEmail,
      trimmedDisplayName,
      trimmedPassword,
      trimmedConfirmPassword,
    );
  };

  return (
    <div className="registerUserPage">
      <form className="formPage" onSubmit={handleSubmit}>
        <h2>Register as a new user</h2>

        <div className="formField">
          <label htmlFor="firstName">
            First Name<span className="requiredMark">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <div className="formError">{errors.firstName || ""}</div>
        </div>

        <div className="formField">
          <label htmlFor="lastName">
            Last Name<span className="requiredMark">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <div className="formError">{errors.lastName || ""}</div>
        </div>

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
          <label htmlFor="displayName">
            Display Name<span className="requiredMark">*</span>
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <div className="formError">{errors.displayName || ""}</div>
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

        <div className="formField">
          <label htmlFor="confirmPassword">
            Confirm Password<span className="requiredMark">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="formError">{errors.confirmPassword || ""}</div>
        </div>

        <button type="submit" className="primaryButton">
          Sign Up
        </button>
      </form>
    </div>
  );
}
