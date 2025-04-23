import { useState, useEffect } from "react";
import "./App.css";
import Slider from "@mui/material/Slider";
import { Select, MenuItem } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MuiInput from "@mui/material/Input";
import { styled } from "@mui/material/styles";
import OpenAI from "openai";
import Meal from "./components/Meal";

function App() {
  const [calories, setCalories] = useState(1500);
  const [diet, setDiet] = useState("None");
  const [name, setName] = useState("");
  const [allergies, setAllergies] = useState("");
  const [response, setResponse] = useState<string>(
    "Your response will appear here"
  );
  const [mealData, setMealData] = useState<MealType[]>([]);

  const [proteins, setProteins] = useState("");
  const [loading, setLoading] = useState(false);

  type Meal = {
    name: string;
    ingredients: string[];
    instructions: string;
    calories: number;
  };

  type MealType = {
    name: string;
    ingredients: string[];
    instructions: string;
    calories: number;
  };

  const apiKey = import.meta.env.VITE_API_KEY;
  const client = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // This is the default and can be omitted
  });

  const Input = styled(MuiInput)`
    width: 42px;
  `;

  const proteinList = [
    { title: "Chicken" },
    { title: "Beef" },
    { title: "Fish" },
    { title: "Pork" },
    { title: "Tofu" },
    { title: "Eggs" },
    { title: "Turkey" },
  ];
  async function handleClick() {
    setLoading(true);
    const fullMessage = `Create a meal plan for one day that totals ${calories} calories. The meal plan should include 3 meals. Please follow the dietary restrictions: ${diet}. The user is named ${name}, has the following proteins on hand: ${proteins} and has the following allergies: ${allergies}.
    
    Please return the meal plan as a JSON object with the following structure and do not include any other text so it is easily parsable:
{
  "meals": [
    {
      "name": "Breakfast - Avocado Toast with Eggs",
      "ingredients": ["2 eggs", "1 slice whole wheat toast", "1/2 avocado"],
      "instructions": "Cook the eggs to your liking. Toast the bread. Serve with sliced avocado.",
      "calories": 350
    },
    {
      "name": "Lunch",
      "ingredients": [...],
      ...
    },
    ...
  ]
}`;
    try {
      const chatCompletion = await client.chat.completions.create({
        messages: [{ role: "user", content: fullMessage }],
        model: "gpt-4o",
      });
      const raw = chatCompletion.choices[0]?.message?.content || "";
      const match = raw.match(/\{[\s\S]*\}/); // Match the full JSON object

      if (!match) {
        console.error("No JSON object found in GPT response");
        return;
      }

      try {
        const parsed = JSON.parse(match[0]);

        if (Array.isArray(parsed.meals)) {
          setMealData(parsed.meals);
        } else {
          console.error("Parsed data does not contain a meals array");
        }
      } catch (err) {
        console.error("Error parsing GPT response JSON:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClickJSON() {
    console.log(response);
  }

  const swapMeal = async (index: number) => {
    if (!mealData) return;

    const currentMeal = mealData[index];

    const swapPrompt = `Give me one meal idea with about ${currentMeal.calories} calories that is eaten at the same time of day as ${currentMeal.name} but is not the same as ${currentMeal.name}.  Please follow the dietary restrictions: ${diet}. The user has the following proteins on hand: ${proteins} and has the following allergies: ${allergies}. Format it as a JSON object:
{
  "name": "Breakfast - Avocado Toast with Eggs",
      "ingredients": ["2 eggs", "1 slice whole wheat toast", "1/2 avocado"],
      "instructions": "Cook the eggs to your liking. Toast the bread. Serve with sliced avocado.",
      "calories": 350
}`;

    try {
      const res = await client.chat.completions.create({
        messages: [{ role: "user", content: swapPrompt }],
        model: "gpt-4o",
      });

      const raw = res.choices[0]?.message?.content || "";
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No valid JSON found");

      const newMeal = JSON.parse(match[0]);

      // Replace only the selected meal
      const updatedMeals = [...mealData];
      updatedMeals[index] = newMeal;
      setMealData(updatedMeals);
    } catch (err) {
      console.error("Swap error:", err);
      alert("Failed to swap meal.");
    }
  };

  return (
    <>
      <h1>MealPT</h1>

      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        component="form"
        sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="outlined-flexible"
          label="Name"
          placeholder="Add a name"
          maxRows={4}
          onChange={(e) => setName(e.target.value)}
        />
        <br></br>
        <TextField
          id="outlined-multiline-flexible"
          label="Allergies"
          multiline
          placeholder="Input any allergies"
          maxRows={4}
          onChange={(e) => setAllergies(e.target.value)}
        />
        <br></br>
        <Autocomplete
          multiple
          id="tags-standard"
          options={proteinList}
          getOptionLabel={(option) => option.title}
          getOptionDisabled={(option) => proteins.includes(option.title)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Select which proteins you have on hand"
              placeholder="Proteins"
            />
          )}
          onChange={(event, value) => {
            setProteins(value.map((item) => item.title).join(", "));
            console.log(value);
          }}
        />
        <br></br>
        <p>Calories</p>
        <br></br>
        <div className="sliderSection" style={{ width: "50%" }}>
          <Slider
            aria-label="always visible"
            defaultValue={1500}
            value={calories}
            valueLabelDisplay="auto"
            shiftStep={100}
            step={100}
            marks={true}
            min={1000}
            max={3000}
            onChange={(e: Event, value: number | number[]) =>
              setCalories(value as number)
            }
          />
          <Input
            value={calories}
            size="small"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCalories(Number(e.target.value))
            }
            inputProps={{
              step: 100,
              min: 1000,
              max: 3000,
              type: "number",
              "aria-labelledby": "input-slider",
            }}
          />
        </div>
        <br></br>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={diet}
          label="Diet"
          onChange={(e) => setDiet(e.target.value)}
        >
          <MenuItem value={"None"}>None</MenuItem>
          <MenuItem value={"Keto"}>Keto</MenuItem>
          <MenuItem value={"Paleo"}>Paleo</MenuItem>
          <MenuItem value={"Whole30"}>Whole30</MenuItem>
        </Select>
        <br></br>
        <Button
          variant="contained"
          onClick={() => {
            handleClick();
          }}
        >
          Submit
        </Button>
      </Box>
      <div className="response area">
        {Array.isArray(mealData) &&
          mealData.map((meal, index) => (
            <Meal
              key={index}
              name={meal.name}
              ingredients={meal.ingredients}
              instructions={meal.instructions}
              calories={meal.calories}
              onSwap={() => swapMeal(index)}
            />
          ))}
      </div>
    </>
  );
}

export default App;
