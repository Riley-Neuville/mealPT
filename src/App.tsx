import { useState, useEffect } from "react";
import "./App.css";
import Slider from "@mui/material/Slider";
import { Select, MenuItem } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import OpenAI from "openai";

function App() {
  const [calories, setCalories] = useState(1500);
  const [diet, setDiet] = useState("None");
  const [name, setName] = useState("");
  const [allergies, setAllergies] = useState("");
  const [response, setResponse] = useState("Your response will appear here");
  const [proteins, setProteins] = useState("");
  const [loading, setLoading] = useState(false);

  const apiKey = import.meta.env.VITE_API_KEY;
  const client = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // This is the default and can be omitted
  });

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
    const fullMessage = `Create a meal plan for one day that totals ${calories} calories. The meal plan should include 3 meals. Please follow the dietary restrictions: ${diet}. The user is named ${name}, has the following proteins on hand: ${proteins} and has the following allergies: ${allergies}. Please provide the meal plan in a clear and concise format and include the calorie estimate of each ingredient.`;
    try {
      const chatCompletion = await client.chat.completions.create({
        messages: [{ role: "user", content: fullMessage }],
        model: "gpt-4o",
      });
      setResponse(
        chatCompletion.choices[0]?.message?.content || "No response."
      );
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse("Failed to get response.");
    }
    setLoading(false);
  }

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
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
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
            valueLabelDisplay="auto"
            shiftStep={100}
            step={100}
            marks={true}
            min={1000}
            max={3000}
            onChange={(e, value) => setCalories(value as number)}
          />
        </div>
        <p>{calories}</p>
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
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          component="form"
          sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}
          noValidate
          autoComplete="off"
        >
          <TextField
            style={{ width: "50%" }}
            id="outlined-multiline-flexible"
            label="Response"
            value={response}
            multiline
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            maxRows={10}
          />
        </Box>
      </div>
    </>
  );
}

export default App;
