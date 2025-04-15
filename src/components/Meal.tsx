import { useState, useEffect } from "react";

type MealProps = {
  name: string;
  ingredients: string[];
  instructions: string;
  calories: number;
  onSwap: () => void; // new prop
};

const Meal: React.FC<MealProps> = ({
  name,
  ingredients,
  instructions,
  calories,
  onSwap,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        margin: "20px 0",
        backgroundColor: "#2a2a2a",
        border: "2px solid #4ea1f3",
        borderRadius: "16px",
        padding: "1.5rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        color: "#e0e0e0",
        transition: "border 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <h2>{name}</h2>
      <p>
        <strong>Calories:</strong> {calories}
      </p>

      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          marginLeft: "10px",
          backgroundColor: "#4ea1f3",
          color: "white",
          border: "none",
          padding: "6px 10px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {expanded ? "↑ Hide Details ↑" : "↓ Show Details ↓"}
      </button>

      <button
        onClick={onSwap}
        style={{
          marginLeft: "10px",
          backgroundColor: "#4ea1f3",
          color: "white",
          border: "none",
          padding: "6px 10px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Swap Meal
      </button>

      {expanded && (
        <div style={{ marginTop: "10px" }}>
          <p>
            <strong>Ingredients:</strong>
          </p>
          <ul>
            {ingredients.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p>
            <strong>Instructions:</strong> {instructions}
          </p>
        </div>
      )}
    </div>
  );
};

export default Meal;
