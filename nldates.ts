import * as chrono from "chrono-node";
import { system } from "@silverbulletmd/silverbullet/syscalls";
import type { CompleteEvent } from "@silverbulletmd/silverbullet/type/client";

interface NLDatesConfig {
  dateFormat?: string;
  includeTime?: boolean;
  timezone?: string;
}

let cachedConfig: NLDatesConfig = {
  dateFormat: "yyyy-MM-dd HH:mm",
  includeTime: true,
  timezone: undefined,
};
let lastConfigUpdate = 0;

// Store recent parse results as a memory feature
interface ParseMemory {
  input: string;
  date: Date;
  hasTime: boolean;
  formatted: string;
}
let parseHistory: ParseMemory[] = [];
const MAX_PARSE_HISTORY = 4;

/**
 * Updates the configuration from the system settings
 */
async function updateConfig() {
  // Update at most every 5 seconds
  if (Date.now() < lastConfigUpdate + 5000) return;
  lastConfigUpdate = Date.now();
  
  const config = await system.getConfig("nldates");
  if (config) {
    cachedConfig = {
      dateFormat: config.dateFormat || "yyyy-MM-dd HH:mm",
      includeTime: config.includeTime !== false,
      timezone: config.timezone,
    };
  }
}

/**
 * Formats a date according to the configuration
 */
function formatDate(date: Date, hasTime: boolean): string {
  const format = cachedConfig.dateFormat || "yyyy-MM-dd HH:mm";
  
  // If the parsed result doesn't have time and includeTime is set, strip time from format
  let finalFormat = format;
  if (!hasTime && !cachedConfig.includeTime) {
    // Remove time-related format tokens
    finalFormat = format.replace(/\s*[HhKkmsSaAzZOXx:]+\s*/g, "").trim();
  }
  
  return formatDateWithPattern(date, finalFormat);
}

/**
 * Formats a date using Unicode date format patterns (simplified version)
 */
function formatDateWithPattern(date: Date, pattern: string): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthsShort = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const pad = (n: number, width: number = 2) => String(n).padStart(width, "0");

  const replacements: Record<string, () => string> = {
    "yyyy": () => String(date.getFullYear()),
    "yy": () => String(date.getFullYear()).slice(-2),
    "MMMM": () => months[date.getMonth()],
    "MMM": () => monthsShort[date.getMonth()],
    "MM": () => pad(date.getMonth() + 1),
    "M": () => String(date.getMonth() + 1),
    "dd": () => pad(date.getDate()),
    "d": () => String(date.getDate()),
    "EEEE": () => days[date.getDay()],
    "EEE": () => daysShort[date.getDay()],
    "HH": () => pad(date.getHours()),
    "H": () => String(date.getHours()),
    "hh": () => pad(date.getHours() % 12 || 12),
    "h": () => String(date.getHours() % 12 || 12),
    "mm": () => pad(date.getMinutes()),
    "m": () => String(date.getMinutes()),
    "ss": () => pad(date.getSeconds()),
    "s": () => String(date.getSeconds()),
    "a": () => date.getHours() >= 12 ? "PM" : "AM",
    "A": () => date.getHours() >= 12 ? "PM" : "AM",
  };

  let result = pattern;
  
  // Sort by length descending to match longer patterns first
  const sortedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    result = result.replace(new RegExp(key, "g"), replacements[key]());
  }

  return result;
}

/**
 * Main completion function for natural language dates
 */
export function nlDateCompleter(
  { linePrefix, pos, parentNodes }: CompleteEvent,
) {
  updateConfig(); // Async update, will be ready for next completion
  
  // Match !! prefix followed by any text (including spaces) until end of line
  // This allows "next thu" and other multi-word phrases
  const match = /!!(.*)$/.exec(linePrefix);
  if (!match) {
    return null;
  }
  
  // Check if we're not in a Lua directive or fenced code block
  if (
    parentNodes.find((node: string) =>
      node === "LuaDirective" || node.startsWith("FencedCode")
    )
  ) {
    return null;
  }
  
  const [fullMatch, naturalLanguageInput] = match;
  const currentDate = new Date();
  
  const options = [];
  let hasParseResult = false;
  
  // If there's input, try to parse it
  if (naturalLanguageInput && naturalLanguageInput.trim()) {
    // Parse with more lenient settings to handle partial input better
    const parseResults = chrono.parse(naturalLanguageInput, currentDate, {
      forwardDate: true, // Prefer future dates for ambiguous cases
    });
    
    if (parseResults.length > 0) {
      const result = parseResults[0];
      const parsedDate = result.start.date();
      
      // Check if time was specified
      const hasTime = result.start.isCertain("hour") || result.start.isCertain("minute");
      
      const formattedDate = formatDate(parsedDate, hasTime);
      
      // Add to parse history (deduplicate by formatted date to avoid similar dates)
      // Remove any existing entry with the same formatted output
      const existingIndex = parseHistory.findIndex(
        (h) => h.formatted === formattedDate
      );
      
      if (existingIndex !== -1) {
        // Remove the existing entry - we'll add the new one with updated input
        parseHistory.splice(existingIndex, 1);
      }
      
      // Add new entry at the front with the current input
      parseHistory.unshift({
        input: naturalLanguageInput.trim(),
        date: parsedDate,
        hasTime,
        formatted: formattedDate,
      });
      
      // Keep only last N items
      if (parseHistory.length > MAX_PARSE_HISTORY) {
        parseHistory = parseHistory.slice(0, MAX_PARSE_HISTORY);
      }
      
      hasParseResult = true;
    }
  }
  
  // Show parse history (most recent first)
  for (const item of parseHistory) {
    // Build human-readable detail
    let detailString = "📅 " + item.date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    // Add time if present
    if (item.hasTime) {
      detailString += " " + item.date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    
    // Add input in brackets
    detailString += ` [${item.input}]`;
    
    options.push({
      label: item.formatted,
      detail: detailString,
      type: "date",
      apply: item.formatted,
      boost: 100 - parseHistory.indexOf(item), // Most recent gets highest boost
    });
  }
  
  // Only show today/tomorrow/yesterday if no parse result
  if (!hasParseResult) {
    // Today
    options.push({
      label: formatDate(currentDate, false),
      detail: "📅 " + currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) + " [today]",
      type: "date",
      apply: formatDate(currentDate, false),
      boost: 10,
    });
    
    // Tomorrow
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    options.push({
      label: formatDate(tomorrow, false),
      detail: "📅 " + tomorrow.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) + " [tomorrow]",
      type: "date",
      apply: formatDate(tomorrow, false),
      boost: 9,
    });
    
    // Yesterday  
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    options.push({
      label: formatDate(yesterday, false),
      detail: "📅 " + yesterday.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) + " [yesterday]",
      type: "date",
      apply: formatDate(yesterday, false),
      boost: 8,
    });
  }
  
  return {
    from: pos - fullMatch.length,
    filter: false,
    options: options,
  };
}
