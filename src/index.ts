/**
 * index.ts
 *
 * Provides distance calculation utilities and a function to determine
 * if two login events (from the same user) are physically feasible
 * given a maximum speed constraint.
 */

import { LoginEvent, TravelPossibility } from './types';

/** Earth's average radius in kilometers (for the Haversine formula). */
const EARTH_RADIUS_KM = 6371;

/** Default maximum speed in km/h if not provided. */
const DEFAULT_MAX_SPEED_KMH = 1200;

/**
 * Validates latitude and longitude values.
 * @param lat Latitude of a location.
 * @param lon Longitude of a location.
 * @throws Will throw an error if latitude or longitude is out of valid range.
 */
function validateCoordinates(lat: number, lon: number) {
    if (lat < -90 || lat > 90) {
        throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
    }
    if (lon < -180 || lon > 180) {
        throw new Error(`Invalid longitude: ${lon}. Must be between -180 and 180.`);
    }
}

/**
 * Converts degrees to radians.
 * @param degrees Number of degrees.
 * @returns Number of radians.
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calculates the great-circle distance between two points using the Haversine formula.
 * @param lat1 Latitude of the first point in decimal degrees.
 * @param lon1 Longitude of the first point in decimal degrees.
 * @param lat2 Latitude of the second point in decimal degrees.
 * @param lon2 Longitude of the second point in decimal degrees.
 * @returns Distance in kilometers.
 */
function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    // Validate coordinates before calculation
    validateCoordinates(lat1, lon1);
    validateCoordinates(lat2, lon2);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.sin(dLon / 2) ** 2 *
            Math.cos(lat1Rad) *
            Math.cos(lat2Rad);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c; // Distance in kilometers
}

/**
 * Calculates the speed required to travel a certain distance within a given time.
 * @param distanceKm Distance in kilometers.
 * @param timeMinutes Time in minutes.
 * @returns Speed in kilometers per hour (km/h).
 */
function calculateRequiredSpeed(distanceKm: number, timeMinutes: number): number {
    if (timeMinutes <= 0) {
        // Impossible to travel any distance in zero or negative time
        return Infinity;
    }
    const timeHours = timeMinutes / 60;
    return distanceKm / timeHours;
}

/**
 * Determines if it's physically possible to travel between two login locations
 * within the time difference based on the maximum allowed speed.
 * @param login1 The first login event.
 * @param login2 The second login event.
 * @param maxSpeedKmh Maximum allowed speed in km/h. Defaults to 1200 km/h.
 * @param decimalPrecision Number of decimals to keep for the returned numeric values.
 * @returns An object indicating whether the travel is possible and relevant details.
 */
export function isTravelPossible(
    login1: LoginEvent,
    login2: LoginEvent,
    maxSpeedKmh: number = DEFAULT_MAX_SPEED_KMH,
    decimalPrecision: number = 2,
): TravelPossibility {
    // Validate timestamps
    if (!(login1.timestamp instanceof Date) || !(login2.timestamp instanceof Date)) {
        throw new Error('One or both login timestamps are invalid Date objects.');
    }

    // Determine the chronological order
    const earlierLogin = login1.timestamp <= login2.timestamp ? login1 : login2;
    const laterLogin = login1.timestamp > login2.timestamp ? login1 : login2;

    // Calculate time difference in minutes
    const timeDiffMs = laterLogin.timestamp.getTime() - earlierLogin.timestamp.getTime();
    const timeDiffMinutes = timeDiffMs / (1000 * 60); // Convert milliseconds to minutes

    // If time difference is zero
    if (timeDiffMinutes === 0) {
        const sameLocation =
            earlierLogin.latitude === laterLogin.latitude &&
            earlierLogin.longitude === laterLogin.longitude;

        if (sameLocation) {
            // Same location => no speed needed
            return {
                possible: true,
                requiredSpeedKmh: 0,
                maxAllowedSpeedKmh: maxSpeedKmh,
                distanceKm: 0,
                timeDifferenceMinutes: 0,
            };
        } else {
            // Different location => impossible
            const distanceKm = haversineDistance(
                earlierLogin.latitude,
                earlierLogin.longitude,
                laterLogin.latitude,
                laterLogin.longitude,
            );
            return {
                possible: false,
                requiredSpeedKmh: Infinity,
                maxAllowedSpeedKmh: maxSpeedKmh,
                distanceKm: parseFloat(distanceKm.toFixed(decimalPrecision)),
                timeDifferenceMinutes: 0,
            };
        }
    }

    // Calculate the distance (km)
    const distanceKm = haversineDistance(
        earlierLogin.latitude,
        earlierLogin.longitude,
        laterLogin.latitude,
        laterLogin.longitude,
    );

    // Calculate the required speed (km/h)
    const requiredSpeed = calculateRequiredSpeed(distanceKm, timeDiffMinutes);

    // Determine if the required speed is within the allowed max speed
    const possible = requiredSpeed <= maxSpeedKmh;

    // Return a structured result
    return {
        possible,
        requiredSpeedKmh: parseFloat(requiredSpeed.toFixed(decimalPrecision)),
        maxAllowedSpeedKmh: maxSpeedKmh,
        distanceKm: parseFloat(distanceKm.toFixed(decimalPrecision)),
        timeDifferenceMinutes: parseFloat(timeDiffMinutes.toFixed(decimalPrecision)),
    };
}