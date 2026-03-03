import "../App.css";

export default function Card({ children, small = false, className = "" }) {
  return (
    <div
      className={`glass-card ${small ? "small" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
