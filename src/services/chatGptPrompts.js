/**
 * BIDBATTLE 7.5 - Dedicated ChatGPT Prompt Templates
 * Standardized prompts instructing ChatGPT to gather requirements and generate
 * 100% compatible downloadable JSON files for BIDBATTLE.
 */

export const AUCTION_ARENA_CHATGPT_PROMPT = `I want to create a custom tournament JSON file for BIDBATTLE Auction Arena.

Act as a tournament generator for BIDBATTLE Auction Arena.

First ask me:
1. Tournament name and topic (e.g. Tamil Cinema Superstars, Premier League Legends, MCU Heroes, Anime Warriors, World Cricket Champions, 90s Pop Icons).
2. Number of entries / players to create (e.g. 16, 24, 32, 48).
3. Number of teams (2, 3, or 4 teams).
4. Squad size per team (e.g. 3, 5, or 8 players per team). Minimum entry count must be at least: Number of teams × Squad size.
5. Starting purse per team in ₹ Cr (default: 100 Cr).
6. Rating metric / criteria (e.g. Overall Rating, Impact Score, IMDb Rating, Box Office Power).
7. Categories, subcategories, or specific restrictions (e.g. 90s only, fast bowlers only, directors only, specific era).

### REQUIRED JSON SCHEMA

Follow this exact structure:

{
  "schemaVersion": 1,
  "tournament": {
    "id": "unique-tournament-id",
    "name": "TOURNAMENT NAME",
    "description": "Tournament description",
    "category": "CATEGORY",
    "currency": "INR",
    "currencyUnit": "Cr",
    "scoring": {
      "metricName": "Overall Rating",
      "minScore": 0,
      "maxScore": 100,
      "bestItemsCount": 8
    },
    "settings": {
      "defaultPurse": 100,
      "defaultBasePrice": 1,
      "countdownSeconds": 15,
      "surpriseReveal": false,
      "maxSquadSize": 8
    },
    "teamBudgets": {
      "mode": "equal",
      "defaultPurse": 100,
      "individual": {
        "Nishanth": 100,
        "Ajmal": 100,
        "Praneeth": 100,
        "Nagulan": 100
      }
    }
  },
  "entries": [
    {
      "id": "entry-001",
      "name": "Entry Name",
      "movie": "Context / Universe / Team",
      "actor": "Star / Real Person",
      "year": 2025,
      "category": "Role / Subcategory",
      "basePrice": 5,
      "rating": 95,
      "description": "Brief lore or achievement highlight",
      "imageUrl": "",
      "metadata": {}
    }
  ]
}

### STRICT RULES
- Every entry must have a unique string ID (e.g. "entry-001", "entry-002").
- Every entry must have a non-empty name without numbers inside the name (e.g. "Rolex", not "1. Rolex").
- No duplicate entry IDs and no duplicate entry names.
- Base price suggestions:
  - Rating 95–100: ₹5 Cr
  - Rating 90–94: ₹4 Cr
  - Rating 85–89: ₹3 Cr
  - Rating 80–84: ₹2 Cr
  - Below 80: ₹1 Cr
- Numeric ratings must be between 0 and 100.
- Base prices must be positive numbers.
- Set maxSquadSize and bestItemsCount according to the requested squad size.
- Set all four fixed team budgets ("Nishanth", "Ajmal", "Praneeth", "Nagulan") to the requested purse amount, even if fewer teams participate.
- Ensure the total entries generated is at least: Number of teams × Squad size.
- Use valid JSON with double quotes.
- Provide an actual downloadable .json file. Validate the JSON before sharing the download link.
- State clearly that the output file is compatible with BIDBATTLE Auction Arena.`;

export const DUMB_CHARADES_CHATGPT_PROMPT = `I want to create a custom prompt collection for BIDBATTLE Dumb Charades 2.0.

Act as a prompt collection generator for BIDBATTLE Dumb Charades 2.0.

First ask me:
1. Topic or subject (e.g. Tamil movies, Hollywood movies, MCU, anime, cricket, football, celebrities, cartoon characters, video games, historical personalities, etc.).
2. Collection name (e.g. Kollywood Mass Classics, 90s Nostalgia, Shonen Heroes).
3. Number of prompts to generate (e.g. 15, 20, 30, 50).
4. Difficulty: Easy, Medium, Hard, or Mixed.
5. Categories, subcategories, or restrictions (e.g. only 2010–2024, only action movies, no animated movies).

### REQUIRED JSON FORMAT

Follow this exact structure:

{
  "name": "COLLECTION NAME",
  "category": "MAIN CATEGORY",
  "prompts": [
    {
      "id": "prompt_001",
      "name": "Prompt Name",
      "category": "SUBCATEGORY"
    },
    {
      "id": "prompt_002",
      "name": "Another Prompt",
      "category": "SUBCATEGORY"
    }
  ]
}

### STRICT RULES
- Every prompt must have a unique string ID (e.g. "prompt_001", "prompt_002").
- Every prompt must have a non-empty name.
- No duplicate prompt names.
- Every prompt must have a category.
- Generate exactly the requested number of prompts.
- Do not include numbering or prefixes inside prompt names (e.g. "Leo", not "1. Leo").
- Do not add descriptions or unnecessary fields.
- Use valid JSON with double quotes.
- Ensure all prompts match the selected difficulty and topic.
- Do not invent titles, names, or fictional items for real topics.
- Create an actual downloadable .json file.
- Validate the file before sharing the download link.
- State clearly that the output file is for BIDBATTLE Dumb Charades 2.0.`;
