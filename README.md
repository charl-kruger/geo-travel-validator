# Travel Verification Package

This package provides a set of functions to determine whether two events (e.g., login attempts) from the same user could realistically come from that user based on their geographic location and the time difference between events. It uses the Haversine formula to calculate the distance between two latitude/longitude coordinates and checks whether the required travel speed stays below a configurable threshold.

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API Reference](#api-reference)
5. [Examples](#examples)
6. [Configuration](#configuration)
7. [Error Handling](#error-handling)
8. [License](#license)

---

## Features

- Haversine distance calculation for precise geographic distance in kilometers.
- Automatic valid range checks for latitude and longitude.
- Easy configuration of a maximum allowed travel speed (in km/h).
- Structured results indicating if travel is possible, the distance between events, and the speed required.
- Handles edge cases such as zero time difference, negative time intervals, and out-of-range coordinates.

---

## Installation

You can install this package via npm:

```bash
npm install geo-travel-validator
```

Or with Yarn:

```bash
yarn add geo-travel-validator
```

---

## Usage

Import the main function in your TypeScript (or JavaScript) file:

```typescript
import { isTravelPossible } from "geo-travel-validator";

const event1 = {
  latitude: 40.7128,
  longitude: -74.006,
  timestamp: new Date("2023-01-01T12:00:00Z"),
};

const event2 = {
  latitude: 34.0522,
  longitude: -118.2437,
  timestamp: new Date("2023-01-01T16:00:00Z"),
};

const result = isTravelPossible(event1, event2, 900);
// The third argument is the maximum allowed speed in km/h, default is 1200.
console.log(result);
```

---

## API Reference

### 1. isTravelPossible(login1, login2, maxSpeedKmh?, decimalPrecision?)

• **Description:**  
Determines if it's physically possible for the same user to travel from one location to the other in the given timeframe.

• **Parameters:**

1. `login1` (LoginEvent) – Contains `userId`, `latitude`, `longitude`, and a `timestamp` (Date object).
2. `login2` (LoginEvent) – Same structure as `login1`; must have the same `userId`.
3. `maxSpeedKmh` (number, optional) – The maximum allowed travel speed in km/h. Defaults to 1200.
4. `decimalPrecision` (number, optional) – Rounds numerical results to this many decimal places. Defaults to 2.

• **Returns:**  
A `TravelPossibility` object with the following fields:

- `possible`: boolean – `true` if travel is possible within the max speed constraint.
- `requiredSpeedKmh`: number – The speed needed (km/h).
- `maxAllowedSpeedKmh`: number – The max speed you passed in.
- `distanceKm`: number – Calculated distance in kilometers.
- `timeDifferenceMinutes`: number – The difference in minutes between the two timestamps.

### 2. Internal Utility Functions

• **haversineDistance(lat1, lon1, lat2, lon2): number**

- Calculates the distance between two sets of coordinates using the Haversine formula.

• **calculateRequiredSpeed(distanceKm, timeMinutes): number**

- Determines the speed in km/h required to cover the given distance in the specified time.

You typically won't call these directly unless you're building custom validations outside the main function.

---

## Examples

Below are some typical usage scenarios:

1. **Same location, same timestamp**  
   If both events occur at the exact same coordinates and same timestamp, `isTravelPossible` will return `{ possible: true, requiredSpeedKmh: 0, ... }`.

2. **Negative or zero time difference**

   - Zero time difference and different coordinates → The script deems it impossible (speed required is Infinity).
   - Negative time difference (e.g., if the second event's timestamp is earlier due to clock discrepancies) → The function determines the earliest event and returns results accordingly.

3. **Out-of-range coordinates**  
   If either latitude is not between -90 and 90 or longitude is not between -180 and 180, you'll get an error.

---

## Configuration

- **maxSpeedKmh**: Adjust the maximum speed you consider physically possible. For example, to allow supersonic travel, set it to 1200 km/h or above.
- **decimalPrecision**: Decide how many decimal places you want in your results for speed, distance, and time difference.

---

## Error Handling

- If `login1.userId` differs from `login2.userId`, an error is thrown indicating mismatched user IDs.
- Invalid lat/long values or non-`Date` timestamps result in detailed errors to help you diagnose the issue.

---

## License

MIT License. See the [LICENSE](./LICENSE) file for more details.
