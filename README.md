# Natural Language Dates Plug for SilverBullet

A SilverBullet plug that provides natural language date and time completion.

## Requirements

- SilverBullet 2.0.0 or higher
- Uses the powerful [chrono](https://github.com/wanasit/chrono) library for date parsing

## Usage

1. Type `!!` followed by a natural language date
2. A completion popup appears with your parsed dates (with memory) or quick options
3. Examples:
   - `!!tomorrow` → Shows tomorrow's date with `[tomorrow]` label
   - `!!next friday 2pm` → Shows next Friday at 2 PM with time
   - `!!next thu` → Parses to next Thursday, then typing `2pm` updates it
   - `!!in 3 weeks` → Shows date 3 weeks from now
   - `!!last monday` → Shows last Monday's date
   - `!!dec 25` → Shows December 25th of current year
   - `!!` (empty) → Shows today/tomorrow/yesterday options
4. Press `Enter` to insert the formatted date
5. Press `Escape` to cancel

- **Configurable Output**: Customize date/time format to your preference

## Installation & Configuration

1. Open your SilverBullet space
2. Run the command: `Plugs: Add`
3. Add the plug by URL or copy the `nldates.plug.js` file to your `_plug` folder

Add to your `SETTINGS` page:

```yaml
nldates:
  # Output format for dates (using Unicode date format patterns)
  # Default: "yyyy-MM-dd HH:mm"
  dateFormat: "yyyy-MM-dd"
  
  # Include time in output if parsed (default: true)
  includeTime: true
  
  # Timezone (default: system timezone)
  timezone: "America/New_York"
```

## Date Format Patterns

- `yyyy-MM-dd` → 2025-10-05
- `MMM d, yyyy` → Oct 5, 2025
- `EEEE, MMMM d, yyyy` → Sunday, October 5, 2025
- `yyyy-MM-dd HH:mm` → 2025-10-05 14:30
- `h:mm a` → 2:30 PM

## Build from Source

```bash
deno task build
```

