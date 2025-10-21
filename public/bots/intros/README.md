# Bot Introduction Audio Files

Place your bot introduction WAV/MP3 files here.

## File Naming Convention

Files should be named: `{bot-slug}-intro.wav` or `{bot-slug}-intro.mp3`

Examples:
- `bee-bot-intro.wav`
- `chef-bot-intro.mp3`
- `fit-bot-intro.wav`
- `boss-bot-intro.wav`

## Audio Specifications

**Recommended Format:**
- Format: WAV or MP3
- Sample Rate: 44.1kHz or 48kHz
- Bit Depth: 16-bit or 24-bit
- Duration: 5-15 seconds
- File Size: Keep under 1MB for fast loading

## Recording Tips

**Content Ideas:**
- "Hi, I'm Bee Bot! I'm your expert beekeeping assistant..."
- "Welcome! I'm Chef Bot, here to help you cook amazing meals..."
- "Hey there! Fit Bot ready to help you crush your fitness goals!"

**Tone:**
- Match bot personality (friendly, professional, energetic, etc.)
- Clear pronunciation
- Enthusiastic but not over-the-top
- Include what the bot specializes in

## Current Bots Needing Intros

- bee-bot
- boss-bot
- chef-bot
- fit-bot
- game-bot
- garden-bot
- art-bot
- brewster-bot
- equi-bot
- scout-bot
- melody-bot
- fishing-bot
- diy-bot

## After Adding Files

Update `prisma/seed.ts` to include the audio URLs for each bot.

