import { createRoot } from "react-dom/client"; // Native React library to mount the app
import App from "./App"; // Root component of the application
import "./styles/index.css"; // Global Tailwind CSS styles

// Initialize the React application and render it into the 'root' div in index.html
createRoot(document.getElementById("root")).render(<App />);
