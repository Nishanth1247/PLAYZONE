/**
 * BIDBATTLE 7.8 - Dedicated ChatGPT Prompt Templates
 * Standardized prompts instructing ChatGPT to gather requirements and generate
 * 100% compatible downloadable JSON files for BIDBATTLE Auction Arena, Battle Arena,
 * and Dumb Charades.
 */

export const AUCTION_ARENA_CHATGPT_PROMPT = `I want to create a custom tournament JSON file for BIDBATTLE Auction Arena.

Act as an expert tournament generator for BIDBATTLE Auction Arena.

First ask me these 9 questions:
1. Tournament name and topic (e.g. Tamil Cinema Superstars, Premier League Legends, MCU Heroes, Anime Warriors, World Cricket Champions, 90s Pop Icons).
2. Number of entries / players to create (e.g. 16, 24, 32, 48).
3. Number of participating teams: 2, 3, or 4 teams.
4. Squad size per team (e.g. 3, 5, or 8 players per team). Minimum entries needed = Teams × Squad Size.
5. Starting purse per team in ₹ Cr (default: 100 Cr).
6. Equal or individually configurable team budgets (e.g. Equal ₹100 Cr each, or custom amounts like Nishanth ₹120 Cr, Ajmal ₹100 Cr, Praneeth ₹90 Cr).
7. Rating/scoring criteria (e.g. Overall Rating, Impact Score, IMDb Rating, Box Office Power).
8. Default base price in ₹ Cr (default: ₹1 Cr or ₹2 Cr).
9. Restrictions, exclusions, and special requirements (e.g. 90s era only, specific franchise, no duplicate real-life actors).

### FORMULA CHECK
- Always calculate: Minimum Entries = Number of Teams × Squad Size.
- Examples:
  - 2 teams × 5 squad = minimum 10 entries.
  - 3 teams × 8 squad = minimum 24 entries.
  - 4 teams × 10 squad = minimum 40 entries.
- Never generate fewer entries than required for the selected teams and squad size.

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
      "countdownSeconds": 20,
      "surpriseReveal": false,
      "minSquadSize": 4,
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
- Include all four predefined franchises in "individual" budgets ("Nishanth", "Ajmal", "Praneeth", "Nagulan"), but note that the user can choose any 2, 3, or 4 team combination in BIDBATTLE.
- Do NOT hardcode team selection in a way that prevents the user from overriding franchises or purses in the BIDBATTLE configuration screen.
- Ensure total entries generated >= Number of teams × Squad size.
- Use valid JSON with double quotes.
- Provide an actual downloadable .json file. Validate the JSON before sharing the download link.
- State clearly that the output file is 100% compatible with BIDBATTLE Auction Arena and supports full setup customization upon import.`;

export const BATTLE_ARENA_CHATGPT_PROMPT = `I want to create a custom tournament JSON file for BIDBATTLE Battle Arena.

Act as an expert Battle Arena tournament generator for BIDBATTLE.

First ask me these 9 questions:
1. Tournament name and topic (e.g. Kollywood Action Heroes, Multiverse Combatants, Premier League Strikers, Anime Titans, Comic Book Superheroes).
2. Number of entries / fighters to create (e.g. 16, 24, 32, 40).
3. Number of participating teams: 2, 3, or 4 teams.
4. Squad size per team (e.g. 3, 5, or 8 fighters per team). Minimum entries needed = Teams × Squad Size.
5. Starting purse per team in ₹ Cr (default: 100 Cr).
6. Equal or individual team budgets (e.g. Equal ₹100 Cr, or individual amounts like Nishanth ₹120 Cr, Ajmal ₹100 Cr).
7. Combat rating criteria (e.g. Combat Rating, Battle Power, Hero Score 0–100).
8. Default base price in ₹ Cr (default: ₹1 Cr or ₹2 Cr).
9. Universe, franchise, era, or special restrictions (e.g. action heroes only, specific directors, supernatural powers).

### BATTLE ARENA TOURNAMENT FORMAT
- Round 1: Live Team Auction where franchises bid for their squads.
- Round 2: Head-to-Head Arena Battles where squads clash 1v1. Win = 3 pts, Draw = 1 pt, Loss = 0 pts.
- Formula check: Minimum Entries = Number of Teams × Squad Size.
  - 2 teams × 5 squad = minimum 10 fighters.
  - 3 teams × 5 squad = minimum 15 fighters.
  - 4 teams × 8 squad = minimum 32 fighters.
- Never generate fewer entries than required for the selected teams and squad size.

### REQUIRED JSON SCHEMA

Follow this exact structure:

{
  "schemaVersion": 1,
  "tournament": {
    "id": "battle-clash-unique-id",
    "name": "BATTLE TOURNAMENT NAME",
    "description": "Battle Arena tournament description",
    "category": "BATTLE CATEGORY",
    "currency": "INR",
    "currencyUnit": "Cr",
    "scoring": {
      "metricName": "Combat Rating",
      "minScore": 0,
      "maxScore": 100,
      "bestItemsCount": 8
    },
    "settings": {
      "defaultPurse": 100,
      "defaultBasePrice": 1,
      "countdownSeconds": 20,
      "surpriseReveal": false,
      "minSquadSize": 3,
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
      "id": "fighter-001",
      "name": "Fighter Name",
      "movie": "Movie / Universe / Franchise",
      "actor": "Actor / Character Origin",
      "year": 2025,
      "category": "Fighter Archetype / Role",
      "basePrice": 5,
      "rating": 95,
      "description": "Signature combat style and battle lore",
      "imageUrl": "",
      "metadata": {}
    }
  ]
}

### STRICT RULES
- Every fighter entry must have a unique string ID (e.g. "fighter-001", "fighter-002").
- Every entry must have a non-empty name without numbers inside the name (e.g. "Vikram", not "1. Vikram").
- No duplicate IDs and no duplicate fighter names.
- Base price suggestions:
  - Combat Rating 95–100: ₹5 Cr
  - Combat Rating 90–94: ₹4 Cr
  - Combat Rating 85–89: ₹3 Cr
  - Combat Rating 80–84: ₹2 Cr
  - Below 80: ₹1 Cr
- Numeric ratings must be between 0 and 100.
- Base prices must be positive numbers.
- Set maxSquadSize and minSquadSize according to the requested squad size.
- Include all four predefined franchises in "individual" budgets ("Nishanth", "Ajmal", "Praneeth", "Nagulan").
- Ensure total entries generated >= Number of teams × Squad size.
- Do NOT hardcode team selection in a way that prevents the user from overriding franchises or squad size in BIDBATTLE.
- Use valid JSON with double quotes.
- Provide an actual downloadable .json file. Validate the JSON before sharing the download link.
- State clearly that the output file is 100% compatible with BIDBATTLE Battle Arena and supports full setup customization upon import.`;

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
